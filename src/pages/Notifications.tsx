import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Bell, UserPlus, Check, XCircle, MessageSquare, Clock,
  Activity, FileText, Trash2, Users, Image, Pencil, Lock,
  Globe, Shield, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/Toast';
import type { ActivityAction } from '@/types';

// 操作类型标签配置
const ACTION_CONFIG: Record<ActivityAction, { label: string; color: string; icon: React.ReactNode }> = {
  send_friend_request:    { label: '发送申请', color: 'bg-blue-100 text-blue-700', icon: <UserPlus size={10} /> },
  accept_friend_request:  { label: '通过申请', color: 'bg-green-100 text-green-700', icon: <Check size={10} /> },
  reject_friend_request:  { label: '拒绝申请', color: 'bg-red-100 text-red-700', icon: <XCircle size={10} /> },
  cancel_friend_request:  { label: '取消申请', color: 'bg-amber-100 text-amber-700', icon: <Clock size={10} /> },
  unfriend:               { label: '解除好友', color: 'bg-red-100 text-red-700', icon: <XCircle size={10} /> },
  add_post:               { label: '发布动态', color: 'bg-green-100 text-green-700', icon: <FileText size={10} /> },
  delete_post:            { label: '删除动态', color: 'bg-red-100 text-red-700', icon: <Trash2 size={10} /> },
  update_post_visibility: { label: '改可见性', color: 'bg-purple-100 text-purple-700', icon: <Globe size={10} /> },
  add_comment:            { label: '发表评论', color: 'bg-blue-100 text-blue-700', icon: <MessageSquare size={10} /> },
  add_article:            { label: '发布文章', color: 'bg-green-100 text-green-700', icon: <FileText size={10} /> },
  delete_article:         { label: '删除文章', color: 'bg-red-100 text-red-700', icon: <Trash2 size={10} /> },
  update_article:         { label: '编辑文章', color: 'bg-purple-100 text-purple-700', icon: <Pencil size={10} /> },
  change_photo_visibility:{ label: '改照片权限', color: 'bg-purple-100 text-purple-700', icon: <Lock size={10} /> },
  delete_photo:           { label: '删除照片', color: 'bg-red-100 text-red-700', icon: <Trash2 size={10} /> },
  switch_user:            { label: '切换账号', color: 'bg-gray-100 text-gray-700', icon: <Users size={10} /> },
};

type TabKey = 'dashboard' | 'alerts' | 'logs';

