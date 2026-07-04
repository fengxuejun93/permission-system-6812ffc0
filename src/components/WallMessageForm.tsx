import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import Avatar from './Avatar';
import { Globe, Users, Lock, Send, CornerDownRight, X } from 'lucide-react';
import type { Visibility, WallMessage } from '@/types';

const visOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: '公开', icon: <Globe size={12} /> },
  { value: 'friends', label: '好友可见', icon: <Users size={12} /> },
  { value: 'self', label: '仅自己', icon: <Lock size={12} /> },
];

interface Props {
  wallOwnerId: string;
  replyTo?: WallMessage | null;
  editMessage?: WallMessage | null;
  onSubmitted?: () => void;
  onCancel?: () => void;
}

export default function WallMessageForm({ wallOwnerId, replyTo, editMessage, onSubmitted, onCancel }: Props) {
  const { currentUserId, addWallMessage, editWallMessage, canWriteWall } = useSocialStore();
  const { showToast } = useToast();
  const [content, setContent] = useState(editMessage?.content || '');
  const [visibility, setVisibility] = useState<Visibility>(editMessage?.visibility || 'public');

  const canWrite = canWriteWall(wallOwnerId);
  const isEditing = !!editMessage;

  const handleSubmit = () => {
    if (!content.trim()) {
      showToast('留言内容不能为空', 'info');
      return;
    }
    if (content.trim().length > 500) {
      showToast('留言内容不能超过500字', 'info');
      return;
    }

    if (isEditing && editMessage) {
      const ok = editWallMessage(editMessage.id, content.trim());
      if (ok) {
        showToast('留言已更新');
        onSubmitted?.();
      } else {
        showToast('更新失败，可能没有权限', 'error');
      }
    } else {
      const ok = addWallMessage(wallOwnerId, content.trim(), visibility, replyTo?.id);
      if (ok) {
        showToast(replyTo ? '回复成功' : '留言成功');
        setContent('');
        setVisibility('public');
        onSubmitted?.();
      } else {
        showToast('留言失败，可能没有权限', 'error');
      }
    }
  };

  if (!canWrite && !isEditing) {
    return (
      <div className="bg-gray-50 rounded-lg px-3 py-2 text-[11px] text-gray-400 flex items-center gap-1">
        <Lock size={10} /> 你无法在此留言板留言
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      {/* 回复提示 */}
      {replyTo && !isEditing && (
        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2 bg-gray-50 rounded px-2 py-1">
          <CornerDownRight size={10} />
          回复 <span className="text-[#3B5998] font-medium">{replyTo.content.slice(0, 30)}{replyTo.content.length > 30 ? '...' : ''}</span>
          <button onClick={onCancel} className="ml-auto text-gray-300 hover:text-gray-500">
            <X size={10} />
          </button>
        </div>
      )}

      {/* 编辑提示 */}
      {isEditing && (
        <div className="flex items-center gap-1 text-[10px] text-purple-500 mb-2 bg-purple-50 rounded px-2 py-1">
          编辑留言
          <button onClick={onCancel} className="ml-auto text-gray-300 hover:text-gray-500">
            <X size={10} />
          </button>
        </div>
      )}

      <div className="flex items-start gap-2">
        <Avatar userId={currentUserId} size={28} />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={replyTo ? '写下你的回复...' : '在此留言...'}
            rows={2}
            maxLength={500}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#3B5998] transition-colors resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            {/* 可见性选择 */}
            {!isEditing && (
              <div className="flex items-center gap-1.5">
                {visOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={`flex items-center gap-0.5 px-2 py-1 rounded-full border text-[10px] transition-colors ${visibility === opt.value ? 'bg-[#3B5998] text-white border-[#3B5998]' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            )}
            {isEditing && <div />}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-300">{content.length}/500</span>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="flex items-center gap-1 text-xs bg-[#3B5998] text-white px-3 py-1.5 rounded-full hover:bg-[#2A4A7F] disabled:opacity-40 transition-colors"
              >
                <Send size={10} /> {isEditing ? '保存' : replyTo ? '回复' : '留言'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
