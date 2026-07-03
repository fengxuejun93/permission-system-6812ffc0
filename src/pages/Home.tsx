import { useSocialStore } from '@/store/socialStore';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PostForm from '@/components/PostForm';
import PostCard from '@/components/PostCard';
import Avatar from '@/components/Avatar';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { getVisiblePosts, currentUserId, users, getFriendsOf } = useSocialStore();
  const posts = getVisiblePosts();
  const currentUser = users.find(u => u.id === currentUserId);
  const friends = getFriendsOf(currentUserId);
  const navigate = useNavigate();

  // 推荐非好友用户
  const nonFriends = users.filter(u => {
    if (u.id === currentUserId) return false;
    return !friends.some(f => f.id === u.id);
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-sm text-gray-800">你可能认识</h3>
            </div>
            <div className="py-1">
              {nonFriends.slice(0, 5).map(user => (
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
                </button>
              ))}
              {nonFriends.length === 0 && (
                <div className="px-4 py-3 text-xs text-gray-400 text-center">已经是全好友了！</div>
              )}
            </div>
          </div>

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
