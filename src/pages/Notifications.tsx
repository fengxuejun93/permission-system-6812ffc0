import { useSocialStore } from '@/store/socialStore';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import { Bell, UserPlus, Check, XCircle, MessageSquare, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/Toast';

export default function Notifications() {
  const {
    currentUserId,
    users,
    getPendingReceived,
    getPendingSent,
    comments,
    posts,
    articles,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
  } = useSocialStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const pendingReceived = getPendingReceived();
  const pendingSent = getPendingSent();

  // 我收到的评论（别人评论我的动态/文章）
  const myPostIds = posts.filter(p => p.authorId === currentUserId).map(p => p.id);
  const commentsOnMyPosts = comments.filter(
    c => myPostIds.includes(c.postId) && c.authorId !== currentUserId
  );

  // 好友最近通过的（已 accepted 的双向关系中，包含我方）
  // 这里简单展示：不做额外追踪，仅展示待处理申请

  const handleAccept = (userId: string, name: string) => {
    acceptFriendRequest(userId);
    showToast(`已通过 ${name} 的好友申请`);
  };

  const handleReject = (userId: string, name: string) => {
    rejectFriendRequest(userId);
    showToast(`已拒绝 ${name} 的好友申请`);
  };

  const handleCancel = (friendId: string) => {
    cancelFriendRequest(friendId);
    showToast('已取消好友申请');
  };

  const totalItems = pendingReceived.length + pendingSent.length + commentsOnMyPosts.length;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <div className="pt-14 max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={22} className="text-[#3B5998]" />
          <h1 className="text-lg font-bold text-gray-800">通知中心</h1>
          <span className="text-xs text-gray-400">{totalItems} 条消息</span>
        </div>

        {/* 好友申请 - 收到的 */}
        {pendingReceived.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
              <UserPlus size={14} className="text-[#3B5998]" /> 好友申请
            </h2>
            <div className="space-y-2">
              {pendingReceived.map(req => {
                const sender = users.find(u => u.id === req.userId);
                if (!sender) return null;
                return (
                  <div key={req.userId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
                    <button onClick={() => navigate(`/profile/${sender.id}`)} className="shrink-0">
                      <Avatar userId={sender.id} size={40} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/profile/${sender.id}`)}
                        className="text-sm font-semibold text-[#3B5998] hover:underline"
                      >
                        {sender.name}
                      </button>
                      <p className="text-xs text-gray-400">{sender.school} · 请求添加你为好友</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleAccept(sender.id, sender.name)}
                        className="flex items-center gap-1 text-xs bg-[#3B5998] text-white rounded-full px-3 py-1.5 hover:bg-[#2A4A7F] transition-colors"
                      >
                        <Check size={12} /> 通过
                      </button>
                      <button
                        onClick={() => handleReject(sender.id, sender.name)}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors"
                      >
                        <XCircle size={12} /> 拒绝
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 我发出的待确认 */}
        {pendingSent.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
              <Clock size={14} className="text-amber-500" /> 已发出的申请
            </h2>
            <div className="space-y-2">
              {pendingSent.map(req => {
                const target = users.find(u => u.id === req.friendId);
                if (!target) return null;
                return (
                  <div key={req.friendId} className="bg-amber-50 rounded-lg border border-amber-200 p-3 flex items-center gap-3">
                    <button onClick={() => navigate(`/profile/${target.id}`)} className="shrink-0">
                      <Avatar userId={target.id} size={36} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/profile/${target.id}`)}
                        className="text-sm font-medium text-gray-800 hover:underline"
                      >
                        {target.name}
                      </button>
                      <p className="text-xs text-amber-500">等待对方确认</p>
                    </div>
                    <button
                      onClick={() => handleCancel(target.id)}
                      className="text-[10px] text-gray-400 hover:text-red-400 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 评论通知 */}
        {commentsOnMyPosts.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-green-500" /> 我的动态收到的评论
            </h2>
            <div className="space-y-2">
              {commentsOnMyPosts.slice(0, 10).map(comment => {
                const author = users.find(u => u.id === comment.authorId);
                const post = posts.find(p => p.id === comment.postId);
                if (!author || !post) return null;
                return (
                  <div key={comment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-start gap-3">
                    <button onClick={() => navigate(`/profile/${author.id}`)} className="shrink-0 mt-0.5">
                      <Avatar userId={author.id} size={28} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600">
                        <button onClick={() => navigate(`/profile/${author.id}`)} className="font-semibold text-[#3B5998] hover:underline">{author.name}</button>
                        {' '}评论了你的动态
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 bg-gray-50 rounded px-2 py-1">{comment.content}</p>
                      <p className="text-[10px] text-gray-300 mt-1">{comment.createdAt}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {totalItems === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
            <Bell size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-1">暂无新通知</p>
            <p className="text-gray-300 text-xs">好友申请、评论消息会显示在这里</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Clock(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
