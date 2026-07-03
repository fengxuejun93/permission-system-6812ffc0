import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import type { RelationType } from '@/types';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import { Search, UserPlus, Check, Users, AlertCircle, Clock, XCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 搜索结果中的好友按钮
function SearchFriendButton({ userId, userName }: { userId: string; userName: string }) {
  const { getRelation, sendFriendRequest, cancelFriendRequest } = useSocialStore();
  const { showToast } = useToast();
  const relation = getRelation(userId);

  const handleSend = () => {
    sendFriendRequest(userId);
    showToast(`已向 ${userName} 发送好友申请`);
  };

  const handleCancel = () => {
    cancelFriendRequest(userId);
    showToast('已取消好友申请');
  };

  switch (relation) {
    case 'friend':
      return (
        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 rounded-full px-3 py-1.5">
          <Check size={14} /> 好友
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
        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 rounded-full px-3 py-1.5">
          <Clock size={14} /> 待你确认
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

export default function SearchPage() {
  const { searchUsers, getFriendsOf, currentUserId } = useSocialStore();
  const { showToast } = useToast();
  const [keyword, setKeyword] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof searchUsers>>([]);
  const navigate = useNavigate();
  const friends = getFriendsOf(currentUserId);

  const handleSearch = () => {
    if (!keyword.trim()) {
      showToast('请输入搜索关键词', 'info');
      return;
    }
    const found = searchUsers(keyword);
    setResults(found);
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <div className="pt-14 max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">搜索同学</h2>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入姓名、学校或班级搜索..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3B5998] transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#3B5998] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2A4A7F] transition-colors"
            >
              搜索
            </button>
          </div>
        </div>

        {hasSearched && results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">找到 {results.length} 位同学</span>
            </div>
            <div className="divide-y divide-gray-100">
              {results.map(user => (
                <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <button onClick={() => navigate(`/profile/${user.id}`)} className="shrink-0">
                    <Avatar userId={user.id} size={48} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/profile/${user.id}`)}
                      className="text-sm font-semibold text-[#3B5998] hover:underline"
                    >
                      {user.name}
                    </button>
                    <div className="text-xs text-gray-500 mt-0.5">{user.school} · {user.className}</div>
                    <p className="text-xs text-gray-400 mt-0.5 italic truncate">"{user.signature}"</p>
                  </div>
                  <div className="shrink-0">
                    <SearchFriendButton userId={user.id} userName={user.name} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasSearched && results.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">未找到匹配「{keyword}」的同学</p>
            <p className="text-gray-300 text-xs mt-1">试试其他关键词，如学校名或班级名</p>
          </div>
        )}

        {!hasSearched && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-1.5">
                <Users size={16} className="text-[#3B5998]" /> 我的好友
                <span className="text-xs text-gray-400 font-normal ml-1">({friends.length})</span>
              </h3>
              {friends.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {friends.map(friend => (
                    <button
                      key={friend.id}
                      onClick={() => navigate(`/profile/${friend.id}`)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Avatar userId={friend.id} size={36} />
                      <div className="min-w-0">
                        <div className="text-sm text-gray-800 truncate">{friend.name}</div>
                        <div className="text-xs text-gray-400 truncate">{friend.school}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">暂无好友，搜索并添加同学吧</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-3">试试搜索</h3>
              <div className="flex flex-wrap gap-2">
                {['北京大学', '清华大学', '浙江大学', '计算机', '经管'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setKeyword(tag); const found = searchUsers(tag); setResults(found); setHasSearched(true); }}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
