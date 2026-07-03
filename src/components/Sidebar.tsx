import { useSocialStore } from '@/store/socialStore';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Bell } from 'lucide-react';

export default function Sidebar() {
  const { currentUserId, getFriendsOf, getPendingReceived, users, acceptFriendRequest, rejectFriendRequest } = useSocialStore();
  const friends = getFriendsOf(currentUserId);
  const pendingReceived = getPendingReceived();
  const navigate = useNavigate();

  return (
    <aside className="w-56 shrink-0">
      {/* 待处理好友申请 */}
      {pendingReceived.length > 0 && (
        <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200 mb-3">
          <div className="px-4 py-2.5 border-b border-amber-200 flex items-center gap-1.5">
            <Bell size={14} className="text-amber-500" />
            <h3 className="font-semibold text-sm text-amber-700">好友申请</h3>
            <span className="text-xs text-amber-500 ml-auto">{pendingReceived.length}</span>
          </div>
          <div className="py-1">
            {pendingReceived.map(req => {
              const sender = users.find(u => u.id === req.userId);
              if (!sender) return null;
              return (
                <div key={req.userId} className="px-3 py-2 border-b border-amber-100 last:border-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <button onClick={() => navigate(`/profile/${sender.id}`)} className="shrink-0">
                      <Avatar userId={sender.id} size={28} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-800 truncate">{sender.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{sender.school}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => acceptFriendRequest(req.userId)}
                      className="flex-1 text-[10px] bg-[#3B5998] text-white rounded px-2 py-1 hover:bg-[#2A4A7F] transition-colors"
                    >
                      通过
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(req.userId)}
                      className="flex-1 text-[10px] bg-gray-200 text-gray-600 rounded px-2 py-1 hover:bg-gray-300 transition-colors"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 好友列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-800">好友/同学</h3>
          <span className="text-xs text-gray-400">{friends.length} 人</span>
        </div>
        <div className="py-1 max-h-[calc(100vh-320px)] overflow-y-auto">
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
