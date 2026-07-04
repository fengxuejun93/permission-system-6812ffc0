import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import Avatar from './Avatar';
import ConfirmDialog from './ConfirmDialog';
import {
  Globe, Users, Lock, EyeOff, MoreHorizontal, Trash2,
  Pencil, Eye, CornerDownRight, CheckCircle
} from 'lucide-react';
import type { WallMessage, Visibility } from '@/types';
import { useNavigate } from 'react-router-dom';

const visIcon = (v: Visibility) => {
  switch (v) {
    case 'public': return <Globe size={10} />;
    case 'friends': return <Users size={10} />;
    case 'self': return <Lock size={10} />;
  }
};
const visLabel = (v: Visibility) => {
  switch (v) {
    case 'public': return '公开';
    case 'friends': return '好友可见';
    case 'self': return '仅自己';
  }
};

interface Props {
  message: WallMessage;
  isWallOwner: boolean;
  onReply?: (msg: WallMessage) => void;
  onEdit?: (msg: WallMessage) => void;
}

export default function WallMessageCard({ message, isWallOwner, onReply, onEdit }: Props) {
  const { currentUserId, users, deleteWallMessage, hideWallMessage, restoreWallMessage, markWallMessageRead } = useSocialStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isAuthor = message.authorId === currentUserId;
  const canDelete = isAuthor || isWallOwner;
  const canHide = isWallOwner && message.status === 'active';
  const canRestore = isWallOwner && message.status === 'hidden';
  const author = users.find(u => u.id === message.authorId);

  const handleDelete = () => {
    deleteWallMessage(message.id);
    showToast('留言已删除');
    setShowDeleteDialog(false);
    setShowMenu(false);
  };

  const handleHide = () => {
    hideWallMessage(message.id);
    showToast('留言已隐藏');
    setShowMenu(false);
  };

  const handleRestore = () => {
    restoreWallMessage(message.id);
    showToast('留言已恢复');
    setShowMenu(false);
  };

  const handleMarkRead = () => {
    markWallMessageRead(message.id);
    showToast('已标记为已读');
    setShowMenu(false);
  };

  // 回复引用
  const { wallMessages } = useSocialStore();
  const replyToMsg = message.replyToId ? wallMessages.find(m => m.id === message.replyToId) : null;
  const replyToAuthor = replyToMsg ? users.find(u => u.id === replyToMsg.authorId) : null;

  return (
    <div className={`bg-white rounded-lg border p-3.5 transition-all ${message.status === 'hidden' ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-200 hover:shadow-sm'}`}>
      {message.status === 'hidden' && (
        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
          <EyeOff size={10} /> 此留言已被墙主隐藏
        </div>
      )}

      <div className="flex items-start gap-2.5">
        <button onClick={() => navigate(`/profile/${message.authorId}`)} className="shrink-0">
          <Avatar userId={message.authorId} size={36} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <button onClick={() => navigate(`/profile/${message.authorId}`)} className="text-sm font-semibold text-[#3B5998] hover:underline">
              {author?.name}
            </button>
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
              {visIcon(message.visibility)} {visLabel(message.visibility)}
            </span>
            {!message.isRead && isWallOwner && (
              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">未读</span>
            )}
            {message.updatedAt && (
              <span className="text-[10px] text-gray-300">(已编辑)</span>
            )}
            <span className="text-[10px] text-gray-300 ml-auto">{message.createdAt}</span>
          </div>

          {/* 回复引用 */}
          {replyToMsg && replyToAuthor && (
            <div className="mt-1 text-[11px] text-gray-400 bg-gray-50 rounded px-2 py-1 flex items-center gap-1">
              <CornerDownRight size={10} />
              回复 <span className="text-[#3B5998]">{replyToAuthor.name}</span>：{replyToMsg.content.slice(0, 30)}{replyToMsg.content.length > 30 ? '...' : ''}
            </div>
          )}

          <p className="text-sm text-gray-800 mt-1.5 leading-relaxed">{message.content}</p>

          {/* 操作行 */}
          <div className="flex items-center gap-3 mt-2">
            {onReply && message.status === 'active' && (
              <button onClick={() => onReply(message)} className="text-[10px] text-gray-400 hover:text-[#3B5998] flex items-center gap-0.5">
                <CornerDownRight size={10} /> 回复
              </button>
            )}
            {onEdit && isAuthor && message.status === 'active' && (
              <button onClick={() => onEdit(message)} className="text-[10px] text-gray-400 hover:text-[#3B5998] flex items-center gap-0.5">
                <Pencil size={10} /> 编辑
              </button>
            )}
            {!message.isRead && isWallOwner && (
              <button onClick={handleMarkRead} className="text-[10px] text-gray-400 hover:text-green-500 flex items-center gap-0.5">
                <CheckCircle size={10} /> 标记已读
              </button>
            )}

            {(canDelete || canHide || canRestore) && (
              <div className="relative ml-auto">
                <button onClick={() => setShowMenu(!showMenu)} className="text-gray-300 hover:text-gray-500 p-0.5">
                  <MoreHorizontal size={14} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-28 z-10">
                    {canHide && (
                      <button onClick={handleHide} className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                        <EyeOff size={11} /> 隐藏
                      </button>
                    )}
                    {canRestore && (
                      <button onClick={handleRestore} className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-green-600 hover:bg-green-50">
                        <Eye size={11} /> 恢复
                      </button>
                    )}
                    {canDelete && (
                      <>
                        <div className="border-t border-gray-100 my-0.5" />
                        <button onClick={() => { setShowMenu(false); setShowDeleteDialog(true); }} className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50">
                          <Trash2 size={11} /> 删除
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="删除留言"
        message="确定要删除这条留言吗？此操作不可恢复。"
        confirmLabel="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
