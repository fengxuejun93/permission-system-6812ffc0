import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PostForm from '@/components/PostForm';
import PostCard from '@/components/PostCard';
import Avatar from '@/components/Avatar';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, MessageSquare } from 'lucide-react';

export default function Home() {
  const { getVisiblePosts, currentUserId, users, getFriendsOf, getRelation } = useSocialStore();
  const posts = getVisiblePosts();
  const currentUser = users.find(u => u.id === currentUserId);
  const friends = getFriendsOf(currentUserId);
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  // 按关系分类非自己用户
  const pendingSent: typeof users = [];
  const pendingReceived: typeof users = [];
  const rejected: typeof users = [];
  const rejectedThem: typeof users = [];
  const none: typeof users = [];

  users.forEach(u => {
    if (u.id === currentUserId) return;
    const rel = getRelation(u.id);
    if (rel === 'friend') return;
    switch (rel) {
      case 'pending_sent': pendingSent.push(u); break;
      case 'pending_received': pendingReceived.push(u); break;
      case 'rejected': rejected.push(u); break;
      case 'rejected_them': rejectedThem.push(u); break;
      default: none.push(u); break;
    }
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <div className="pt-14 flex justify-center gap-4 px-4 max-w-6xl mx-auto">
        <Sidebar />

        <main className="flex-1 max-w-xl py-4 space-y-3">
          {/* 搜索入口 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-2 hover:border-[#3B5998]/40 transition-colors">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="搜索同学、学校、院系..."
              className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
            />
            <button
              onClick={handleSearch}
              className="text-xs bg-[#3B5998] text-white px-3 py-1.5 rounded-full hover:bg-[#2A4A7F] transition-colors shrink-0"
            >
              搜索
            </button>
          </div>

          <PostForm />
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
          {posts.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
              <FileText size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">暂无可见动态</p>
              <p className="text-gray-400 text-xs mt-1">当前账号下没有任何可见的动态</p>
              <div className="mt-4 flex justify-center gap-3">
                <button onClick={() => navigate('/search')} className="text-xs bg-[#3B5998] text-white px-4 py-1.5 rounded-full hover:bg-[#2A4A7F]">搜索添加好友</button>
                <button onClick={() => navigate('/classmates')} className="text-xs text-[#3B5998] hover:underline">查看同学录</button>
              </div>
            </div>
          )}
        </main>

        <aside className="w-56 shrink-0 py-4 space-y-3">
          {/* 待你确认 */}
          {pendingReceived.length > 0 && (
            <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200">
              <div className="px-4 py-2.5 border-b border-blue-200">
                <h3 className="font-semibold text-sm text-blue-700">待你确认</h3>
              </div>
              <div className="py-1">
                {pendingReceived.slice(0, 3).map(user => (
                  <button
                    key={user.id}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-blue-100/50 transition-colors text-left"
                  >
                    <Avatar userId={user.id} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-800 truncate">{user.name}</div>
                      <div className="text-[10px] text-blue-500">申请加你好友</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 你已申请 */}
          {pendingSent.length > 0 && (
            <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200">
              <div className="px-4 py-2.5 border-b border-amber-200">
                <h3 className="font-semibold text-sm text-amber-700">你已申请</h3>
              </div>
              <div className="py-1">
                {pendingSent.slice(0, 3).map(user => (
                  <button
                    key={user.id}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-amber-100/50 transition-colors text-left"
                  >
                    <Avatar userId={user.id} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-800 truncate">{user.name}</div>
                      <div className="text-[10px] text-amber-500">等待确认</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 你可能认识 */}
          {(none.length > 0 || rejected.length > 0 || rejectedThem.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-sm text-gray-800">你可能认识</h3>
              </div>
              <div className="py-1">
                {[...none, ...rejected, ...rejectedThem].slice(0, 5).map(user => (
                  <button
                    key={user.id}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Avatar userId={user.id} size={32} />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-800 truncate">{user.name}</div>
                      <div className="text-xs text-gray-400 truncate">{user.school}</div>
                    </div>
                    {getRelation(user.id) === 'rejected' && (
                      <span className="text-[9px] text-gray-300 shrink-0">曾被拒</span>
                    )}
                    {getRelation(user.id) === 'rejected_them' && (
                      <span className="text-[9px] text-orange-300 shrink-0">已拒绝</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <button onClick={() => navigate(`/profile/${currentUserId}`)} className="shrink-0 hover:opacity-90 transition-opacity">
                <Avatar userId={currentUserId} size={48} />
              </button>
              <div>
                <button onClick={() => navigate(`/profile/${currentUserId}`)} className="text-sm font-semibold text-gray-800 hover:text-[#3B5998] hover:underline">{currentUser?.name}</button>
                <div className="text-xs text-gray-400">{currentUser?.school}</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">"{currentUser?.signature}"</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => navigate(`/profile/${currentUserId}`)} className="flex-1 flex items-center justify-center gap-1 text-xs text-[#3B5998] bg-blue-50 rounded-full py-1.5 hover:bg-blue-100 transition-colors">
                <Users size={12} /> 我的主页
              </button>
              <button onClick={() => navigate('/wall')} className="flex-1 flex items-center justify-center gap-1 text-xs text-teal-600 bg-teal-50 rounded-full py-1.5 hover:bg-teal-100 transition-colors">
                <MessageSquare size={12} /> 留言板
              </button>
            </div>
          </div>

          {/* 好友快速入口 */}
          {friends.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-800">好友 ({friends.length})</h3>
                <button onClick={() => navigate('/classmates')} className="text-[10px] text-[#3B5998] hover:underline">查看全部</button>
              </div>
              <div className="py-1">
                {friends.slice(0, 6).map(friend => (
                  <button
                    key={friend.id}
                    onClick={() => navigate(`/profile/${friend.id}`)}
                    className="w-full flex items-center gap-2.5 px-4 py-1.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="relative shrink-0">
                      <Avatar userId={friend.id} size={24} />
                      {friend.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <span className="text-xs text-gray-700 truncate">{friend.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
