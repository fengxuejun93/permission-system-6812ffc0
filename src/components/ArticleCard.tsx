import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import Avatar from './Avatar';
import ConfirmDialog from './ConfirmDialog';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import type { Article, ArticleCategory, Visibility } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Globe, Users, Lock, Trash2, Tag, MoreHorizontal, Pencil, X, Check } from 'lucide-react';
import { useRef, useEffect } from 'react';

const visLabel = (v: Visibility) => {
  switch (v) {
    case 'public': return '公开';
    case 'friends': return '好友可见';
    case 'self': return '仅自己';
  }
};

const visIcon = (v: Visibility) => {
  switch (v) {
    case 'public': return <Globe size={10} />;
    case 'friends': return <Users size={10} />;
    case 'self': return <Lock size={10} />;
  }
};

const MAX_TITLE = 50;
const MAX_CONTENT = 2000;

const categoryOptions = Object.entries(CATEGORY_LABELS) as [ArticleCategory, string][];

interface Props {
  article: Article;
}

export default function ArticleCard({ article }: Props) {
  const { users, currentUserId, deleteArticle, updateArticle } = useSocialStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const author = users.find(u => u.id === article.authorId);
  const isAuthor = article.authorId === currentUserId;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 编辑表单状态
  const [editTitle, setEditTitle] = useState(article.title);
  const [editContent, setEditContent] = useState(article.content);
  const [editCategory, setEditCategory] = useState<ArticleCategory>(article.category);
  const [editTags, setEditTags] = useState(article.tags.join(' '));
  const [editVisibility, setEditVisibility] = useState<Visibility>(article.visibility);

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
    deleteArticle(article.id);
    showToast('文章已删除');
    setShowDeleteDialog(false);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) { showToast('标题不能为空', 'error'); return; }
    if (editTitle.length > MAX_TITLE) { showToast(`标题不能超过${MAX_TITLE}字`, 'error'); return; }
    if (!editContent.trim()) { showToast('内容不能为空', 'error'); return; }
    if (editContent.length > MAX_CONTENT) { showToast(`内容不能超过${MAX_CONTENT}字`, 'error'); return; }

    const tags = editTags.split(/[,，\s]+/).filter(Boolean);
    const ok = updateArticle(article.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      category: editCategory,
      tags,
      visibility: editVisibility,
    });

    if (ok) {
      showToast('文章已更新');
      setEditing(false);
      setShowMenu(false);
    } else {
      showToast('更新失败，请检查输入', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditCategory(article.category);
    setEditTags(article.tags.join(' '));
    setEditVisibility(article.visibility);
    setEditing(false);
  };

  const categoryColor = CATEGORY_COLORS[article.category];
  const categoryLabel = CATEGORY_LABELS[article.category];

  // 编辑模式
  if (editing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border-2 border-[#3B5998] p-4">
        <div className="flex items-start gap-3">
          <Avatar userId={article.authorId} size={36} />
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-2">编辑文章</div>

            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className={`w-full text-sm font-medium border rounded-lg px-3 py-2 focus:outline-none mb-1 ${editTitle.length > MAX_TITLE ? 'border-red-300' : 'border-gray-200 focus:border-[#3B5998]'}`}
            />
            <div className={`text-[10px] text-right mb-1 ${editTitle.length > MAX_TITLE ? 'text-red-400' : 'text-gray-300'}`}>
              {editTitle.length}/{MAX_TITLE}
            </div>

            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className={`w-full text-xs border rounded-lg px-3 py-2 focus:outline-none resize-none ${editContent.length > MAX_CONTENT ? 'border-red-300' : 'border-gray-200 focus:border-[#3B5998]'}`}
              rows={6}
            />
            <div className={`text-[10px] text-right mb-1 ${editContent.length > MAX_CONTENT ? 'text-red-400' : editContent.length > MAX_CONTENT * 0.8 ? 'text-amber-400' : 'text-gray-300'}`}>
              {editContent.length}/{MAX_CONTENT}
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <select
                value={editCategory}
                onChange={e => setEditCategory(e.target.value as ArticleCategory)}
                className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#3B5998] bg-white"
              >
                {categoryOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select
                value={editVisibility}
                onChange={e => setEditVisibility(e.target.value as Visibility)}
                className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#3B5998] bg-white"
              >
                <option value="public">公开</option>
                <option value="friends">好友可见</option>
                <option value="self">仅自己可见</option>
              </select>
              <input
                type="text"
                value={editTags}
                onChange={e => setEditTags(e.target.value)}
                placeholder="标签（空格分隔）"
                className="flex-1 min-w-[120px] text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#3B5998]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <X size={12} /> 取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || !editContent.trim() || editTitle.length > MAX_TITLE || editContent.length > MAX_CONTENT}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-[#3B5998] text-white hover:bg-[#2A4A7F] disabled:opacity-40"
              >
                <Check size={12} /> 保存
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 展示模式
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(`/profile/${article.authorId}`)} className="shrink-0">
          <Avatar userId={article.authorId} size={36} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate(`/profile/${article.authorId}`)}
              className="text-sm font-semibold text-[#3B5998] hover:underline"
            >
              {author?.name}
            </button>
            <span className="text-[10px] text-gray-400">{article.createdAt}</span>
            {isAuthor && (
              <div ref={menuRef} className="ml-auto relative">
                <button onClick={() => setShowMenu(!showMenu)} className="text-gray-300 hover:text-gray-500 p-0.5">
                  <MoreHorizontal size={14} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-24 z-10">
                    <button
                      onClick={() => { setShowMenu(false); setEditing(true); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                    >
                      <Pencil size={10} /> 编辑
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); setShowDeleteDialog(true); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={10} /> 删除
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: categoryColor }}>
              {categoryLabel}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
              {visIcon(article.visibility)} {visLabel(article.visibility)}
            </span>
          </div>

          <h3 className="text-sm font-bold text-gray-800 mb-1">{article.title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{article.content}</p>

          {article.imageUrl && (
            <img src={article.imageUrl} alt={article.title} className="w-full h-32 object-cover rounded-md mt-2" />
          )}

          {article.tags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <Tag size={10} className="text-gray-300 shrink-0" />
              {article.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="删除文章"
        message={`确定要删除「${article.title}」吗？此操作不可恢复。`}
        confirmLabel="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
