import { useState, useMemo } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import WallMessageCard from '@/components/WallMessageCard';
import WallMessageForm from '@/components/WallMessageForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  MessageSquare, Users, CheckCheck, Filter, X, Globe,
  FileText, Search, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WallMessage, Visibility } from '@/types';

type FilterTab = 'all' | 'unread' | 'mine' | 'hidden';
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部留言' },
  { key: 'unread', label: '未读' },
  { key: 'mine', label: '我留的' },
  { key: 'hidden', label: '已隐藏' },
];

type VisFilter = 'all_vis' | 'public' | 'friends' | 'self';
const VIS_FILTERS: { key: VisFilter; label: string }[] = [
  { key: 'all_vis', label: '全部' },
  { key: 'public', label: '公开' },
  { key: 'friends', label: '好友可见' },
  { key: 'self', label: '仅自己' },
];

export default function WallPage() {
  const store = useSocialStore();
  const { currentUserId, users, getVisibleWallMessages, markAllWallRead, wallMessages, getUnreadWallCount } = store;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [visFilter, setVisFilter] = useState<VisFilter>('all_vis');
  const [searchKw, setSearchKw] = useState('');
  const [showVisFilter, setShowVisFilter] = useState(false);
  const [showMarkAllDialog, setShowMarkAllDialog] = useState(false);
  const [replyTo, setReplyTo] = useState<WallMessage | null>(null);
  const [editMsg, setEditMsg] = useState<WallMessage | null>(null);

  // 当前用户的留言墙上的所有可见留言
  const allMessages = useMemo(() => {
    return getVisibleWallMessages(currentUserId);
  }, [getVisibleWallMessages, currentUserId, wallMessages]);

  // 筛选
  const filteredMessages = useMemo(() => {
    let list = allMessages;
    // Tab筛选
    switch (activeTab) {
      case 'unread':
        list = list.filter(m => !m.isRead && m.status === 'active');
        break;
      case 'mine':
        list = list.filter(m => m.authorId === currentUserId);
        break;
      case 'hidden':
        list = list.filter(m => m.status === 'hidden');
        break;
      default:
        break;
    }
    // 可见性筛选
    if (visFilter !== 'all_vis') {
      list = list.filter(m => m.visibility === visFilter);
    }
    // 搜索
    if (searchKw.trim()) {
      const kw = searchKw.toLowerCase().trim();
      list = list.filter(m => {
        const author = users.find(u => u.id === m.authorId);
        return m.content.toLowerCase().includes(kw) || (author?.name.toLowerCase().includes(kw) ?? false);
      });
    }
    return list;
  }, [allMessages, activeTab, visFilter, searchKw, currentUserId, users]);

  const unreadCount = getUnreadWallCount();
  const myPostedCount = allMessages.filter(m => m.authorId === currentUserId).length;
  const hiddenCount = allMessages.filter(m => m.status === 'hidden').length;

  // 按留言分组：顶级留言 + 回复
  const topLevelMessages = filteredMessages.filter(m => m.replyToId === null);
  const getReplies = (msgId: string) => filteredMessages.filter(m => m.replyToId === msgId);

  const handleMarkAllRead = () => {
    const count = markAllWallRead();
    showToast(`已将 ${count} 条留言标记为已读`);
    setShowMarkAllDialog(false);
  };

  const handleReply = (msg: WallMessage) => {
    setReplyTo(msg);
    setEditMsg(null);
  };

  const handleEdit = (msg: WallMessage) => {
    setEditMsg(msg);
    setReplyTo(null);
  };

  const handleFormDone = () => {
    setReplyTo(null);
    setEditMsg(null);
  };

  const clearFilters = () => {
    setActiveTab('all');
    setVisFilter('all_vis');
    setSearchKw('');
  };

  const hasAnyFilter = activeTab !== 'all' || visFilter !== 'all_vis' || searchKw.trim();

  const tabCounts = useMemo(() => ({
    all: allMessages.filter(m => m.status === 'active').length,
    unread: unreadCount,
    mine: myPostedCount,
    hidden: hiddenCount,
  }), [allMessages, unreadCount, myPostedCount, hiddenCount]);

  const currentUser = users.find(u => u.id === currentUserId);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <div className="pt-14 max-w-3xl mx-auto px-4 py-6">
        {/* 标题区 */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white shadow shrink-0"
            style={{ backgroundColor: currentUser?.avatarColor }}
          >
            {currentUser?.name[0]}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
              <MessageSquare size={20} className="text-[#3B5998]" /> 我的留言板
            </h1>
            <p className="text-xs text-gray-400">{currentUser?.school} · {currentUser?.className}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => setShowMarkAllDialog(true)}
                className="flex items-center gap-1 text-xs bg-[#3B5998] text-white px-3 py-1.5 rounded-full hover:bg-[#2A4A7F] transition-colors"
              >
                <CheckCheck size={12} /> 全部已读 ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* 统计条 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: '留言总数', value: tabCounts.all, icon: <MessageSquare size={12} />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: '未读', value: unreadCount, icon: <FileText size={12} />, color: 'bg-red-50 text-red-700 border-red-200' },
            { label: '我留的', value: myPostedCount, icon: <Users size={12} />, color: 'bg-green-50 text-green-700 border-green-200' },
            { label: '已隐藏', value: hiddenCount, icon: <EyeOff size={12} />, color: 'bg-gray-50 text-gray-600 border-gray-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg border p-2 text-center ${s.color}`}>
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-[10px] flex items-center justify-center gap-0.5">{s.icon} {s.label}</div>
            </div>
          ))}
        </div>

        {/* 留言表单 */}
        <div className="mb-4">
          <WallMessageForm
            wallOwnerId={currentUserId}
            replyTo={replyTo}
            editMessage={editMsg}
            onSubmitted={handleFormDone}
            onCancel={() => { setReplyTo(null); setEditMsg(null); }}
          />
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchKw}
                onChange={e => setSearchKw(e.target.value)}
                placeholder="搜索留言内容或作者..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3B5998] transition-colors"
              />
              {searchKw && (
                <button onClick={() => setSearchKw('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowVisFilter(!showVisFilter)}
              className={`flex items-center gap-1 text-xs px-2.5 py-2 rounded-lg border transition-colors ${showVisFilter ? 'bg-[#3B5998] text-white border-[#3B5998]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              <Filter size={12} /> 可见性
            </button>
          </div>

          {showVisFilter && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] text-gray-400">可见性：</span>
              {VIS_FILTERS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setVisFilter(opt.key)}
                  className={`px-2 py-1 rounded-full border text-[10px] transition-colors ${visFilter === opt.key ? 'bg-[#3B5998] text-white border-[#3B5998]' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {hasAnyFilter && (
            <div className="flex items-center gap-2">
              <button onClick={clearFilters} className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-0.5">
                <X size={10} /> 清除所有筛选
              </button>
            </div>
          )}
        </div>

        {/* Tab */}
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
                  {tabCounts[tab.key]}
                </span>
                {activeTab === tab.key && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#3B5998] rounded-full" />}
              </button>
            ))}
          </div>

          {/* 留言列表 */}
          <div className="p-4">
            {topLevelMessages.length > 0 ? (
              <div className="space-y-3">
                {topLevelMessages.map(msg => {
                  const replies = getReplies(msg.id);
                  return (
                    <div key={msg.id}>
                      <WallMessageCard
                        message={msg}
                        isWallOwner={true}
                        onReply={handleReply}
                        onEdit={handleEdit}
                      />
                      {replies.length > 0 && (
                        <div className="ml-8 mt-2 space-y-2">
                          {replies.map(reply => (
                            <WallMessageCard
                              key={reply.id}
                              message={reply}
                              isWallOwner={true}
                              onReply={handleReply}
                              onEdit={handleEdit}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
                {searchKw.trim() ? (
                  <>
                    <p className="text-gray-500 text-sm font-medium">没有包含「{searchKw}」的留言</p>
                    <button onClick={() => setSearchKw('')} className="mt-2 text-xs text-[#3B5998] hover:underline">清除搜索</button>
                  </>
                ) : activeTab === 'unread' ? (
                  <>
                    <p className="text-gray-500 text-sm font-medium">没有未读留言</p>
                    <p className="text-gray-400 text-xs mt-1">所有留言都已阅读</p>
                    <button onClick={() => setActiveTab('all')} className="mt-2 text-xs text-[#3B5998] hover:underline">查看全部留言</button>
                  </>
                ) : activeTab === 'mine' ? (
                  <>
                    <p className="text-gray-500 text-sm font-medium">你还没有留过言</p>
                    <p className="text-gray-400 text-xs mt-1">去别人的留言板留下你的第一条吧</p>
                    <button onClick={() => navigate('/search')} className="mt-2 text-xs text-[#3B5998] hover:underline">搜索同学</button>
                  </>
                ) : activeTab === 'hidden' ? (
                  <>
                    <p className="text-gray-500 text-sm font-medium">没有已隐藏的留言</p>
                    <button onClick={() => setActiveTab('all')} className="mt-2 text-xs text-[#3B5998] hover:underline">查看全部留言</button>
                  </>
                ) : visFilter !== 'all_vis' ? (
                  <>
                    <p className="text-gray-500 text-sm font-medium">当前筛选条件下没有留言</p>
                    <button onClick={clearFilters} className="mt-2 text-xs text-gray-400 hover:text-red-500">清除筛选</button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 text-sm font-medium">留言板还是空的</p>
                    <p className="text-gray-400 text-xs mt-1">给自己留一条，或让朋友来留言吧</p>
                    <button onClick={() => navigate('/classmates')} className="mt-2 text-xs text-[#3B5998] hover:underline">邀请同学</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 快捷跳转：查看别人的留言板 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-sm text-gray-800 mb-2">去别人的留言板看看</h3>
          <div className="flex gap-2 overflow-x-auto">
            {users.filter(u => u.id !== currentUserId).slice(0, 6).map(user => {
              const msgCount = wallMessages.filter(w => w.wallOwnerId === user.id && w.status === 'active').length;
              return (
                <button
                  key={user.id}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                >
                  <Avatar userId={user.id} size={24} />
                  <div className="text-left">
                    <div className="text-xs text-gray-700">{user.name}</div>
                    <div className="text-[10px] text-gray-400">{msgCount} 条留言</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showMarkAllDialog}
        title="全部标记已读"
        message={`确定要将 ${unreadCount} 条未读留言全部标记为已读吗？`}
        confirmLabel="全部已读"
        onConfirm={handleMarkAllRead}
        onCancel={() => setShowMarkAllDialog(false)}
      />
    </div>
  );
}
