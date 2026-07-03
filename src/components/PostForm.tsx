import { useState, useRef, useEffect } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import Avatar from './Avatar';
import { Image, Globe, Users, Lock, ChevronDown, X } from 'lucide-react';
import type { Visibility } from '@/types';

const visOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: '公开', icon: <Globe size={14} /> },
  { value: 'friends', label: '好友可见', icon: <Users size={14} /> },
  { value: 'self', label: '仅自己可见', icon: <Lock size={14} /> },
];

const photoColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#BB8FCE', '#F0B27A'];

export default function PostForm() {
  const { currentUserId, addPost } = useSocialStore();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [withPhoto, setWithPhoto] = useState(false);
  const [photoColor] = useState(() => photoColors[Math.floor(Math.random() * photoColors.length)]);
  const [visDropdown, setVisDropdown] = useState(false);
  const visDropRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭可见性下拉
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
    if (!content.trim()) return;
    addPost(content.trim(), visibility, withPhoto);
    showToast('动态发布成功！');
    setContent('');
    setWithPhoto(false);
    setVisibility('public');
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
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#3B5998] resize-none transition-colors"
            rows={3}
          />

          {/* 照片占位预览 */}
          {withPhoto && (
            <div className="mt-2 relative inline-block">
              <div
                className="w-32 h-24 rounded-md flex items-center justify-center"
                style={{ backgroundColor: photoColor }}
              >
                <span className="text-white/80 text-xs font-medium">照片占位</span>
              </div>
              <button
                onClick={() => setWithPhoto(false)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWithPhoto(!withPhoto)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${withPhoto ? 'bg-green-50 border-green-200 text-green-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <Image size={14} /> 照片
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
              disabled={!content.trim()}
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
