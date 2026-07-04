import { useState, useMemo, useCallback } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Users, Search, Check, XCircle, UserPlus, Clock, RotateCcw,
  LayoutGrid, List, SortAsc, SortDesc, Filter, X,
  CheckSquare, Square, AlertCircle, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RelationType } from '@/types';

// ===== 排序类型 =====
type SortKey = 'name' | 'school' | 'grade' | 'online' | 'relation';
type SortDir = 'asc' | 'desc';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: '姓名' },
  { key: 'school', label: '学校' },
  { key: 'grade', label: '年级' },
  { key: 'online', label: '在线状态' },
  { key: 'relation', label: '关系' },
];

// ===== 筛选 Tab =====
type FilterTab = 'all' | 'friends' | 'pending' | 'suggested' | 'online';
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'friends', label: '好友' },
  { key: 'pending', label: '待处理' },
  { key: 'suggested', label: '可添加' },
  { key: 'online', label: '在线' },
];

// ===== 关系标签 =====
function RelationBadge({ relation }: { relation: RelationType }) {
  switch (relation) {
    case 'friend':
      return <span className="inline-flex items-center gap-0.5 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full"><Check size={8} /> 好友</span>;
    case 'pending_sent':
      return <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full"><Clock size={8} /> 待确认</span>;
    case 'pending_received':
      return <span className="inline-flex items-center gap-0.5 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full"><Clock size={8} /> 待你确认</span>;
    case 'rejected':
      return <span className="inline-flex items-center gap-0.5 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full"><XCircle size={8} /> 被拒</span>;
    case 'rejected_them':
      return <span className="inline-flex items-center gap-0.5 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full"><XCircle size={8} /> 已拒</span>;
    default:
      return <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">未添加</span>;
  }
}

// ===== 关系排序权重 =====
const RELATION_ORDER: Record<RelationType, number> = {
  self: 0, friend: 1, pending_received: 2, pending_sent: 3, rejected_them: 4, rejected: 5, none: 6,
};

