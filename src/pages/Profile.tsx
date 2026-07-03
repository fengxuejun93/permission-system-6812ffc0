import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import PostCard from '@/components/PostCard';
import PhotoCard from '@/components/PhotoCard';
import { UserPlus, Check, Users, FileText, Image, ArrowLeft } from 'lucide-react';

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { users, currentUserId, isFriend, addFriend, getVisiblePosts, getVisiblePhotos, getFriendsOf, posts, photos } = useSocialStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'friends'>('posts');

  // userId 不存在时显示错误状态
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
  const alreadyFriend = isFriend(userId);
  const visiblePosts = getVisiblePosts(userId);
  const visiblePhotos = getVisiblePhotos(userId);
  const profileFriends = getFriendsOf(userId);
  const allUserPosts = posts.filter(p => p.authorId === userId);
  const allUserPhotos = photos.filter(p => p.ownerId === userId);

  const handleAddFriend = () => {
    addFriend(userId);
    showToast(`已添加 ${profileUser.name} 为好友！`);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />

      {/* 封面区 */}
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
              {alreadyFriend ? (
                <div className="flex items-center gap-1.5 text-sm text-white/80 bg-white/10 rounded-full px-4 py-2">
                  <Check size={16} /> 已是好友
                </div>
              ) : (
                <button
                  onClick={handleAddFriend}
                  className="flex items-center gap-1.5 text-sm bg-white text-[#3B5998] rounded-full px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
                >
                  <UserPlus size={16} /> 加为好友
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 统计栏 */}
      <div className="max-w-4xl mx-auto px-4 -mt-1">
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t-0 px-6 py-3 flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-gray-500"><Users size={16} className="text-[#3B5998]" /> <b className="text-gray-800">{profileFriends.length}</b> 好友</span>
          <span className="flex items-center gap-1.5 text-gray-500"><FileText size={16} className="text-[#3B5998]" /> <b className="text-gray-800">{isMe ? allUserPosts.length : visiblePosts.length}</b> 动态{isMe && visiblePosts.length < allUserPosts.length && <span className="text-xs text-gray-400 ml-1">（他人可见 {visiblePosts.length}）</span>}</span>
          <span className="flex items-center gap-1.5 text-gray-500"><Image size={16} className="text-[#3B5998]" /> <b className="text-gray-800">{isMe ? allUserPhotos.length : visiblePhotos.length}</b> 照片{isMe && visiblePhotos.length < allUserPhotos.length && <span className="text-xs text-gray-400 ml-1">（他人可见 {visiblePhotos.length}）</span>}</span>
        </div>
      </div>

      {/* 标签切换 */}
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
                  <PhotoCard key={photo.id} photo={photo} isOwner={isMe} />
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

        {/* 返回按钮 */}
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
