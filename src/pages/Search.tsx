import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import { Search, UserPlus, Check, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const { searchUsers, isFriend, addFriend, currentUserId, getFriendsOf } = useSocialStore();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<ReturnType<typeof searchUsers>>([]);
  const navigate = useNavigate();
  const friends = getFriendsOf(currentUserId);

  const handleSearch = () => {
    const found = searchUsers(keyword);
    setResults(found);
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
              disabled={!keyword.trim()}
              className="bg-[#3B5998] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2A4A7F] disabled:opacity-40 transition-colors"
            >
              搜索
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">找到 {results.length} 位同学</span>
            </div>
            <div className="divide-y divide-gray-100">
              {results.map(user => {
                const alreadyFriend = isFriend(user.id);
                return (
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
                      {alreadyFriend ? (
                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 rounded-full px-3 py-1.5">
                          <Check size={14} /> 好友
                        </div>
                      ) : (
                        <button
                          onClick={() => addFriend(user.id)}
                          className="flex items-center gap-1 text-xs bg-[#3B5998] text-white rounded-full px-3 py-1.5 hover:bg-[#2A4A7F] transition-colors"
                        >
                          <UserPlus size={14} /> 加好友
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {results.length === 0 && keyword && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-400 text-sm">
            未找到匹配的同学
          </div>
        )}

        {results.length === 0 && !keyword && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-1.5">
                <Users size={16} className="text-[#3B5998]" /> 我的好友
              </h3>
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
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-3">试试搜索</h3>
              <div className="flex flex-wrap gap-2">
                {['北京大学', '清华大学', '浙江大学', '计算机', '经管'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setKeyword(tag); const found = searchUsers(tag); setResults(found); }}
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
