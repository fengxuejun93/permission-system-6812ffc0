import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import PostCard from '@/components/PostCard';
import PhotoCard from '@/components/PhotoCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import { UserPlus, Check, Users, FileText, Image, ArrowLeft, Clock, XCircle, RotateCcw, Trash2, MessageSquare, Shield, ShieldOff } from 'lucide-react';
import type { Photo, WallMessage } from '@/types';
import WallMessageForm from '@/components/WallMessageForm';

// 好友关系按钮组件
function FriendButton({ userId, userName }: { userId: string; userName: string }) {
  const { getRelation, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, rejectFriendRequest, unfriend, restrictUser, unrestrictUser } = useSocialStore();
  const { showToast } = useToast();
  const relation = getRelation(userId);
  const [showUnfriendDialog, setShowUnfriendDialog] = useState(false);
  const [showRestrictDialog, setShowRestrictDialog] = useState(false);

  const handleSend = () => {
    const currentRel = getRelation(userId);
    if (currentRel === 'friend') {
      showToast('你们已经是好友了', 'info');
      return;
    }
    if (currentRel === 'pending_sent') {
      showToast('已发送过申请，请等待对方确认', 'info');
      return;
    }
    if (currentRel === 'restricted') {
      showToast('你已限制该用户，请先解除限制再发送申请', 'info');
      return;
    }
    if (currentRel !== 'none' && currentRel !== 'rejected' && currentRel !== 'rejected_them') {
      showToast('当前状态不允许发送好友申请', 'info');
      return;
    }
    sendFriendRequest(userId);
    showToast(`已向 ${userName} 发送好友申请`);
  };
  const handleCancel = () => {
    const currentRel = getRelation(userId);
    if (currentRel !== 'pending_sent') {
      showToast('没有可取消的申请', 'info');
      return;
    }
    cancelFriendRequest(userId);
    showToast('已取消好友申请');
  };
  const handleAccept = () => {
    const currentRel = getRelation(userId);
    if (currentRel !== 'pending_received') {
      showToast('该申请已处理或不存在', 'info');
      return;
    }
    acceptFriendRequest(userId);
    showToast(`已通过 ${userName} 的好友申请`);
  };
  const handleReject = () => {
    const currentRel = getRelation(userId);
    if (currentRel !== 'pending_received') {
      showToast('该申请已处理或不存在', 'info');
      return;
    }
    rejectFriendRequest(userId);
    showToast(`已拒绝 ${userName} 的好友申请`);
  };
  const handleUnfriend = () => {
    const currentRel = getRelation(userId);
    if (currentRel !== 'friend') {
      showToast('已不是好友关系', 'info');
      setShowUnfriendDialog(false);
      return;
    }
    unfriend(userId);
    showToast(`已解除与 ${userName} 的好友关系`);
    setShowUnfriendDialog(false);
  };
  const handleRestrict = () => {
    restrictUser(userId);
    showToast(`已将 ${userName} 加入受限列表，对方将无法查看你的好友可见和公开内容`);
    setShowRestrictDialog(false);
  };
  const handleUnrestrict = () => {
    unrestrictUser(userId);
    showToast(`已将 ${userName} 移出受限列表`);
  };

  switch (relation) {
    case 'friend':
      return (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 text-sm text-white/80 bg-white/10 rounded-full px-4 py-2">
            <Check size={16} /> 已是好友
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnfriendDialog(true)}
              className="text-[10px] text-white/40 hover:text-red-300 transition-colors"
            >
              解除好友
            </button>
            <button
              onClick={() => setShowRestrictDialog(true)}
              className="text-[10px] text-white/40 hover:text-orange-300 transition-colors flex items-center gap-0.5"
            >
              <Shield size={8} /> 限制
            </button>
          </div>
          <ConfirmDialog
            open={showUnfriendDialog}
            title="解除好友"
            message={`确定要解除与「${userName}」的好友关系吗？解除后你将无法看到对方好友可见的动态和照片。`}
            confirmLabel="解除"
            danger
            onConfirm={handleUnfriend}
            onCancel={() => setShowUnfriendDialog(false)}
          />
          <ConfirmDialog
            open={showRestrictDialog}
            title="限制用户"
            message={`确定要将「${userName}」加入受限列表吗？受限后对方将无法查看你的公开和好友可见内容，也无法给你留言。`}
            confirmLabel="限制"
            danger
            onConfirm={handleRestrict}
            onCancel={() => setShowRestrictDialog(false)}
          />
        </div>
      );
    case 'pending_sent':
      return (
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 text-sm text-white/80 bg-white/10 rounded-full px-4 py-2">
            <Clock size={16} /> 待对方确认
          </div>
          <button onClick={handleCancel} className="text-[10px] text-white/50 hover:text-white/80 transition-colors">取消申请</button>
        </div>
      );
    case 'pending_received':
      return (
        <div className="flex items-center gap-2">
          <button onClick={handleAccept} className="flex items-center gap-1.5 text-sm bg-white text-[#3B5998] rounded-full px-4 py-2 font-medium hover:bg-gray-100 transition-colors">
            <Check size={16} /> 通过
          </button>
          <button onClick={handleReject} className="flex items-center gap-1.5 text-sm bg-white/10 text-white/80 rounded-full px-4 py-2 hover:bg-white/20 transition-colors">
            <XCircle size={16} /> 拒绝
          </button>
        </div>
      );
    case 'restricted':
      return (
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 text-sm text-orange-300 bg-orange-500/10 rounded-full px-4 py-2">
            <Shield size={16} /> 已限制
          </div>
          <p className="text-[10px] text-white/40">对方无法查看你的内容和留言</p>
          <div className="flex items-center gap-2">
            <button onClick={handleUnrestrict} className="text-[10px] text-green-300/60 hover:text-green-300 transition-colors flex items-center gap-0.5">
              <ShieldOff size={8} /> 解除限制
            </button>
          </div>
        </div>
      );
    case 'rejected':
      return (
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 text-sm text-red-300 bg-red-500/10 rounded-full px-4 py-2">
            <XCircle size={16} /> 申请被拒
          </div>
          <button onClick={handleSend} className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white/80 transition-colors">
            <RotateCcw size={10} /> 重新申请
          </button>
        </div>
      );
    case 'rejected_them':
      return (
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 text-sm text-orange-300 bg-orange-500/10 rounded-full px-4 py-2">
            <XCircle size={16} /> 你已拒绝
          </div>
          <button onClick={handleSend} className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white/80 transition-colors">
            <RotateCcw size={10} /> 重新申请
          </button>
        </div>
      );
    case 'none':
    default:
      return (
        <div className="flex flex-col items-end gap-1">
          <button onClick={handleSend} className="flex items-center gap-1.5 text-sm bg-white text-[#3B5998] rounded-full px-4 py-2 font-medium hover:bg-gray-100 transition-colors">
            <UserPlus size={16} /> 加为好友
          </button>
        </div>
      );
  }
}

