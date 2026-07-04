import { useState, useRef, useEffect } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import { generateSampleImageUri } from '@/utils/sampleImages';
import Avatar from './Avatar';
import { Globe, Users, Lock, ChevronDown, X, Upload, Image } from 'lucide-react';
import type { Visibility, ArticleCategory } from '@/types';
import { CATEGORY_LABELS } from '@/types';

const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 2000;

const visOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: '公开', icon: <Globe size={14} /> },
  { value: 'friends', label: '好友可见', icon: <Users size={14} /> },
  { value: 'self', label: '仅自己可见', icon: <Lock size={14} /> },
];

const categoryOptions = Object.entries(CATEGORY_LABELS) as [ArticleCategory, string][];

const sampleImages = [
  { label: '配图1', color: '#7C3AED', pattern: 4 },
  { label: '配图2', color: '#EC4899', pattern: 1 },
  { label: '配图3', color: '#F59E0B', pattern: 5 },
];

export default function ArticleForm({ onSuccess }: { onSuccess?: () => void }) {
  const { currentUserId, addArticle } = useSocialStore();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('mental_health');
  const [tagsInput, setTagsInput] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [visDropdown, setVisDropdown] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const visDropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const titleOverLimit = title.length > MAX_TITLE_LENGTH;
  const contentOverLimit = content.length > MAX_CONTENT_LENGTH;
  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !titleOverLimit && !contentOverLimit;

  useEffect(() => {
    if (!visDropdown) return;
    const handler = (e: MouseEvent) => {
      if (visDropRef.current && !visDropRef.current.contains(e.target as Node)) {
        setVisDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [visDropdown]);

  const handleSubmit = () => {
    if (!title.trim()) { showToast('请输入标题', 'info'); return; }
    if (titleOverLimit) { showToast(`标题不能超过${MAX_TITLE_LENGTH}字`, 'error'); return; }
    if (!content.trim()) { showToast('请输入内容', 'info'); return; }
    if (contentOverLimit) { showToast(`内容不能超过${MAX_CONTENT_LENGTH}字`, 'error'); return; }
    const tags = tagsInput.split(/[,，\s]+/).filter(Boolean);
    addArticle(title.trim(), content.trim(), category, tags, visibility, imageUrl);
    showToast('文章发布成功！');
    setTitle(''); setContent(''); setTagsInput(''); setVisibility('public');
    setImageUrl(undefined); setShowImagePicker(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onSuccess?.();
  };

  const handleLocalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('请选择图片文件', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('图片不能超过5MB', 'error'); return; }
    setImageUrl(URL.createObjectURL(file));
    setShowImagePicker(false);
  };

  const removeImage = () => {
    if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
    setImageUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentVis = visOptions.find(v => v.value === visibility);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <Avatar userId={currentUserId} size={36} />
        <div className="flex-1">
          {/* 标题 */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="文章标题..."
            className={`w-full text-sm font-medium border rounded-lg px-3 py-2 focus:outline-none transition-colors ${titleOverLimit ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#3B5998]'}`}
          />
          <div className={`text-[10px] mt-0.5 text-right ${titleOverLimit ? 'text-red-400' : 'text-gray-300'}`}>
            {title.length}/{MAX_TITLE_LENGTH}
          </div>

          {/* 内容 */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="分享你的知识..."
            className={`w-full text-xs border rounded-lg px-3 py-2 focus:outline-none resize-none transition-colors mt-1 ${contentOverLimit ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#3B5998]'}`}
            rows={5}
          />
          <div className={`text-[10px] mt-0.5 text-right ${contentOverLimit ? 'text-red-400' : content.length > MAX_CONTENT_LENGTH * 0.8 ? 'text-amber-400' : 'text-gray-300'}`}>
            {content.length}/{MAX_CONTENT_LENGTH}
          </div>

          {/* 标签输入 */}
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="标签（空格或逗号分隔）"
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#3B5998] transition-colors mt-1"
          />

          {/* 图片预览 */}
          {imageUrl && (
            <div className="mt-2 relative inline-block">
              <img src={imageUrl} alt="配图" className="w-40 h-28 rounded-md object-cover" />
              <button onClick={removeImage} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-800">
                <X size={10} />
              </button>
            </div>
          )}

          {/* 图片选择面板 */}
          {showImagePicker && !imageUrl && (
            <div className="mt-2 bg-gray-50 rounded-lg border border-gray-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded px-2 py-1.5 hover:bg-gray-50">
                  <Upload size={12} /> 本地图片
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLocalImage} className="hidden" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sampleImages.map(s => (
                  <button key={s.label} onClick={() => { setImageUrl(generateSampleImageUri(s.color, s.label, s.pattern)); setShowImagePicker(false); }}>
                    <img src={generateSampleImageUri(s.color, s.label, s.pattern)} alt={s.label} className="w-full h-10 rounded object-cover border border-gray-200 hover:border-[#3B5998]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {/* 分类选择 */}
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ArticleCategory)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#3B5998] bg-white"
              >
                {categoryOptions.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              {/* 添加图片 */}
              <button
                onClick={() => { if (imageUrl) removeImage(); else setShowImagePicker(!showImagePicker); }}
                className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-full border transition-colors ${imageUrl ? 'bg-green-50 border-green-200 text-green-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <Image size={12} /> {imageUrl ? '已添加' : '配图'}
              </button>

              {/* 可见性 */}
              <div ref={visDropRef} className="relative">
                <button
                  onClick={() => setVisDropdown(!visDropdown)}
                  className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-gray-300"
                >
                  {currentVis?.icon} {currentVis?.label} <ChevronDown size={10} />
                </button>
                {visDropdown && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-28 z-10">
                    {visOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setVisibility(opt.value); setVisDropdown(false); }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-gray-50 ${visibility === opt.value ? 'text-[#3B5998] font-medium bg-blue-50' : 'text-gray-600'}`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="text-xs bg-[#3B5998] text-white px-4 py-1.5 rounded-full hover:bg-[#2A4A7F] disabled:opacity-40 transition-colors font-medium"
            >
              发布文章
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
