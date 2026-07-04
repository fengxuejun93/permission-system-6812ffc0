import { useState, useRef, useEffect } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import { generateSampleImageUri } from '@/utils/sampleImages';
import Avatar from './Avatar';
import { Image, Globe, Users, Lock, ChevronDown, X, Upload } from 'lucide-react';
import type { Visibility } from '@/types';

const MAX_CONTENT_LENGTH = 500;

const visOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: '公开', icon: <Globe size={14} /> },
  { value: 'friends', label: '好友可见', icon: <Users size={14} /> },
  { value: 'self', label: '仅自己可见', icon: <Lock size={14} /> },
];

const sampleImages = [
  { label: '风景', color: '#6BA3D6', pattern: 4 },
  { label: '美食', color: '#E8915B', pattern: 5 },
  { label: '校园', color: '#7DB87D', pattern: 1 },
  { label: '萌宠', color: '#D4A0C0', pattern: 2 },
];

export default function PostForm() {
  const { currentUserId, addPost } = useSocialStore();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageLabel, setImageLabel] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [visDropdown, setVisDropdown] = useState(false);
  const visDropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOverLimit = content.length > MAX_CONTENT_LENGTH;
  const isEmpty = content.trim().length === 0;

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
    if (isEmpty) {
      showToast('请输入动态内容', 'info');
      return;
    }
    if (isOverLimit) {
      showToast(`内容不能超过 ${MAX_CONTENT_LENGTH} 字`, 'error');
      return;
    }
    addPost(content.trim(), visibility, imageUrl, imageLabel || undefined);
    showToast('动态发布成功！');
    setContent('');
    setImageUrl(undefined);
    setImageLabel('');
    setVisibility('public');
    setShowImagePicker(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLocalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片不能超过5MB', 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageLabel(file.name.replace(/\.[^.]+$/, ''));
    setShowImagePicker(false);
  };

  const handleSampleImage = (sample: typeof sampleImages[number]) => {
    const url = generateSampleImageUri(sample.color, sample.label, sample.pattern);
    setImageUrl(url);
    setImageLabel(sample.label);
    setShowImagePicker(false);
  };

  const removeImage = () => {
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(undefined);
    setImageLabel('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentVis = visOptions.find(v => v.value === visibility);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <Avatar userId={currentUserId} size={40} />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="分享你的新鲜事..."
            className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none resize-none transition-colors ${isOverLimit ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#3B5998]'}`}
            rows={3}
          />
          {/* 字符计数 */}
          <div className={`text-[10px] mt-0.5 text-right ${isOverLimit ? 'text-red-400' : content.length > MAX_CONTENT_LENGTH * 0.8 ? 'text-amber-400' : 'text-gray-300'}`}>
            {content.length}/{MAX_CONTENT_LENGTH}
          </div>

          {/* 图片预览 */}
          {imageUrl && (
            <div className="mt-1 relative inline-block">
              <img
                src={imageUrl}
                alt={imageLabel || '照片预览'}
                className="w-48 h-36 rounded-md object-cover"
              />
              {imageLabel && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded">{imageLabel}</span>
              )}
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 图片选择面板 */}
          {showImagePicker && !imageUrl && (
            <div className="mt-1 bg-gray-50 rounded-lg border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-2">选择图片来源：</div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Upload size={14} /> 本地图片
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLocalImage}
                  className="hidden"
                />
                <span className="text-[10px] text-gray-400">支持 JPG/PNG，5MB 以内</span>
              </div>
              <div className="text-xs text-gray-500 mb-1.5">或选择示例图片：</div>
              <div className="grid grid-cols-4 gap-2">
                {sampleImages.map(sample => (
                  <button
                    key={sample.label}
                    onClick={() => handleSampleImage(sample)}
                    className="group relative"
                  >
                    <img
                      src={generateSampleImageUri(sample.color, sample.label, sample.pattern)}
                      alt={sample.label}
                      className="w-full h-14 rounded object-cover border border-gray-200 group-hover:border-[#3B5998] transition-colors"
                    />
                    <span className="absolute bottom-0.5 left-0 right-0 text-[9px] text-white text-center">{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (imageUrl) { removeImage(); } else { setShowImagePicker(!showImagePicker); } }}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${imageUrl ? 'bg-green-50 border-green-200 text-green-600' : showImagePicker ? 'bg-blue-50 border-blue-200 text-[#3B5998]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <Image size={14} /> {imageUrl ? '已添加照片' : '添加照片'}
              </button>
              <div ref={visDropRef} className="relative">
                <button
                  onClick={() => setVisDropdown(!visDropdown)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
                >
                  {currentVis?.icon} {currentVis?.label} <ChevronDown size={12} />
                </button>
                {visDropdown && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32 z-10">
                    {visOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setVisibility(opt.value); setVisDropdown(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${visibility === opt.value ? 'text-[#3B5998] font-medium bg-blue-50' : 'text-gray-600'}`}
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
              disabled={isEmpty || isOverLimit}
              className="text-sm bg-[#3B5998] text-white px-4 py-1.5 rounded-full hover:bg-[#2A4A7F] disabled:opacity-40 transition-colors font-medium"
            >
              发布
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
