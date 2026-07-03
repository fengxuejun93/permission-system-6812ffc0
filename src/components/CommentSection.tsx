import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import Avatar from './Avatar';
import { MessageCircle, CornerDownRight } from 'lucide-react';

interface Props {
  postId: string;
}

export default function CommentSection({ postId }: Props) {
  const { getCommentsForPost, addComment, users, currentUserId } = useSocialStore();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const comments = getCommentsForPost(postId);

  const topLevel = comments.filter(c => c.parentId === null);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    addComment(postId, replyTo, newComment.trim());
    setNewComment('');
    setReplyTo(null);
  };

  const getUser = (id: string) => users.find(u => u.id === id);

  return (
    <div className="mt-2">
      {comments.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-[#3B5998] hover:underline mb-1"
        >
          <MessageCircle size={12} />
          {comments.length} 条评论 {expanded ? '收起' : '展开'}
        </button>
      )}

      {expanded && (
        <div className="space-y-2 mb-2">
          {topLevel.map(comment => {
            const author = getUser(comment.authorId);
            const replies = getReplies(comment.id);
            return (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-2.5">
                <div className="flex items-start gap-2">
                  <Avatar userId={comment.authorId} size={24} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-[#3B5998]">{author?.name}</span>
                      <span className="text-[10px] text-gray-400">{comment.createdAt}</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-0.5">{comment.content}</p>
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="text-[10px] text-gray-400 hover:text-[#3B5998] mt-1"
                    >
                      回复
                    </button>
                  </div>
                </div>
                {replies.map(reply => {
                  const replyAuthor = getUser(reply.authorId);
                  return (
                    <div key={reply.id} className="ml-8 mt-1.5 flex items-start gap-2 bg-white rounded p-2">
                      <CornerDownRight size={10} className="text-gray-300 mt-1 shrink-0" />
                      <Avatar userId={reply.authorId} size={20} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-[#3B5998]">{replyAuthor?.name}</span>
                          <span className="text-[10px] text-gray-400">{reply.createdAt}</span>
                        </div>
                        <p className="text-xs text-gray-700 mt-0.5">{reply.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Avatar userId={currentUserId} size={22} />
        <div className="flex-1 flex items-center gap-1.5">
          {replyTo && (
            <CornerDownRight size={12} className="text-[#3B5998] shrink-0" />
          )}
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder={replyTo ? '回复评论...' : '写评论...'}
            className="flex-1 text-xs border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-[#3B5998] transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="text-xs bg-[#3B5998] text-white px-3 py-1.5 rounded-full hover:bg-[#2A4A7F] disabled:opacity-40 transition-colors"
          >
            发送
          </button>
          {replyTo && (
            <button onClick={() => setReplyTo(null)} className="text-xs text-gray-400 hover:text-gray-600">取消</button>
          )}
        </div>
      </div>
    </div>
  );
}
