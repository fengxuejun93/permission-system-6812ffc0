import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import PostCard from '@/components/PostCard';
import PhotoCard from '@/components/PhotoCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import { UserPlus, Check, Users, FileText, Image, ArrowLeft, Clock, XCircle, RotateCcw, UserMinus, Trash2 } from 'lucide-react';
import type { RelationType, Photo } from '@/types';

// 好友关系按钮组件
function FriendButton({ userId, userName }: { userId: string; userName: string }) {
  const { getRelation, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, rejectFriendRequest, unfriend } = useSocialStore();
  const { showToast } = useToast();
  const relation = getRelation(userId);
  const [showUnfriendDialog, setShowUnfriendDialog] = useState(false);

  const handleSend = () => {
    sendFriendRequest(userId);
    showToast(`已向 ${userName} 发送好友申请`);
  };

  const handleCancel = () => {
    cancelFriendRequest(userId);
    showToast('已取消好友申请');
  };

  const handleAccept = () => {
    acceptFriendRequest(userId);
    showToast(`已通过 ${userName} 的好友申请`);
  };

  const handleReject = () => {
    rejectFriendRequest(userId);
    showToast(`已拒绝 ${userName} 的好友申请`);
  };

  const handleUnfriend = () => {
    unfriend(userId);
    showToast(`已解除与 ${userName} 的好友关系`);
    setShowUnfriendDialog(false);
  };

  switch (relation) {
    case 'friend':
      return (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 text-sm text-white/80 bg-white/10 rounded-full px-4 py-2">
            <Check size={16} /> 已是好友
          </div>
          <button
            onClick={() => setShowUnfriendDialog(true)}
            className="text-[10px] text-white/40 hover:text-red-300 transition-colors"
          >
            解除好友
          </button>
          <ConfirmDialog
            open={showUnfriendDialog}
            title="解除好友"
            message={`确定要解除与「${userName}」的好友关系吗？解除后你将无法看到对方好友可见的动态和照片。`}
            confirmLabel="解除"
            danger
            onConfirm={handleUnfriend}
            onCancel={() => setShowUnfriendDialog(false)}
          />
        </div>
      );
    case 'pending_sent':
      return (
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 text-sm text-white/80 bg-white/10 rounded-full px-4 py-2">
            <Clock size={16} /> 待对方确认
          </div>
          <button
            onClick={handleCancel}
            className="text-[10px] text-white/50 hover:text-white/80 transition-colors"
          >
            取消申请
          </button>
        </div>
      );
    case 'pending_received':
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={handleAccept}
            className="flex items-center gap-1.5 text-sm bg-white text-[#3B5998] rounded-full px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
          >
            <Check size={16} /> 通过
          </button>
          <button
            onClick={handleReject}
            className="flex items-center gap-1.5 text-sm bg-white/10 text-white/80 rounded-full px-4 py-2 hover:bg-white/20 transition-colors"
          >
            <XCircle size={16} /> 拒绝
          </button>
        </div>
      );
    case 'rejected':
      return (
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 text-sm text-red-300 bg-red-500/10 rounded-full px-4 py-2">
            <XCircle size={16} /> 申请被拒
          </div>
          <button
            onClick={handleSend}
            className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white/80 transition-colors"
          >
            <RotateCcw size={10} /> 重新申请
          </button>
        </div>
      );
    case 'none':
    default:
      return (
        <button
          onClick={handleSend}
          className="flex items-center gap-1.5 text-sm bg-white text-[#3B5998] rounded-full px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
        >
          <UserPlus size={16} /> 加为好友
        </button>
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
  const { users, currentUserId, getVisiblePosts, getVisiblePhotos, getFriendsOf, posts, photos } = useSocialStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'friends'>('posts');

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

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />

      <div className="bg-gradient-to-r from-[#3B5998] to-[#5B7DC9] pt-14">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-end gap-5">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg shrink-0"
            style={{ backgroundColor: profileUser.avatarColor }}
          >
            {profileUser.name[0]}
          </div>
          <div className="flex-1 text-white mb-1">
            <h1 className="text-2xl font-bold">{profileUser.name}</h1>
            <p className="text-white/70 text-sm mt-1">{profileUser.school} · {profileUser.className}</p>
            <p className="text-white/50 text-xs mt-0.5 italic">"{profileUser.signature}"</p>
          </div>
          {!isMe && (
            <div className="mb-2">
              <FriendButton userId={userId} userName={profileUser.name} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-1">
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t-0 px-6 py-3 flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-gray-500"><Users size={16} className="text-[#3B5998]" /> <b className="text-gray-800">{profileFriends.length}</b> 好友</span>
          <span className="flex items-center gap-1.5 text-gray-500"><FileText size={16} className="text-[#3B5998]" /> <b className="text-gray-800">{isMe ? allUserPosts.length : visiblePosts.length}</b> 动态</span>
          <span className="flex items-center gap-1.5 text-gray-500"><Image size={16} className="text-[#3B5998]" /> <b className="text-gray-800">{isMe ? allUserPhotos.length : visiblePhotos.length}</b> 照片</span>
          {!isMe && (hiddenPostCount > 0 || hiddenPhotoCount > 0) && (
            <span className="text-xs text-gray-400 ml-auto">
              因权限不可见：{hiddenPostCount > 0 && `${hiddenPostCount} 条动态`}{hiddenPostCount > 0 && hiddenPhotoCount > 0 && '、'}{hiddenPhotoCount > 0 && `${hiddenPhotoCount} 张照片`}
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {(['posts', 'photos', 'friends'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-[#3B5998]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'posts' ? '动态' : tab === 'photos' ? '照片' : '好友'}
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
                  <div className="text-center text-gray-400 text-sm py-8">
                    {isMe ? '暂无动态，去发布一条吧！' : '无法查看该用户的动态（非好友仅可见公开内容）'}
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
                  <div className="col-span-3 text-center text-gray-400 text-sm py-8">
                    {isMe ? '暂无照片，发布动态时可以附带照片' : '无法查看该用户的照片（非好友仅可见公开内容）'}
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
                  <div className="col-span-2 text-center text-gray-400 text-sm py-8">
                    {isMe ? '暂无好友，去搜索添加吧！' : '该用户暂无好友'}
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
