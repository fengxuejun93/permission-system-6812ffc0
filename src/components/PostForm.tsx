import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import Avatar from './Avatar';
import { Image, Globe, Users, Lock, ChevronDown } from 'lucide-react';
import type { Visibility } from '@/types';

export default function PostForm() {
  const { currentUserId, addPost } = useSocialStore();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [withPhoto, setWithPhoto] = useState(false);
  const [visDropdown, setVisDropdown] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    addPost(content.trim(), visibility, withPhoto);
    setContent('');
    setWithPhoto(false);
    setVisibility('public');
  };

  const visOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
    { value: 'public', label: '公开', icon: <Globe size={14} /> },
    { value: 'friends', label: '好友可见', icon: <Users size={14} /> },
    { value: 'self', label: '仅自己可见', icon: <Lock size={14} /> },
  ];
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
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWithPhoto(!withPhoto)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${withPhoto ? 'bg-green-50 border-green-200 text-green-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <Image size={14} /> 照片
              </button>
              <div className="relative">
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
