import { useSocialStore } from '@/store/socialStore';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function Sidebar() {
  const { currentUserId, getFriendsOf, isFriend } = useSocialStore();
  const friends = getFriendsOf(currentUserId);
  const navigate = useNavigate();

  return (
    <aside className="w-56 shrink-0">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-800">好友/同学</h3>
          <span className="text-xs text-gray-400">{friends.length} 人</span>
        </div>
        <div className="py-1 max-h-[calc(100vh-200px)] overflow-y-auto">
          {friends.map(friend => (
            <button
              key={friend.id}
              onClick={() => navigate(`/profile/${friend.id}`)}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <Avatar userId={friend.id} size={32} />
              <div className="min-w-0">
                <div className="text-sm text-gray-800 truncate">{friend.name}</div>
                <div className="text-xs text-gray-400 truncate">{friend.className}</div>
              </div>
            </button>
          ))}
          {friends.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">暂无好友</div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-gray-100">
          <button
            onClick={() => navigate('/search')}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-[#3B5998] hover:underline py-1"
          >
            <UserPlus size={14} /> 搜索添加好友
          </button>
        </div>
      </div>
    </aside>
  );
}
