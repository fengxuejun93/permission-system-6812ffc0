import { useState, useRef, useEffect } from 'react';
import { useSocialStore } from '@/store/socialStore';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import ConfirmDialog from './ConfirmDialog';
import { Globe, Users, Lock, Eye, EyeOff, Trash2, MoreHorizontal } from 'lucide-react';
import type { Post, Visibility } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/Toast';

const visibilityIcon = (v: Visibility) => {
  switch (v) {
    case 'public': return <Globe size={12} />;
    case 'friends': return <Users size={12} />;
    case 'self': return <Lock size={12} />;
  }
};

const visibilityLabel = (v: Visibility) => {
  switch (v) {
    case 'public': return '公开';
    case 'friends': return '好友可见';
    case 'self': return '仅自己';
  }
};

const visOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: '公开', icon: <Globe size={12} /> },
  { value: 'friends', label: '好友可见', icon: <Users size={12} /> },
  { value: 'self', label: '仅自己可见', icon: <Lock size={12} /> },
];

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const { users, currentUserId, getVisiblePhotosForPost, deletePost, updatePostVisibility } = useSocialStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const author = users.find(u => u.id === post.authorId);
  const isAuthor = post.authorId === currentUserId;

  const visiblePhotos = getVisiblePhotosForPost(post.photoIds);
  const invisiblePhotoCount = post.photoIds.length - visiblePhotos.length;

  // 删除确认
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // 更多操作菜单
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const handleDelete = () => {
    deletePost(post.id);
    showToast('动态已删除');
    setShowDeleteDialog(false);
  };

  const handleVisibilityChange = (v: Visibility) => {
    updatePostVisibility(post.id, v);
    showToast(`动态可见性已改为「${visibilityLabel(v)}」`);
    setShowMenu(false);
  };

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
            {/* 作者操作菜单 */}
            {isAuthor && (
              <div ref={menuRef} className="ml-auto relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-300 hover:text-gray-500 transition-colors p-0.5"
                >
                  <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36 z-10">
                    {visOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleVisibilityChange(opt.value)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${post.visibility === opt.value ? 'text-[#3B5998] font-medium bg-blue-50' : 'text-gray-600'}`}
                      >
                        {opt.icon} 改为{opt.label}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => { setShowMenu(false); setShowDeleteDialog(true); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} /> 删除动态
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400">{author?.school} · {post.createdAt}</div>

          <p className="text-sm text-gray-800 mt-2 leading-relaxed">{post.content}</p>

          {visiblePhotos.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {visiblePhotos.map(photo => (
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
                    <div className="absolute top-1 right-1 bg-black/30 rounded-full p-0.5" title={photo.visibility === 'self' ? '仅自己可见' : photo.visibility === 'friends' ? '好友可见' : '公开'}>
                      {photo.visibility === 'self' ? <EyeOff size={10} className="text-white/80" /> : <Eye size={10} className="text-white/80" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {invisiblePhotoCount > 0 && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 bg-gray-50 rounded px-2 py-1">
              <EyeOff size={10} /> 另有 {invisiblePhotoCount} 张照片因权限不可见
            </div>
          )}

          <CommentSection postId={post.id} />
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="删除动态"
        message="确定要删除这条动态吗？关联的照片和评论将一并删除，此操作不可恢复。"
        confirmLabel="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