// 照片卡片带删除功能
function ProfilePhotoCard({ photo, isOwner }: { photo: Photo; isOwner: boolean }) {
  const { deletePhoto } = useSocialStore();
  const { showToast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    deletePhoto(photo.id);
    showToast(`照片「${photo.label}」已删除`);
    setShowDeleteDialog(false);
  };

  return (
    <div className="relative">
      <PhotoCard photo={photo} isOwner={isOwner} />
      {isOwner && (
        <>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
            title="删除照片"
          >
            <Trash2 size={10} />
          </button>
          <ConfirmDialog
            open={showDeleteDialog}
            title="删除照片"
            message={`确定要删除照片「${photo.label}」吗？如果该照片关联了某条动态，也会从动态中移除。此操作不可恢复。`}
            confirmLabel="删除"
            danger
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteDialog(false)}
          />
        </>
      )}
    </div>
  );
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { users, currentUserId, getVisiblePosts, getVisiblePhotos, getFriendsOf, posts, photos, comments, getMutualFriends, getCommentsForPost, getVisibleWallMessages, canWriteWall, deleteWallMessage, hideWallMessage, restoreWallMessage, markWallMessageRead, wallMessages, getRelation, friendships } = useSocialStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'friends' | 'wall'>('posts');
  const [replyTo, setReplyTo] = useState<WallMessage | null>(null);

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <Header />
        <div className="pt-20 text-center">
          <p className="text-gray-400 mb-4">用户ID缺失</p>
          <button onClick={() => navigate('/')} className="text-sm text-[#3B5998] hover:underline">返回首页</button>
        </div>
      </div>
    );
  }

  const profileUser = users.find(u => u.id === userId);
  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <Header />
        <div className="pt-20 text-center">
          <p className="text-gray-400 mb-4">用户不存在</p>
          <button onClick={() => navigate('/')} className="text-sm text-[#3B5998] hover:underline">返回首页</button>
        </div>
      </div>
    );
  }

  const isMe = userId === currentUserId;
  const visiblePosts = getVisiblePosts(userId);
  const visiblePhotos = getVisiblePhotos(userId);
  const profileFriends = getFriendsOf(userId);
  const allUserPosts = posts.filter(p => p.authorId === userId);
  const allUserPhotos = photos.filter(p => p.ownerId === userId);
  const hiddenPostCount = allUserPosts.length - visiblePosts.length;
  const hiddenPhotoCount = allUserPhotos.length - visiblePhotos.length;
  const visibleWallMsgs = getVisibleWallMessages(userId);
  const wallMsgCount = visibleWallMsgs.filter(m => m.status === 'active').length;
  const canWrite = canWriteWall(userId);

  // 共同好友
  const mutualFriends = !isMe ? getMutualFriends(userId) : [];

  // 最近评论：从该用户的可见动态中找评论
  const recentComments = visiblePosts
    .flatMap(p => getCommentsForPost(p.id))
    .filter(c => c.authorId !== userId) // 排除自己的评论，看别人给ta的评论
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />

      <div className="bg-gradient-to-r from-[#3B5998] to-[#5B7DC9] pt-14">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-end gap-5">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg shrink-0"
              style={{ backgroundColor: profileUser.avatarColor }}
            >
              {profileUser.name[0]}
            </div>
            {profileUser.online && (
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-3 border-white rounded-full" title="在线" />
            )}
          </div>
          <div className="flex-1 text-white mb-1">
            <h1 className="text-2xl font-bold">{profileUser.name}</h1>
            <p className="text-white/70 text-sm mt-1">{profileUser.school} · {profileUser.className} · {profileUser.grade}</p>
            <p className="text-white/50 text-xs mt-0.5 italic">"{profileUser.signature}"</p>
          </div>
          {!isMe && (
            <div className="mb-2">
              <FriendButton userId={userId} userName={profileUser.name} />
            </div>
          )}
        </div>
      </div>

      {/* 被限制提示横幅 */}
      {!isMe && (() => {
        const restrictedByThem = friendships.some(f => f.userId === userId && f.friendId === currentUserId && f.status === 'restricted');
        return restrictedByThem;
      })() && (
        <div className="max-w-4xl mx-auto px-4 mt-3">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
            <Shield size={20} className="text-orange-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-700">你已被该用户限制访问</p>
              <p className="text-xs text-orange-500 mt-0.5">你无法查看该用户的公开内容、照片和留言板</p>
            </div>
            <button onClick={() => navigate(-1)} className="ml-auto text-xs text-orange-400 hover:text-orange-600 shrink-0">返回上一页</button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 -mt-1">
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t-0 px-6 py-3 flex items-center gap-6 text-sm flex-wrap">
          <span className="flex items-center gap-1.5 text-gray-500"><Users size={16} className="text-[#3B5998]" /> <b className="text-gray-800">{profileFriends.length}</b> 好友</span>
          <span className="flex items-center gap-1.5 text-gray-500"><FileText size={16} className="text-[#3B5998]" /> <b className="text-gray-800">{isMe ? allUserPosts.length : visiblePosts.length}</b> 动态</span>
          <span className="flex items-center gap-1.5 text-gray-500"><Image size={16} className="text-[#3B5998]" /> <b className="text-gray-800">{isMe ? allUserPhotos.length : visiblePhotos.length}</b> 照片</span>
          <span className="flex items-center gap-1.5 text-gray-500"><MessageSquare size={16} className="text-[#3B5998]" /> <b className="text-gray-800">{wallMsgCount}</b> 留言</span>
          {!isMe && mutualFriends.length > 0 && (
            <span className="flex items-center gap-1.5 text-gray-500"><Users size={16} className="text-purple-500" /> <b className="text-gray-800">{mutualFriends.length}</b> 共同好友</span>
          )}
          {!isMe && (hiddenPostCount > 0 || hiddenPhotoCount > 0) && (
            <span className="text-xs text-gray-400 ml-auto">
              因权限不可见：{hiddenPostCount > 0 && `${hiddenPostCount} 条动态`}{hiddenPostCount > 0 && hiddenPhotoCount > 0 && '、'}{hiddenPhotoCount > 0 && `${hiddenPhotoCount} 张照片`}
              {!isMe && getRelation(userId) !== 'friend' && (
                <button onClick={() => {}} className="text-[#3B5998] hover:underline ml-1">成为好友查看更多</button>
              )}
            </span>
          )}
          {isMe && (hiddenPostCount > 0 || hiddenPhotoCount > 0) && (
            <span className="text-xs text-gray-400 ml-auto">
              他人不可见：{hiddenPostCount > 0 && `${hiddenPostCount} 条动态`}{hiddenPostCount > 0 && hiddenPhotoCount > 0 && '、'}{hiddenPhotoCount > 0 && `${hiddenPhotoCount} 张照片`}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-3 pb-6">
        {/* 共同好友和最近评论区域 */}
        {((!isMe && mutualFriends.length > 0) || (!isMe && recentComments.length > 0)) ? (
          <div className="grid grid-cols-2 gap-3 mb-3">
            {mutualFriends.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-1.5">
                  <Users size={14} className="text-purple-500" /> 共同好友
                  <span className="text-xs text-gray-400 font-normal">({mutualFriends.length})</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mutualFriends.slice(0, 6).map(mf => (
                    <button
                      key={mf.id}
                      onClick={() => navigate(`/profile/${mf.id}`)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar userId={mf.id} size={24} />
                      <span className="text-xs text-gray-700">{mf.name}</span>
                    </button>
                  ))}
                  {mutualFriends.length > 6 && <span className="text-xs text-gray-400 self-center">等{mutualFriends.length}人</span>}
                </div>
              </div>
            )}
            {recentComments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-[#3B5998]" /> 最近评论
                </h3>
                <div className="space-y-2">
                  {recentComments.slice(0, 3).map(c => {
                    const commenter = users.find(u => u.id === c.authorId);
                    const post = posts.find(p => p.id === c.postId);
                    return (
                      <div key={c.id} className="flex items-start gap-2">
                        <Avatar userId={c.authorId} size={20} />
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-[#3B5998]">{commenter?.name}</span>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{c.content}</p>
                          {post && <span className="text-[10px] text-gray-300">回复「{post.content.slice(0, 15)}...」</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : !isMe && mutualFriends.length === 0 && recentComments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-3 text-center">
            <Users size={24} className="text-gray-300 mx-auto mb-1.5" />
            <p className="text-gray-400 text-xs">暂无共同好友和互动记录</p>
            <p className="text-gray-300 text-[10px] mt-0.5">成为好友后可以看到更多信息</p>
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {(['posts', 'photos', 'friends', 'wall'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-[#3B5998]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'posts' ? '动态' : tab === 'photos' ? '照片' : tab === 'friends' ? '好友' : '留言板'}
                {activeTab === tab && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#3B5998] rounded-full" />}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === 'posts' && (
              <div className="space-y-3">
                {visiblePosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
                {visiblePosts.length === 0 && (
                  <div className="text-center py-10">
                    {isMe ? (
                      <>
                        <FileText size={36} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm font-medium">你还没有发布动态</p>
                        <p className="text-gray-400 text-xs mt-1">去首页发布第一条动态吧</p>
                        <button onClick={() => navigate('/')} className="mt-3 text-xs bg-[#3B5998] text-white px-4 py-1.5 rounded-full hover:bg-[#2A4A7F]">去发布动态</button>
                      </>
                    ) : (
                      <>
                        <FileText size={36} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm font-medium">无法查看该用户的动态</p>
                        <p className="text-gray-400 text-xs mt-1">该用户没有公开动态，成为好友后可能可以看到更多内容</p>
                        <div className="mt-3 flex justify-center gap-3">
                          <button onClick={() => navigate('/search')} className="text-xs text-[#3B5998] hover:underline">返回搜索</button>
                          <button onClick={() => navigate(-1)} className="text-xs text-gray-400 hover:text-gray-600">返回上一页</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="grid grid-cols-3 gap-3">
                {visiblePhotos.map(photo => (
                  <ProfilePhotoCard key={photo.id} photo={photo} isOwner={isMe} />
                ))}
                {visiblePhotos.length === 0 && (
                  <div className="col-span-3 text-center py-10">
                    {isMe ? (
                      <>
                        <Image size={36} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm font-medium">你还没有照片</p>
                        <p className="text-gray-400 text-xs mt-1">发布动态时可以附带照片，去发布你的第一张照片吧</p>
                        <button onClick={() => navigate('/')} className="mt-3 text-xs bg-[#3B5998] text-white px-4 py-1.5 rounded-full hover:bg-[#2A4A7F]">去发布照片</button>
                      </>
                    ) : (
                      <>
                        <Image size={36} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm font-medium">无法查看该用户的照片</p>
                        <p className="text-gray-400 text-xs mt-1">该用户没有公开照片，成为好友后可能可以看到更多内容</p>
                        <div className="mt-3 flex justify-center gap-3">
                          <button onClick={() => navigate('/search')} className="text-xs text-[#3B5998] hover:underline">返回搜索</button>
                          <button onClick={() => navigate(-1)} className="text-xs text-gray-400 hover:text-gray-600">返回上一页</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'friends' && (
              <div className="grid grid-cols-2 gap-3">
                {profileFriends.map(friend => (
                  <button
                    key={friend.id}
                    onClick={() => navigate(`/profile/${friend.id}`)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors text-left"
                  >
                    <Avatar userId={friend.id} size={40} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{friend.name}</div>
                      <div className="text-xs text-gray-400 truncate">{friend.school}</div>
                    </div>
                  </button>
                ))}
                {profileFriends.length === 0 && (
                  <div className="col-span-2 text-center py-10">
                    {isMe ? (
                      <>
                        <Users size={36} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm font-medium">你还没有好友</p>
                        <p className="text-gray-400 text-xs mt-1">去搜索发现同学，发起好友申请吧</p>
                        <button onClick={() => navigate('/search')} className="mt-3 text-xs bg-[#3B5998] text-white px-4 py-1.5 rounded-full hover:bg-[#2A4A7F]">去搜索添加好友</button>
                      </>
                    ) : (
                      <>
                        <Users size={36} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm font-medium">该用户暂无好友</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 留言板 Tab */}
            {activeTab === 'wall' && (
              <div>
                {/* 留言表单 */}
                {canWrite && (
                  <div className="mb-4">
                    <WallMessageForm
                      wallOwnerId={userId}
                      replyTo={replyTo}
                      onSubmitted={() => setReplyTo(null)}
                      onCancel={() => setReplyTo(null)}
                    />
                  </div>
                )}

                {/* 留言列表 */}
                {visibleWallMsgs.filter(m => m.status === 'active').length > 0 ? (
                  <div className="space-y-3">
                    {visibleWallMsgs
                      .filter(m => m.status === 'active' && m.replyToId === null)
                      .map(msg => {
                        const replies = visibleWallMsgs.filter(r => r.replyToId === msg.id && r.status === 'active');
                        return (
                          <div key={msg.id}>
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                              <div className="flex items-start gap-2.5">
                                <button onClick={() => navigate(`/profile/${msg.authorId}`)} className="shrink-0">
                                  <Avatar userId={msg.authorId} size={32} />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <button onClick={() => navigate(`/profile/${msg.authorId}`)} className="text-sm font-semibold text-[#3B5998] hover:underline">
                                      {users.find(u => u.id === msg.authorId)?.name}
                                    </button>
                                    <span className="text-[10px] text-gray-300">{msg.createdAt}</span>
                                    {!msg.isRead && isMe && (
                                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">未读</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 mt-1">{msg.content}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    {canWrite && (
                                      <button onClick={() => setReplyTo(msg)} className="text-[10px] text-gray-400 hover:text-[#3B5998]">回复</button>
                                    )}
                                    {isMe && !msg.isRead && (
                                      <button onClick={() => { markWallMessageRead(msg.id); }} className="text-[10px] text-gray-400 hover:text-green-500">标记已读</button>
                                    )}
                                    {(msg.authorId === currentUserId || isMe) && (
                                      <button onClick={() => { deleteWallMessage(msg.id); }} className="text-[10px] text-gray-300 hover:text-red-400">删除</button>
                                    )}
                                    {isMe && (
                                      <button onClick={() => { hideWallMessage(msg.id); }} className="text-[10px] text-gray-300 hover:text-gray-500">隐藏</button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {replies.length > 0 && (
                              <div className="ml-8 mt-2 space-y-2">
                                {replies.map(reply => (
                                  <div key={reply.id} className="bg-gray-50 rounded-lg border border-gray-100 p-2.5">
                                    <div className="flex items-start gap-2">
                                      <button onClick={() => navigate(`/profile/${reply.authorId}`)} className="shrink-0">
                                        <Avatar userId={reply.authorId} size={24} />
                                      </button>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <button onClick={() => navigate(`/profile/${reply.authorId}`)} className="text-xs font-semibold text-[#3B5998] hover:underline">
                                            {users.find(u => u.id === reply.authorId)?.name}
                                          </button>
                                          <span className="text-[10px] text-gray-300">{reply.createdAt}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-0.5">{reply.content}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                          {canWrite && (
                                            <button onClick={() => setReplyTo(reply)} className="text-[10px] text-gray-400 hover:text-[#3B5998]">回复</button>
                                          )}
                                          {(reply.authorId === currentUserId || isMe) && (
                                            <button onClick={() => { deleteWallMessage(reply.id); }} className="text-[10px] text-gray-300 hover:text-red-400">删除</button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
                    {isMe ? (
                      <>
                        <p className="text-gray-500 text-sm font-medium">你的留言板还是空的</p>
                        <p className="text-gray-400 text-xs mt-1">给自己留一条，或让朋友来留言吧</p>
                        <button onClick={() => navigate('/classmates')} className="mt-3 text-xs text-[#3B5998] hover:underline">邀请同学来留言</button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 text-sm font-medium">留言板还是空的</p>
                        {canWrite ? (
                          <>
                            <p className="text-gray-400 text-xs mt-1">成为第一个留言的人吧</p>
                          </>
                        ) : (
                          <p className="text-gray-400 text-xs mt-1">你无法在此留言板留言</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 已隐藏留言（仅墙主可见） */}
                {isMe && visibleWallMsgs.filter(m => m.status === 'hidden').length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs text-gray-400 mb-2 flex items-center gap-1">已隐藏的留言</h4>
                    <div className="space-y-2">
                      {visibleWallMsgs.filter(m => m.status === 'hidden').map(msg => (
                        <div key={msg.id} className="bg-gray-50 rounded-lg border border-gray-100 p-3 opacity-70">
                          <div className="flex items-center gap-2">
                            <Avatar userId={msg.authorId} size={24} />
                            <span className="text-xs text-gray-500">{users.find(u => u.id === msg.authorId)?.name}</span>
                            <span className="text-[10px] text-gray-300">{msg.content.slice(0, 30)}...</span>
                            <div className="ml-auto flex gap-1.5">
                              <button onClick={() => { restoreWallMessage(msg.id); }} className="text-[10px] text-green-500 hover:underline">恢复</button>
                              <button onClick={() => { deleteWallMessage(msg.id); }} className="text-[10px] text-red-400 hover:underline">删除</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-1.5 text-sm text-[#3B5998] hover:underline"
        >
          <ArrowLeft size={14} /> 返回上一页
        </button>
      </div>
    </div>
  );
}