export default function Classmates() {
  const {
    currentUserId, users, getRelation, getFriendsOf, getPendingReceived, getPendingSent,
    friendships, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, rejectFriendRequest,
    batchSendFriendRequests, getClassmateStats, getMutualFriends, photos, posts,
  } = useSocialStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 状态
  const [searchKw, setSearchKw] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const stats = getClassmateStats();

  // 构建同学列表（排除自己）
  const classmates = useMemo(() => {
    let list = users.filter(u => u.id !== currentUserId);

    // 搜索
    if (searchKw.trim()) {
      const kw = searchKw.toLowerCase().trim();
      list = list.filter(u =>
        u.name.toLowerCase().includes(kw) || u.school.toLowerCase().includes(kw) ||
        u.className.toLowerCase().includes(kw) || u.grade.toLowerCase().includes(kw)
      );
    }

    // Tab 筛选
    switch (activeTab) {
      case 'friends':
        list = list.filter(u => getRelation(u.id) === 'friend');
        break;
      case 'pending':
        list = list.filter(u => {
          const r = getRelation(u.id);
          return r === 'pending_sent' || r === 'pending_received';
        });
        break;
      case 'suggested':
        list = list.filter(u => {
          const r = getRelation(u.id);
          return r === 'none' || r === 'rejected' || r === 'rejected_them';
        });
        break;
      case 'online':
        list = list.filter(u => u.online);
        break;
    }

    // 排序
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name, 'zh'); break;
        case 'school': cmp = a.school.localeCompare(b.school, 'zh') || a.className.localeCompare(b.className, 'zh'); break;
        case 'grade': cmp = a.grade.localeCompare(b.grade, 'zh'); break;
        case 'online': cmp = (b.online ? 1 : 0) - (a.online ? 1 : 0); break;
        case 'relation': cmp = RELATION_ORDER[getRelation(a.id)] - RELATION_ORDER[getRelation(b.id)]; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [users, currentUserId, searchKw, activeTab, sortKey, sortDir, getRelation, friendships]);

  // 可选中的用户（仅未添加/被拒/已拒）
  const selectableIds = useMemo(() => {
    return classmates
      .filter(u => { const r = getRelation(u.id); return r === 'none' || r === 'rejected' || r === 'rejected_them'; })
      .map(u => u.id);
  }, [classmates, getRelation, friendships]);

  const allSelectableSelected = selectableIds.length > 0 && selectableIds.every(id => selectedIds.has(id));

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelectableSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableIds));
    }
  }, [allSelectableSelected, selectableIds]);

  const handleBatchSend = () => {
    const ids = Array.from(selectedIds).filter(id => selectableIds.includes(id));
    if (ids.length === 0) {
      showToast('请先选择要添加的同学', 'info');
      return;
    }
    const result = batchSendFriendRequests(ids);
    showToast(`已发送 ${result.sent} 条好友申请${result.skipped > 0 ? `，跳过 ${result.skipped} 条` : ''}`);
    setSelectedIds(new Set());
    setShowBatchConfirm(false);
  };

  const handleSingleSend = (userId: string, name: string) => {
    sendFriendRequest(userId);
    showToast(`已向 ${name} 发送好友申请`);
  };

  const handleCancel = (friendId: string) => {
    cancelFriendRequest(friendId);
    showToast('已取消好友申请');
  };

  const handleAccept = (userId: string, name: string) => {
    acceptFriendRequest(userId);
    showToast(`已通过 ${name} 的好友申请`);
  };

  const handleReject = (userId: string, name: string) => {
    rejectFriendRequest(userId);
    showToast(`已拒绝 ${name} 的好友申请`);
  };

  const clearFilters = () => {
    setSearchKw('');
    setActiveTab('all');
    setSortKey('name');
    setSortDir('asc');
    setSelectedIds(new Set());
  };

  const hasAnyFilter = searchKw.trim() || activeTab !== 'all' || sortKey !== 'name' || sortDir !== 'asc';

  // Tab 数量
  const tabCounts = useMemo(() => ({
    all: stats.total,
    friends: stats.friends,
    pending: stats.pendingSent + stats.pendingReceived,
    suggested: stats.none,
    online: stats.online,
  }), [stats]);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <div className="pt-14 max-w-5xl mx-auto px-4 py-6">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-4">
          <Users size={22} className="text-[#3B5998]" />
          <h1 className="text-lg font-bold text-gray-800">同学录</h1>
          <span className="text-xs text-gray-400 ml-1">共 {stats.total} 位同学</span>
        </div>

        {/* 统计条 */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[
            { label: '好友', value: stats.friends, color: 'bg-green-50 text-green-700 border-green-200' },
            { label: '待处理', value: stats.pendingReceived, color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: '已发出', value: stats.pendingSent, color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { label: '可添加', value: stats.none, color: 'bg-gray-50 text-gray-600 border-gray-200' },
            { label: '在线', value: stats.online, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg border p-2.5 text-center ${s.color}`}>
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-[10px]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 搜索/排序/视图工具栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchKw}
                onChange={e => setSearchKw(e.target.value)}
                placeholder="搜索姓名、学校、院系、年级..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3B5998] transition-colors"
              />
              {searchKw && (
                <button onClick={() => setSearchKw('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
              className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-2.5 py-2 hover:bg-gray-50 transition-colors"
              title={viewMode === 'card' ? '切换列表视图' : '切换卡片视图'}
            >
              {viewMode === 'card' ? <List size={14} /> : <LayoutGrid size={14} />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 排序 */}
            <span className="text-gray-400">排序：</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => { if (sortKey === opt.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(opt.key); setSortDir('asc'); } }}
                className={`flex items-center gap-0.5 px-2 py-1 rounded-full border transition-colors ${sortKey === opt.key ? 'bg-[#3B5998] text-white border-[#3B5998]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                {opt.label}
                {sortKey === opt.key && (sortDir === 'asc' ? <SortAsc size={10} /> : <SortDesc size={10} />)}
              </button>
            ))}

            <span className="text-gray-300 mx-1">|</span>

            {/* 批量选择 */}
            {activeTab === 'suggested' || activeTab === 'all' ? (
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-0.5 px-2 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-[#3B5998] hover:text-[#3B5998] transition-colors"
              >
                {allSelectableSelected ? <CheckSquare size={12} className="text-[#3B5998]" /> : <Square size={12} />}
                {allSelectableSelected ? '取消全选' : '全选可添加'}
              </button>
            ) : null}

            {hasAnyFilter && (
              <button onClick={clearFilters} className="flex items-center gap-0.5 text-gray-400 hover:text-red-500 transition-colors ml-auto">
                <X size={12} /> 清除筛选
              </button>
            )}
          </div>
        </div>

        {/* Tab 筛选 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()); }}
                className={`flex items-center gap-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab.key ? 'text-[#3B5998]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${activeTab === tab.key ? 'bg-[#3B5998] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {tabCounts[tab.key]}
                </span>
                {activeTab === tab.key && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#3B5998] rounded-full" />}
              </button>
            ))}
          </div>

          {/* 批量操作栏 */}
          {selectedIds.size > 0 && (
            <div className="px-4 py-2.5 bg-[#3B5998]/5 border-b border-[#3B5998]/10 flex items-center gap-3">
              <span className="text-xs text-[#3B5998] font-medium">已选 {selectedIds.size} 人</span>
              <button
                onClick={() => setShowBatchConfirm(true)}
                className="flex items-center gap-1 text-xs bg-[#3B5998] text-white rounded-full px-3 py-1.5 hover:bg-[#2A4A7F] transition-colors"
              >
                <UserPlus size={12} /> 批量加好友
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                取消选择
              </button>
            </div>
          )}

          {/* 列表内容 */}
          <div className="p-4">
            {classmates.length > 0 ? (
              viewMode === 'card' ? (
                <div className="grid grid-cols-2 gap-3">
                  {classmates.map(user => {
                    const relation = getRelation(user.id);
                    const mutualFriends = getMutualFriends(user.id);
                    const userPhotos = photos.filter(p => p.ownerId === user.id);
                    const userPosts = posts.filter(p => p.authorId === user.id);
                    const isSelected = selectedIds.has(user.id);
                    const isSelectable = relation === 'none' || relation === 'rejected' || relation === 'rejected_them';

                    return (
                      <div key={user.id} className={`bg-white rounded-lg border p-3 hover:shadow-md transition-all ${isSelected ? 'border-[#3B5998] ring-1 ring-[#3B5998]/20' : 'border-gray-200'}`}>
                        <div className="flex items-start gap-2.5">
                          {/* 选择框 */}
                          {isSelectable && (
                            <button onClick={() => toggleSelect(user.id)} className="mt-1 shrink-0">
                              {isSelected ? <CheckSquare size={14} className="text-[#3B5998]" /> : <Square size={14} className="text-gray-300 hover:text-[#3B5998]" />}
                            </button>
                          )}
                          {!isSelectable && <div className="w-3.5 shrink-0" />}

                          {/* 头像 */}
                          <button onClick={() => navigate(`/profile/${user.id}`)} className="shrink-0 relative">
                            <Avatar userId={user.id} size={44} />
                            {user.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />}
                          </button>

                          {/* 信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => navigate(`/profile/${user.id}`)} className="text-sm font-semibold text-[#3B5998] hover:underline">{user.name}</button>
                              <RelationBadge relation={relation} />
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">{user.school} · {user.className} · {user.grade}</div>
                            {mutualFriends.length > 0 && relation !== 'self' && (
                              <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-0.5">
                                <Users size={8} /> {mutualFriends.length} 位共同好友
                              </div>
                            )}
                            <div className="text-[10px] text-gray-300 mt-0.5">{userPosts.length} 动态 · {userPhotos.length} 照片</div>

                            {/* 操作按钮 */}
                            <div className="mt-1.5 flex items-center gap-1.5">
                              {relation === 'none' || relation === 'rejected' || relation === 'rejected_them' ? (
                                <button onClick={() => handleSingleSend(user.id, user.name)} className="flex items-center gap-0.5 text-[10px] bg-[#3B5998] text-white rounded-full px-2.5 py-1 hover:bg-[#2A4A7F] transition-colors">
                                  <UserPlus size={10} /> 加好友
                                </button>
                              ) : relation === 'pending_sent' ? (
                                <button onClick={() => handleCancel(user.id)} className="text-[10px] text-amber-500 hover:text-amber-600">取消申请</button>
                              ) : relation === 'pending_received' ? (
                                <>
                                  <button onClick={() => handleAccept(user.id, user.name)} className="text-[10px] bg-[#3B5998] text-white rounded-full px-2.5 py-1 hover:bg-[#2A4A7F]">通过</button>
                                  <button onClick={() => handleReject(user.id, user.name)} className="text-[10px] text-gray-400 hover:text-red-500">拒绝</button>
                                </>
                              ) : relation === 'friend' ? (
                                <span className="text-[10px] text-green-500">已是好友</span>
                              ) : null}
                              <button onClick={() => navigate(`/profile/${user.id}`)} className="text-[10px] text-[#3B5998] hover:underline ml-auto">主页</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 列表视图 */
                <div className="divide-y divide-gray-100">
                  {classmates.map(user => {
                    const relation = getRelation(user.id);
                    const isSelected = selectedIds.has(user.id);
                    const isSelectable = relation === 'none' || relation === 'rejected' || relation === 'rejected_them';

                    return (
                      <div key={user.id} className={`flex items-center gap-3 py-2.5 px-2 hover:bg-gray-50 transition-colors rounded ${isSelected ? 'bg-[#3B5998]/5' : ''}`}>
                        {isSelectable && (
                          <button onClick={() => toggleSelect(user.id)} className="shrink-0">
                            {isSelected ? <CheckSquare size={14} className="text-[#3B5998]" /> : <Square size={14} className="text-gray-300 hover:text-[#3B5998]" />}
                          </button>
                        )}
                        {!isSelectable && <div className="w-3.5 shrink-0" />}

                        <button onClick={() => navigate(`/profile/${user.id}`)} className="shrink-0 relative">
                          <Avatar userId={user.id} size={32} />
                          {user.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />}
                        </button>

                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <button onClick={() => navigate(`/profile/${user.id}`)} className="text-sm font-medium text-gray-800 hover:underline truncate">{user.name}</button>
                          <span className="text-[11px] text-gray-400 truncate">{user.school} · {user.className}</span>
                          <RelationBadge relation={relation} />
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {relation === 'none' || relation === 'rejected' || relation === 'rejected_them' ? (
                            <button onClick={() => handleSingleSend(user.id, user.name)} className="flex items-center gap-0.5 text-[10px] bg-[#3B5998] text-white rounded-full px-2.5 py-1 hover:bg-[#2A4A7F] transition-colors">
                              <UserPlus size={10} /> 加好友
                            </button>
                          ) : relation === 'pending_sent' ? (
                            <button onClick={() => handleCancel(user.id)} className="text-[10px] text-amber-500 hover:text-amber-600">取消</button>
                          ) : relation === 'pending_received' ? (
                            <>
                              <button onClick={() => handleAccept(user.id, user.name)} className="text-[10px] bg-[#3B5998] text-white rounded-full px-2.5 py-1">通过</button>
                              <button onClick={() => handleReject(user.id, user.name)} className="text-[10px] text-gray-400 hover:text-red-500">拒绝</button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="py-10 text-center">
                <Users size={40} className="text-gray-200 mx-auto mb-3" />
                {searchKw.trim() ? (
                  <>
                    <p className="text-gray-400 text-sm mb-1">未找到匹配「{searchKw}」的同学</p>
                    <button onClick={() => setSearchKw('')} className="text-xs text-[#3B5998] hover:underline">清除搜索</button>
                  </>
                ) : activeTab !== 'all' ? (
                  <>
                    <p className="text-gray-400 text-sm mb-1">
                      {activeTab === 'friends' ? '暂无好友' : activeTab === 'pending' ? '暂无待处理申请' : activeTab === 'suggested' ? '暂无可添加的同学' : '暂无在线同学'}
                    </p>
                    <button onClick={() => setActiveTab('all')} className="text-xs text-[#3B5998] hover:underline">查看全部同学</button>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">暂无同学数据</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 批量操作确认弹窗 */}
      <ConfirmDialog
        open={showBatchConfirm}
        title="批量添加好友"
        message={`确定要向 ${selectedIds.size} 位同学发送好友申请吗？已是好友或已有申请的会被自动跳过。`}
        confirmLabel="确认发送"
        onConfirm={handleBatchSend}
        onCancel={() => setShowBatchConfirm(false)}
      />
    </div>
  );
}
