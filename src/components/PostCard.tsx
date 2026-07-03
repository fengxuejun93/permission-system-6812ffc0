import { useSocialStore } from '@/store/socialStore';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import { Globe, Users, Lock, Eye, EyeOff } from 'lucide-react';
import type { Post } from '@/types';
import { useNavigate } from 'react-router-dom';

const visibilityIcon = (v: Post['visibility']) => {
  switch (v) {
    case 'public': return <Globe size={12} />;
    case 'friends': return <Users size={12} />;
    case 'self': return <Lock size={12} />;
  }
};

const visibilityLabel = (v: Post['visibility']) => {
  switch (v) {
    case 'public': return '公开';
    case 'friends': return '好友可见';
    case 'self': return '仅自己';
  }
};

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const { users, photos, currentUserId, isFriend } = useSocialStore();
  const navigate = useNavigate();
  const author = users.find(u => u.id === post.authorId);
  const postPhotos = photos.filter(p => post.photoIds.includes(p.id));
  const isAuthor = post.authorId === currentUserId;

  // 不可见照片提示
  const invisiblePhotoCount = post.photoIds.length - postPhotos.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(`/profile/${post.authorId}`)} className="shrink-0">
          <Avatar userId={post.authorId} size={40} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/profile/${post.authorId}`)}
              className="text-sm font-semibold text-[#3B5998] hover:underline"
            >
              {author?.name}
            </button>
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
              {visibilityIcon(post.visibility)} {visibilityLabel(post.visibility)}
            </span>
          </div>
          <div className="text-xs text-gray-400">{author?.school} · {post.createdAt}</div>

          <p className="text-sm text-gray-800 mt-2 leading-relaxed">{post.content}</p>

          {postPhotos.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {postPhotos.map(photo => (
                <div key={photo.id} className="relative rounded-md overflow-hidden">
                  {photo.imageUrl ? (
                    <img src={photo.imageUrl} alt={photo.label} className="w-40 h-30 object-cover rounded-md" />
                  ) : (
                    <div
                      className="w-40 h-30 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: photo.color }}
                    >
                      <span className="text-white/80 text-xs font-medium">{photo.label}</span>
                    </div>
                  )}
                  {isAuthor && (
                    <div className="absolute top-1 right-1 bg-black/30 rounded-full p-0.5">
                      {photo.visibility === 'self' ? <EyeOff size={10} className="text-white/80" /> : <Eye size={10} className="text-white/80" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 不可见照片提示（查看别人主页时） */}
          {invisiblePhotoCount > 0 && !isAuthor && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 bg-gray-50 rounded px-2 py-1">
              <EyeOff size={10} /> 另有 {invisiblePhotoCount} 张照片因权限不可见
            </div>
          )}

          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}
