import { useState, useMemo, useEffect } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import type { Visibility, RelationType, User } from '@/types';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import {
  Search, UserPlus, Check, Users, AlertCircle, Clock, XCircle,
  RotateCcw, X, Filter, Globe, Lock, Eye, Image, FileText,
  MessageSquare, ChevronRight, CircleDot, Shield
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ===== 筛选Tab类型 =====
type FilterTab = 'all' | 'friends' | 'pending' | 'suggested' | 'photoActive';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部同学' },
  { key: 'friends', label: '我的好友' },
  { key: 'pending', label: '待处理申请' },
  { key: 'suggested', label: '可能认识' },
  { key: 'photoActive', label: '最近发照片' },
];

// ===== 动态可见性筛选 =====
type PostVisFilter = 'all_visible' | 'public' | 'friends' | 'self';

const POST_VIS_FILTERS: { key: PostVisFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'all_visible', label: '我能看到的', icon: <Eye size={14} /> },
  { key: 'public', label: '公开', icon: <Globe size={14} /> },
  { key: 'friends', label: '好友可见', icon: <Users size={14} /> },
  { key: 'self', label: '仅自己可见', icon: <Lock size={14} /> },
];

// ===== 搜索结果中的好友按钮 =====
function SearchFriendButton({ userId, userName }: { userId: string; userName: string }) {
  const { getRelation, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, rejectFriendRequest, restrictUser, unrestrictUser } = useSocialStore();
  const { showToast } = useToast();
  const relation = getRelation(userId);

  const handleSend = () => {
    const currentRel = getRelation(userId);
    if (currentRel === 'friend') {
      showToast('你们已经是好友了', 'info');
      return;
    }
    if (currentRel === 'pending_sent') {
      showToast('已发送过申请，请等待对方确认', 'info');
      return;
    }
    if (currentRel === 'restricted') {
      showToast('你已限制该用户，请先解除限制', 'info');
      return;
    }
    if (currentRel !== 'none' && currentRel !== 'rejected' && currentRel !== 'rejected_them') {
      showToast('当前状态不允许发送好友申请', 'info');
      return;
    }
    sendFriendRequest(userId);
    showToast(`已向 ${userName} 发送好友申请`);
  };
  const handleCancel = () => {
    const currentRel = getRelation(userId);
    if (currentRel !== 'pending_sent') {
      showToast('没有可取消的申请', 'info');
      return;
    }
    cancelFriendRequest(userId);
    showToast('已取消好友申请');
  };
  const handleAccept = () => {
    const currentRel = getRelation(userId);
    if (currentRel !== 'pending_received') {
      showToast('该申请已处理或不存在', 'info');
      return;
    }
    acceptFriendRequest(userId);
    showToast(`已通过 ${userName} 的好友申请`);
  };
  const handleReject = () => {
    const currentRel = getRelation(userId);
    if (currentRel !== 'pending_received') {
      showToast('该申请已处理或不存在', 'info');
      return;
    }
    rejectFriendRequest(userId);
    showToast(`已拒绝 ${userName} 的好友申请`);
  };
  const handleRestrict = () => {
    restrictUser(userId);
    showToast(`已将 ${userName} 加入受限列表`);
  };
  const handleUnrestrict = () => {
    unrestrictUser(userId);
    showToast(`已将 ${userName} 移出受限列表`);
  };

  switch (relation) {
    case 'friend':
      return (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 rounded-full px-3 py-1.5">
            <Check size={14} /> 好友
          </div>
          <button onClick={handleRestrict} className="text-[10px] text-gray-300 hover:text-orange-400 flex items-center gap-0.5">
            <Shield size={8} /> 限制
          </button>
        </div>
      );
    case 'pending_sent':
      return (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded-full px-3 py-1.5">
            <Clock size={14} /> 待确认
          </div>
          <button onClick={handleCancel} className="text-[10px] text-gray-400 hover:text-gray-600">取消申请</button>
        </div>
      );
    case 'pending_received':
      return (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 rounded-full px-3 py-1.5">
            <Clock size={14} /> 待你确认
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleAccept} className="text-[10px] text-[#3B5998] hover:underline">通过</button>
            <button onClick={handleReject} className="text-[10px] text-gray-400 hover:text-red-500">拒绝</button>
          </div>
        </div>
      );
    case 'restricted':
      return (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 rounded-full px-3 py-1.5">
            <Shield size={14} /> 已限制
          </div>
          <button onClick={handleUnrestrict} className="text-[10px] text-green-400 hover:text-green-600">解除限制</button>
        </div>
      );
    case 'rejected':
      return (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-red-500 bg-red-50 rounded-full px-3 py-1.5">
            <XCircle size={14} /> 被拒
          </div>
          <button onClick={handleSend} className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-[#3B5998]">
            <RotateCcw size={8} /> 重新申请
          </button>
        </div>
      );
    case 'rejected_them':
      return (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-orange-500 bg-orange-50 rounded-full px-3 py-1.5">
            <XCircle size={14} /> 已拒
          </div>
          <button onClick={handleSend} className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-[#3B5998]">
            <RotateCcw size={8} /> 重新申请
          </button>
        </div>
      );
    case 'none':
    default:
      return (
        <button
          onClick={handleSend}
          className="flex items-center gap-1 text-xs bg-[#3B5998] text-white rounded-full px-3 py-1.5 hover:bg-[#2A4A7F] transition-colors"
        >
          <UserPlus size={14} /> 加好友
        </button>
      );
  }
}

// ===== 搜索结果卡片 =====
function SearchResultCard({ user }: { user: User }) {
  const { getRelation, getMutualFriends, getVisiblePhotos, getVisiblePosts, photos, posts } = useSocialStore();
  const navigate = useNavigate();
  const relation = getRelation(user.id);
  const mutualFriends = getMutualFriends(user.id);
  const visiblePhotos = getVisiblePhotos(user.id);
  const visiblePosts = getVisiblePosts(user.id);
  // 最近评论：从该用户的可见动态中找评论
  const recentPhotoCount = visiblePhotos.length;
  const recentPostCount = visiblePosts.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(`/profile/${user.id}`)} className="shrink-0 relative">
          <Avatar userId={user.id} size={52} />
          {user.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" title="在线" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/profile/${user.id}`)}
              className="text-sm font-semibold text-[#3B5998] hover:underline"
            >
              {user.name}
            </button>
            {!user.online && <span className="text-[10px] text-gray-300">离线</span>}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{user.school} · {user.className} · {user.grade}</div>
          <p className="text-xs text-gray-400 mt-0.5 italic truncate">"{user.signature}"</p>

          {/* 共同好友 */}
          {mutualFriends.length > 0 && relation !== 'self' && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
              <Users size={10} />
              <span>{mutualFriends.length} 位共同好友</span>
              <span className="text-gray-300">·</span>
              {mutualFriends.slice(0, 2).map((mf, i) => (
                <span key={mf.id} className="text-[#3B5998]">{mf.name}{i < Math.min(mutualFriends.length, 2) - 1 ? '、' : ''}</span>
              ))}
              {mutualFriends.length > 2 && <span>等</span>}
            </div>
          )}

          {/* 可见照片/动态摘要 */}
          <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-0.5"><Image size={10} /> {recentPhotoCount} 张可见照片</span>
            <span className="flex items-center gap-0.5"><FileText size={10} /> {recentPostCount} 条可见动态</span>
          </div>

          {/* 操作按钮行 */}
          <div className="mt-2 flex items-center gap-2">
            <SearchFriendButton userId={user.id} userName={user.name} />
            <button
              onClick={() => navigate(`/profile/${user.id}`)}
              className="flex items-center gap-0.5 text-[10px] text-[#3B5998] hover:underline"
            >
              查看主页 <ChevronRight size={10} />
            </button>
            {visiblePosts.length > 0 && (
              <button
                onClick={() => navigate(`/profile/${user.id}`)}
                className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-[#3B5998]"
              >
                <MessageSquare size={10} /> 最近评论
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 主搜索页面 =====
export default function SearchPage() {
  const store = useSocialStore();
  const { searchUsers, getFriendsOf, currentUserId, users, getRelation, getPendingReceived, getPendingSent, photos, getVisiblePosts, getVisiblePhotos, getMutualFriends, friendships } = store;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 搜索状态
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [searchField, setSearchField] = useState<'all' | 'name' | 'school' | 'grade'>('all');
  const [filterOnline, setFilterOnline] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!searchParams.get('q'));
  const [results, setResults] = useState<User[]>([]);

  // 组合筛选
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // 动态照片流筛选
  const [postVisFilter, setPostVisFilter] = useState<PostVisFilter>('all_visible');
  const [postKeyword, setPostKeyword] = useState('');
  const [showPostFilter, setShowPostFilter] = useState(false);

  const friends = getFriendsOf(currentUserId);
  const pendingReceived = getPendingReceived();
  const pendingSent = getPendingSent();

  // 执行搜索
  const doSearch = (kw?: string) => {
    const q = kw ?? keyword;
    if (!q.trim()) {
      showToast('请输入搜索关键词', 'info');
      return;
    }
    if (q.trim().length < 2) {
      showToast('搜索关键词至少2个字符', 'info');
      return;
    }
    const found = searchUsers(q);
    setResults(found);
    setHasSearched(true);
    setActiveTab('all');
  };

  // 从首页带参数搜索
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setKeyword(q);
      const found = searchUsers(q);
      setResults(found);
      setHasSearched(true);
    }
  }, [searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
  };

  // 组合筛选：根据tab过滤搜索结果
  const filteredResults = useMemo(() => {
    let list = results;
    // 在线筛选
    if (filterOnline) {
      list = list.filter(u => u.online);
    }
    // 搜索字段筛选
    if (searchField !== 'all') {
      const kw = keyword.toLowerCase().trim();
      list = list.filter(u => {
        switch (searchField) {
          case 'name': return u.name.toLowerCase().includes(kw);
          case 'school': return u.school.toLowerCase().includes(kw) || u.className.toLowerCase().includes(kw);
          case 'grade': return u.grade.toLowerCase().includes(kw);
          default: return true;
        }
      });
    }
    // tab筛选
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
      case 'photoActive':
        list = list.filter(u => {
          const userPhotos = photos.filter(p => p.ownerId === u.id);
          return userPhotos.length > 0;
        });
        break;
    }
    return list;
  }, [results, activeTab, filterOnline, searchField, keyword, getRelation, photos, friendships]);

  // 默认同学列表（未搜索时）
  const defaultUserList = useMemo(() => {
    let list = users.filter(u => u.id !== currentUserId);
    switch (activeTab) {
      case 'friends':
        list = list.filter(u => getRelation(u.id) === 'friend');
        break;
      case 'pending': {
        const allPending = [...pendingReceived.map(p => p.userId), ...pendingSent.map(p => p.friendId)];
        list = list.filter(u => allPending.includes(u.id));
        break;
      }
      case 'suggested':
        list = list.filter(u => {
          const r = getRelation(u.id);
          return r === 'none' || r === 'rejected' || r === 'rejected_them';
        });
        break;
      case 'photoActive':
        list = list.filter(u => photos.some(p => p.ownerId === u.id));
        break;
    }
    if (filterOnline) {
      list = list.filter(u => u.online);
    }
    return list;
  }, [users, currentUserId, activeTab, filterOnline, getRelation, pendingReceived, pendingSent, photos, friendships]);

  // 动态照片流
  const filteredPosts = useMemo(() => {
    let list = getVisiblePosts();
    if (postVisFilter !== 'all_visible') {
      list = list.filter(p => p.visibility === postVisFilter);
    }
    if (postKeyword.trim()) {
      const kw = postKeyword.toLowerCase().trim();
      list = list.filter(p => p.content.toLowerCase().includes(kw));
    }
    return list;
  }, [getVisiblePosts, postVisFilter, postKeyword, currentUserId, friendships]);

  const filteredPhotos = useMemo(() => {
    // 所有我能看到的照片
    let list = photos.filter(p => {
      if (p.ownerId === currentUserId) return true;
      if (p.visibility === 'public') return true;
      if (p.visibility === 'friends' && getRelation(p.ownerId) === 'friend') return true;
      return false;
    });
    if (postVisFilter !== 'all_visible') {
      list = list.filter(p => p.visibility === postVisFilter);
    }
    return list;
  }, [photos, currentUserId, postVisFilter, getRelation, friendships]);

  // 清除所有筛选
  const clearAllFilters = () => {
    setKeyword('');
    setSearchField('all');
    setFilterOnline(false);
    setActiveTab('all');
    setHasSearched(false);
    setResults([]);
    setPostVisFilter('all_visible');
    setPostKeyword('');
  };

  // 统计（考虑在线筛选，确保数字与列表一致）
  const onlineBase = (list: User[]) => filterOnline ? list.filter(u => u.online) : list;
  const allCount = hasSearched ? onlineBase(results).length : defaultUserList.length;
  const friendsCount = hasSearched
    ? onlineBase(results.filter(u => getRelation(u.id) === 'friend')).length
    : onlineBase(friends).length;
  const pendingCount = hasSearched
    ? onlineBase(results.filter(u => { const r = getRelation(u.id); return r === 'pending_sent' || r === 'pending_received'; })).length
    : onlineBase(users.filter(u => u.id !== currentUserId && (getRelation(u.id) === 'pending_sent' || getRelation(u.id) === 'pending_received'))).length;
  const suggestedCount = hasSearched
    ? onlineBase(results.filter(u => { const r = getRelation(u.id); return r === 'none' || r === 'rejected' || r === 'rejected_them'; })).length
    : onlineBase(users.filter(u => u.id !== currentUserId && (getRelation(u.id) === 'none' || getRelation(u.id) === 'rejected' || getRelation(u.id) === 'rejected_them'))).length;
  const photoActiveCount = hasSearched
    ? onlineBase(results.filter(u => photos.some(p => p.ownerId === u.id))).length
    : onlineBase(users.filter(u => u.id !== currentUserId && photos.some(p => p.ownerId === u.id))).length;

  const displayList = hasSearched ? filteredResults : defaultUserList;
  const hasAnyFilter = searchField !== 'all' || filterOnline || activeTab !== 'all' || (hasSearched && keyword.trim());

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <div className="pt-14 max-w-4xl mx-auto px-4 py-6">
        {/* 搜索区域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Search size={20} className="text-[#3B5998]" /> 校园社交搜索工作台
          </h2>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入姓名、学校、院系、年级搜索..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3B5998] transition-colors"
              />
            </div>
            <button
              onClick={() => doSearch()}
              className="bg-[#3B5998] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2A4A7F] transition-colors shrink-0"
            >
              搜索
            </button>
          </div>

          {/* 高级筛选行 */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400">搜索字段：</span>
            {([
              { key: 'all' as const, label: '全部' },
              { key: 'name' as const, label: '姓名' },
              { key: 'school' as const, label: '学校/院系' },
              { key: 'grade' as const, label: '年级' },
            ]).map(opt => (
              <button
                key={opt.key}
                onClick={() => setSearchField(opt.key)}
                className={`px-2.5 py-1 rounded-full border transition-colors ${searchField === opt.key ? 'bg-[#3B5998] text-white border-[#3B5998]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                {opt.label}
              </button>
            ))}
            <span className="text-gray-300 mx-1">|</span>
            <button
              onClick={() => setFilterOnline(!filterOnline)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors ${filterOnline ? 'bg-green-50 text-green-600 border-green-300' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              <CircleDot size={10} /> 仅在线
            </button>
            {hasAnyFilter && (
              <button onClick={clearAllFilters} className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors ml-auto">
                <X size={12} /> 清除筛选
              </button>
            )}
          </div>
        </div>

        {/* 组合筛选Tab */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab.key ? 'text-[#3B5998]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${activeTab === tab.key ? 'bg-[#3B5998] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {tab.key === 'all' ? allCount
                    : tab.key === 'friends' ? friendsCount
                    : tab.key === 'pending' ? pendingCount
                    : tab.key === 'suggested' ? suggestedCount
                    : photoActiveCount}
                </span>
                {activeTab === tab.key && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#3B5998] rounded-full" />}
              </button>
            ))}
          </div>

          {/* 同学列表 */}
          <div className="p-4">
            {displayList.length > 0 ? (
              <div className="space-y-3">
                {displayList.map(user => (
                  <SearchResultCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                {hasSearched && keyword.trim().length < 2 ? (
                  <>
                    <AlertCircle size={36} className="text-amber-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">关键词太短</p>
                    <p className="text-gray-400 text-xs mt-1">搜索关键词至少需要2个字符</p>
                    <button onClick={() => { setKeyword(''); setHasSearched(false); }} className="mt-3 text-xs text-[#3B5998] hover:underline">返回全部同学</button>
                  </>
                ) : hasSearched ? (
                  <>
                    <AlertCircle size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">未找到匹配「{keyword}」的同学</p>
                    {activeTab !== 'all' && (
                      <p className="text-gray-400 text-xs mt-1">当前筛选「{FILTER_TABS.find(t => t.key === activeTab)?.label}」下无结果，试试切换到"全部同学"</p>
                    )}
                    <div className="mt-3 flex justify-center gap-3">
                      <button onClick={() => setActiveTab('all')} className="text-xs text-[#3B5998] hover:underline">查看全部同学</button>
                      <button onClick={clearAllFilters} className="text-xs text-gray-400 hover:text-red-500">清除所有筛选</button>
                    </div>
                  </>
                ) : activeTab === 'friends' ? (
                  <>
                    <Users size={36} className="text-gray-200 mx-auto mb-3" />
                    {friends.length === 0 ? (
                      <>
                        <p className="text-gray-500 text-sm font-medium">你还没有好友</p>
                        <p className="text-gray-400 text-xs mt-1">去搜索发现同学，发起好友申请吧</p>
                        <div className="mt-3 flex justify-center gap-3">
                          <button onClick={() => navigate('/search')} className="text-xs bg-[#3B5998] text-white px-4 py-1.5 rounded-full hover:bg-[#2A4A7F]">去搜索同学</button>
                          <button onClick={() => setActiveTab('all')} className="text-xs text-[#3B5998] hover:underline">查看全部同学</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 text-sm font-medium">当前条件下没有匹配的好友</p>
                        <p className="text-gray-400 text-xs mt-1">试试清除筛选条件</p>
                        <div className="mt-3 flex justify-center gap-3">
                          <button onClick={clearAllFilters} className="text-xs text-gray-400 hover:text-red-500">清除筛选</button>
                          <button onClick={() => setActiveTab('all')} className="text-xs text-[#3B5998] hover:underline">查看全部同学</button>
                        </div>
                      </>
                    )}
                  </>
                ) : activeTab === 'pending' ? (
                  <>
                    <Clock size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">暂无待处理的好友申请</p>
                    <p className="text-gray-400 text-xs mt-1">所有申请都已处理完毕</p>
                    <button onClick={() => setActiveTab('all')} className="mt-3 text-xs text-[#3B5998] hover:underline">查看全部同学</button>
                  </>
                ) : activeTab === 'suggested' ? (
                  <>
                    <UserPlus size={36} className="text-gray-200 mx-auto mb-3" />
                    {suggestedCount === 0 ? (
                      <>
                        <p className="text-gray-500 text-sm font-medium">所有同学都已有好友关系或已发送申请</p>
                        <p className="text-gray-400 text-xs mt-1">太棒了，你已经和大部分同学建立了联系</p>
                        <button onClick={() => setActiveTab('friends')} className="mt-3 text-xs text-[#3B5998] hover:underline">查看我的好友</button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 text-sm font-medium">当前条件下没有可推荐的同学</p>
                        <button onClick={clearAllFilters} className="mt-3 text-xs text-gray-400 hover:text-red-500">清除筛选</button>
                      </>
                    )}
                  </>
                ) : activeTab === 'photoActive' ? (
                  <>
                    <Image size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">暂无最近发照片的同学</p>
                    <button onClick={() => setActiveTab('all')} className="mt-3 text-xs text-[#3B5998] hover:underline">查看全部同学</button>
                  </>
                ) : (
                  <>
                    <Users size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">暂无同学数据</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 动态照片流筛选 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
              <Filter size={16} className="text-[#3B5998]" /> 动态照片流筛选
            </h3>
            <button
              onClick={() => setShowPostFilter(!showPostFilter)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${showPostFilter ? 'bg-[#3B5998] text-white border-[#3B5998]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              {showPostFilter ? '收起' : '展开筛选'}
            </button>
          </div>

          {showPostFilter && (
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">可见性：</span>
                {POST_VIS_FILTERS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setPostVisFilter(opt.key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs transition-colors ${postVisFilter === opt.key ? 'bg-[#3B5998] text-white border-[#3B5998]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">关键词：</span>
                <input
                  type="text"
                  value={postKeyword}
                  onChange={e => setPostKeyword(e.target.value)}
                  placeholder="搜索动态内容..."
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#3B5998] transition-colors"
                />
                {postKeyword && (
                  <button onClick={() => setPostKeyword('')} className="text-gray-300 hover:text-gray-500">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                <span className="flex items-center gap-0.5"><FileText size={10} /> {filteredPosts.length} 条动态</span>
                <span className="flex items-center gap-0.5"><Image size={10} /> {filteredPhotos.length} 张照片</span>
                {(postVisFilter !== 'all_visible' || postKeyword) && (
                  <button onClick={() => { setPostVisFilter('all_visible'); setPostKeyword(''); }} className="text-red-400 hover:text-red-500 ml-auto flex items-center gap-0.5">
                    <X size={10} /> 清除筛选
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 筛选后的动态列表 */}
          <div className="p-4">
            {filteredPosts.length > 0 ? (
              <div className="space-y-2">
                {filteredPosts.map(post => {
                  const author = users.find(u => u.id === post.authorId);
                  const postPhotos = photos.filter(p => post.photoIds.includes(p.id));
                  const visLabel = post.visibility === 'public' ? '公开' : post.visibility === 'friends' ? '好友可见' : '仅自己';
                  return (
                    <div key={post.id} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <button onClick={() => navigate(`/profile/${post.authorId}`)} className="shrink-0">
                        <Avatar userId={post.authorId} size={32} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => navigate(`/profile/${post.authorId}`)} className="text-xs font-semibold text-[#3B5998] hover:underline">{author?.name}</button>
                          <span className="text-[10px] text-gray-300">{visLabel}</span>
                          <span className="text-[10px] text-gray-300">{post.createdAt}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{post.content}</p>
                        {postPhotos.length > 0 && (
                          <div className="flex gap-1.5 mt-1">
                            {postPhotos.slice(0, 3).map(ph => (
                              <div key={ph.id} className="w-12 h-12 rounded overflow-hidden bg-gray-100 shrink-0">
                                {ph.imageUrl ? (
                                  <img src={ph.imageUrl} alt={ph.label} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-white/80" style={{ backgroundColor: ph.color }}>{ph.label}</div>
                                )}
                              </div>
                            ))}
                            {postPhotos.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{postPhotos.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                {postVisFilter === 'self' ? (
                  <>
                    <Lock size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">仅自己可见的动态</p>
                    <p className="text-gray-400 text-xs mt-1">这些动态只有作者本人能看到，切换到对应账号试试</p>
                    <button onClick={() => setPostVisFilter('all_visible')} className="mt-2 text-xs text-[#3B5998] hover:underline">返回我能看到的</button>
                  </>
                ) : postVisFilter === 'friends' ? (
                  <>
                    <Users size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">没有好友可见的动态</p>
                    <p className="text-gray-400 text-xs mt-1">好友可见的动态需要双方是好友才能查看，试试切换筛选或添加更多好友</p>
                    <div className="mt-2 flex justify-center gap-3">
                      <button onClick={() => setPostVisFilter('all_visible')} className="text-xs text-[#3B5998] hover:underline">返回我能看到的</button>
                      <button onClick={() => navigate('/search')} className="text-xs text-gray-400 hover:text-[#3B5998]">去添加好友</button>
                    </div>
                  </>
                ) : postVisFilter === 'public' ? (
                  <>
                    <Globe size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">没有公开的动态</p>
                    <p className="text-gray-400 text-xs mt-1">当前没有任何公开可见的动态</p>
                    <button onClick={() => setPostVisFilter('all_visible')} className="mt-2 text-xs text-[#3B5998] hover:underline">返回我能看到的</button>
                  </>
                ) : postKeyword ? (
                  <>
                    <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">没有包含「{postKeyword}」的动态</p>
                    <div className="mt-2 flex justify-center gap-3">
                      <button onClick={() => setPostKeyword('')} className="text-xs text-gray-400 hover:text-red-500">清除关键词</button>
                      <button onClick={() => { setPostVisFilter('all_visible'); setPostKeyword(''); }} className="text-xs text-[#3B5998] hover:underline">返回我能看到的</button>
                    </div>
                  </>
                ) : (
                  <>
                    <FileText size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">暂无可见动态</p>
                    <p className="text-gray-400 text-xs mt-1">当前账号下没有任何可见的动态，去发布一条或添加好友看看</p>
                    <div className="mt-2 flex justify-center gap-3">
                      <button onClick={() => navigate('/')} className="text-xs text-[#3B5998] hover:underline">去发布动态</button>
                      <button onClick={() => navigate('/search')} className="text-xs text-gray-400 hover:text-[#3B5998]">去添加好友</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 快捷搜索标签 */}
        {!hasSearched && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">试试搜索</h3>
            <div className="flex flex-wrap gap-2">
              {['北京大学', '清华大学', '浙江大学', '计算机', '经管', '2008级'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setKeyword(tag); doSearch(tag); }}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
