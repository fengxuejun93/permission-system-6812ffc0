import { useSocialStore } from '@/store/socialStore';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import { Globe, Users, Lock, Eye } from 'lucide-react';
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
  const { users, photos, currentUserId } = useSocialStore();
  const navigate = useNavigate();
  const author = users.find(u => u.id === post.authorId);
  const postPhotos = photos.filter(p => post.photoIds.includes(p.id));

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
                <div
                  key={photo.id}
                  className="w-32 h-24 rounded-md flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: photo.color }}
                >
                  <span className="text-white/80 text-xs font-medium">{photo.label}</span>
                  {post.authorId === currentUserId && (
                    <div className="absolute top-1 right-1">
                      <Eye size={10} className="text-white/60" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}