export default function Notifications() {
  const {
    currentUserId,
    users,
    getRelation,
    getPendingReceived,
    getPendingSent,
    comments,
    posts,
    articles,
    photos,
    friendships,
    activityLogs,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    getStats,
    getFriendsOf,
    clearActivityLogs,
  } = useSocialStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [showClearLogDialog, setShowClearLogDialog] = useState(false);

  const pendingReceived = getPendingReceived();
  const pendingSent = getPendingSent();
  const stats = getStats();
  const friends = getFriendsOf(currentUserId);

  // 我收到的评论
  const myPostIds = posts.filter(p => p.authorId === currentUserId).map(p => p.id);
  const commentsOnMyPosts = comments.filter(
    c => myPostIds.includes(c.postId) && c.authorId !== currentUserId
  );

  const handleAccept = (userId: string, name: string) => {
    const rel = getRelation(userId);
    if (rel !== 'pending_received') {
      showToast('该申请已处理', 'info');
      return;
    }
    acceptFriendRequest(userId);
    showToast(`已通过 ${name} 的好友申请`);
  };

  const handleReject = (userId: string, name: string) => {
    const rel = getRelation(userId);
    if (rel !== 'pending_received') {
      showToast('该申请已处理', 'info');
      return;
    }
    rejectFriendRequest(userId);
    showToast(`已拒绝 ${name} 的好友申请`);
  };

  const handleCancel = (friendId: string) => {
    const target = users.find(u => u.id === friendId);
    cancelFriendRequest(friendId);
    showToast(`已取消对 ${target?.name || friendId} 的好友申请`);
  };

  const totalAlerts = pendingReceived.length + pendingSent.length + commentsOnMyPosts.length;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'dashboard', label: '全过程看板', icon: <Activity size={14} /> },
    { key: 'alerts', label: '节点告警', icon: <Bell size={14} />, badge: totalAlerts },
    { key: 'logs', label: '日志审计', icon: <Shield size={14} />, badge: activityLogs.length },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <div className="pt-14 max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={22} className="text-[#3B5998]" />
          <h1 className="text-lg font-bold text-gray-800">通知中心</h1>
        </div>

        {/* Tab栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.key ? 'text-[#3B5998]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.icon} {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${activeTab === tab.key ? 'bg-[#3B5998] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.key && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#3B5998] rounded-full" />}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* ===== 看板 Tab ===== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                {/* 统计卡片 */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium mb-1"><Users size={14} /> 好友</div>
                    <div className="text-2xl font-bold text-blue-700">{stats.friendCount}</div>
                    {stats.pendingReceivedCount > 0 && <div className="text-[10px] text-amber-500 mt-0.5">{stats.pendingReceivedCount} 条待处理</div>}
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium mb-1"><FileText size={14} /> 动态</div>
                    <div className="text-2xl font-bold text-green-700">{stats.postCount}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{stats.commentCount} 条评论</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center gap-1.5 text-purple-600 text-xs font-medium mb-1"><Image size={14} /> 照片/文章</div>
                    <div className="text-2xl font-bold text-purple-700">{stats.photoCount + stats.articleCount}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{stats.photoCount} 照片 · {stats.articleCount} 文章</div>
                  </div>
                </div>

                {/* 责任定位：最近操作摘要 */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                    <Activity size={14} className="text-[#3B5998]" /> 最近操作
                  </h3>
                  {activityLogs.length > 0 ? (
                    <div className="space-y-1.5">
                      {activityLogs.slice(0, 5).map(log => {
                        const config = ACTION_CONFIG[log.action];
                        const operator = users.find(u => u.id === log.operatorId);
                        return (
                          <div key={log.id} className="flex items-center gap-2 text-xs">
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.color}`}>
                              {config.icon} {config.label}
                            </span>
                            <span className="text-gray-400">{operator?.name}</span>
                            <span className="text-gray-500 truncate">{log.detail}</span>
                            <span className="text-gray-300 ml-auto shrink-0">{log.createdAt}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-3">暂无操作记录，进行任意操作后会自动记录</p>
                  )}
                </div>

                {/* 待处理快捷入口 */}
                {pendingReceived.length > 0 && (
                  <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
                    <h3 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> 待你处理
                    </h3>
                    <div className="space-y-2">
                      {pendingReceived.map(req => {
                        const sender = users.find(u => u.id === req.userId);
                        if (!sender) return null;
                        return (
                          <div key={req.userId} className="flex items-center gap-2">
                            <button onClick={() => navigate(`/profile/${sender.id}`)} className="shrink-0">
                              <Avatar userId={sender.id} size={28} />
                            </button>
                            <span className="text-xs text-gray-700 flex-1">{sender.name} 请求加你好友</span>
                            <button onClick={() => handleAccept(sender.id, sender.name)} className="text-[10px] bg-[#3B5998] text-white rounded-full px-2.5 py-1 hover:bg-[#2A4A7F]">
                              通过
                            </button>
                            <button onClick={() => handleReject(sender.id, sender.name)} className="text-[10px] bg-gray-200 text-gray-500 rounded-full px-2.5 py-1 hover:bg-gray-300">
                              拒绝
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== 告警 Tab ===== */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                {/* 好友申请 - 收到的 */}
                {pendingReceived.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                      <UserPlus size={14} className="text-[#3B5998]" /> 好友申请
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{pendingReceived.length}</span>
                    </h2>
                    <div className="space-y-2">
                      {pendingReceived.map(req => {
                        const sender = users.find(u => u.id === req.userId);
                        if (!sender) return null;
                        return (
                          <div key={req.userId} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
                            <button onClick={() => navigate(`/profile/${sender.id}`)} className="shrink-0">
                              <Avatar userId={sender.id} size={40} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <button onClick={() => navigate(`/profile/${sender.id}`)} className="text-sm font-semibold text-[#3B5998] hover:underline">
                                {sender.name}
                              </button>
                              <p className="text-xs text-gray-400">{sender.school} · 请求添加你为好友</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => handleAccept(sender.id, sender.name)} className="flex items-center gap-1 text-xs bg-[#3B5998] text-white rounded-full px-3 py-1.5 hover:bg-[#2A4A7F] transition-colors">
                                <Check size={12} /> 通过
                              </button>
                              <button onClick={() => handleReject(sender.id, sender.name)} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors">
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
                  <div>
                    <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-500" /> 已发出的申请
                      <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">{pendingSent.length}</span>
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
                              <button onClick={() => navigate(`/profile/${target.id}`)} className="text-sm font-medium text-gray-800 hover:underline">
                                {target.name}
                              </button>
                              <p className="text-xs text-amber-500">等待对方确认</p>
                            </div>
                            <button onClick={() => handleCancel(target.id)} className="text-[10px] text-gray-400 hover:text-red-400 transition-colors">
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
                  <div>
                    <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-green-500" /> 我的动态收到的评论
                      <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">{commentsOnMyPosts.length}</span>
                    </h2>
                    <div className="space-y-2">
                      {commentsOnMyPosts.slice(0, 10).map(comment => {
                        const author = users.find(u => u.id === comment.authorId);
                        const post = posts.find(p => p.id === comment.postId);
                        if (!author || !post) return null;
                        return (
                          <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-start gap-3">
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
                {totalAlerts === 0 && (
                  <div className="py-10 text-center">
                    <Bell size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-1">暂无新通知</p>
                    <p className="text-gray-300 text-xs">好友申请、评论消息会显示在这里</p>
                  </div>
                )}
              </div>
            )}

            {/* ===== 日志审计 Tab ===== */}
            {activeTab === 'logs' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Shield size={12} /> 共 {activityLogs.length} 条操作记录
                  </div>
                  {activityLogs.length > 0 && (
                    <button
                      onClick={() => setShowClearLogDialog(true)}
                      className="text-[10px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-0.5"
                    >
                      <Trash2 size={10} /> 清空日志
                    </button>
                  )}
                </div>

                {activityLogs.length > 0 ? (
                  <div className="space-y-1.5">
                    {activityLogs.map(log => {
                      const config = ACTION_CONFIG[log.action];
                      const operator = users.find(u => u.id === log.operatorId);
                      return (
                        <div key={log.id} className="bg-white rounded-lg border border-gray-100 p-2.5 flex items-start gap-2.5 hover:bg-gray-50 transition-colors">
                          <div className="shrink-0 mt-0.5">
                            {operator ? <Avatar userId={log.operatorId} size={24} /> : <Shield size={24} className="text-gray-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-medium text-gray-800">{operator?.name || '系统'}</span>
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.color}`}>
                                {config.icon} {config.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">{log.detail}</p>
                            <p className="text-[10px] text-gray-300 mt-0.5">{log.createdAt}</p>
                          </div>
                          {log.targetId.startsWith('u') && (
                            <button
                              onClick={() => navigate(`/profile/${log.targetId}`)}
                              className="text-[10px] text-[#3B5998] hover:underline shrink-0"
                            >
                              查看
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <Shield size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-1">暂无操作日志</p>
                    <p className="text-gray-300 text-xs">进行任意操作（加好友、发动态、评论等）后会自动记录</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showClearLogDialog}
        title="清空日志"
        message="确定要清空所有操作日志吗？此操作不可恢复。"
        confirmLabel="清空"
        danger
        onConfirm={() => { clearActivityLogs(); showToast('日志已清空'); setShowClearLogDialog(false); }}
        onCancel={() => setShowClearLogDialog(false)}
      />
    </div>
  );
}
