import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Bell, Clock, X, Users, MessageSquare } from 'lucide-react';

export default function Sidebar() {
  const { currentUserId, getFriendsOf, getRelation, getPendingReceived, getPendingSent, users, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, getUnreadWallCount } = useSocialStore();
  const { showToast } = useToast();
  const friends = getFriendsOf(currentUserId);
  const pendingReceived = getPendingReceived();
  const pendingSent = getPendingSent();
  const navigate = useNavigate();

  const handleAccept = (userId: string, userName: string) => {
    const rel = getRelation(userId);
    if (rel !== 'pending_received') {
      showToast('该申请已处理', 'info');
      return;
    }
    acceptFriendRequest(userId);
    showToast(`已通过 ${userName} 的好友申请`);
  };

  const handleReject = (userId: string, userName: string) => {
    const rel = getRelation(userId);
    if (rel !== 'pending_received') {
      showToast('该申请已处理', 'info');
      return;
    }
    rejectFriendRequest(userId);
    showToast(`已拒绝 ${userName} 的好友申请`);
  };

  const handleCancel = (friendId: string) => {
    const target = users.find(u => u.id === friendId);
    cancelFriendRequest(friendId);
    showToast(`已取消对 ${target?.name || friendId} 的好友申请`);
  };

  return (
    <aside className="w-56 shrink-0">
      {/* 待处理好友申请（收到的） */}
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
                      onClick={() => handleAccept(sender.id, sender.name)}
                      className="flex-1 text-[10px] bg-[#3B5998] text-white rounded px-2 py-1 hover:bg-[#2A4A7F] transition-colors"
                    >
                      通过
                    </button>
                    <button
                      onClick={() => handleReject(sender.id, sender.name)}
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

      {/* 已发出的待确认申请 */}
      {pendingSent.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 mb-3">
          <div className="px-4 py-2.5 border-b border-blue-200 flex items-center gap-1.5">
            <Clock size={14} className="text-blue-500" />
            <h3 className="font-semibold text-sm text-blue-700">待确认</h3>
            <span className="text-xs text-blue-500 ml-auto">{pendingSent.length}</span>
          </div>
          <div className="py-1">
            {pendingSent.map(req => {
              const target = users.find(u => u.id === req.friendId);
              if (!target) return null;
              return (
                <div key={req.friendId} className="px-3 py-2 border-b border-blue-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/profile/${target.id}`)} className="shrink-0">
                      <Avatar userId={target.id} size={28} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-800 truncate">{target.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">等待对方确认</div>
                    </div>
                    <button
                      onClick={() => handleCancel(target.id)}
                      className="text-[10px] text-gray-400 hover:text-red-400 transition-colors shrink-0"
                      title="取消申请"
                    >
                      <X size={12} />
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
            <div className="px-4 py-6 text-center">
              <Users size={24} className="text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">暂无好友</p>
              <p className="text-[10px] text-gray-300 mt-0.5">去搜索添加同学吧</p>
              <button
                onClick={() => navigate('/search')}
                className="mt-2 text-[10px] text-[#3B5998] hover:underline"
              >
                搜索添加好友
              </button>
            </div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-gray-100 space-y-1.5">
          <button
            onClick={() => navigate('/classmates')}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-[#3B5998] hover:underline py-1"
          >
            <Users size={14} /> 同学录
          </button>
          <button
            onClick={() => navigate('/wall')}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-[#3B5998] hover:underline py-1 relative"
          >
            <MessageSquare size={14} /> 我的留言板
            {getUnreadWallCount() > 0 && (
              <span className="text-[9px] bg-red-500 text-white rounded-full px-1 py-0 leading-none">{getUnreadWallCount()}</span>
            )}
          </button>
          <button
            onClick={() => navigate('/search')}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-[#3B5998] py-0.5"
          >
            <UserPlus size={12} /> 搜索添加好友
          </button>
        </div>
      </div>
    </aside>
  );
}
