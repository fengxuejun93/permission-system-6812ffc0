import { useSocialStore } from '@/store/socialStore';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PostForm from '@/components/PostForm';
import PostCard from '@/components/PostCard';
import Avatar from '@/components/Avatar';
import { useNavigate } from 'react-router-dom';
import { Clock, UserPlus } from 'lucide-react';

export default function Home() {
  const { getVisiblePosts, currentUserId, users, getFriendsOf, getRelation } = useSocialStore();
  const posts = getVisiblePosts();
  const currentUser = users.find(u => u.id === currentUserId);
  const friends = getFriendsOf(currentUserId);
  const navigate = useNavigate();

  // 按关系分类非自己用户
  const pendingSent: typeof users = [];
  const pendingReceived: typeof users = [];
  const rejected: typeof users = [];
  const none: typeof users = [];

  users.forEach(u => {
    if (u.id === currentUserId) return;
    const rel = getRelation(u.id);
    if (rel === 'friend') return; // 好友不在这展示
    switch (rel) {
      case 'pending_sent': pendingSent.push(u); break;
      case 'pending_received': pendingReceived.push(u); break;
      case 'rejected': rejected.push(u); break;
      default: none.push(u); break;
    }
  });

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <div className="pt-14 flex justify-center gap-4 px-4 max-w-6xl mx-auto">
        <Sidebar />

        <main className="flex-1 max-w-xl py-4 space-y-3">
          <PostForm />
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
          {posts.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-400 text-sm">
              暂无可见动态
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
          {(none.length > 0 || rejected.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-sm text-gray-800">你可能认识</h3>
              </div>
              <div className="py-1">
                {[...none, ...rejected].slice(0, 5).map(user => (
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
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar userId={currentUserId} size={48} />
              <div>
                <div className="text-sm font-semibold text-gray-800">{currentUser?.name}</div>
                <div className="text-xs text-gray-400">{currentUser?.school}</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">"{currentUser?.signature}"</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
