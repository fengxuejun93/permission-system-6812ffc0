import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { Globe, Users, Lock, ChevronDown, Eye } from 'lucide-react';
import type { Visibility, Photo } from '@/types';

const visOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: '公开', icon: <Globe size={12} /> },
  { value: 'friends', label: '好友可见', icon: <Users size={12} /> },
  { value: 'self', label: '仅自己可见', icon: <Lock size={12} /> },
];

interface Props {
  photo: Photo;
  isOwner: boolean;
}

export default function PhotoCard({ photo, isOwner }: Props) {
  const { changePhotoVisibility, photos } = useSocialStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // 重新获取最新的photo状态以反映可见性变化
  const currentPhoto = photos.find(p => p.id === photo.id) || photo;
  const currentVis = visOptions.find(v => v.value === currentPhoto.visibility);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
      <div
        className="w-full h-36 flex items-center justify-center relative"
        style={{ backgroundColor: currentPhoto.color }}
      >
        <span className="text-white/80 text-sm font-medium">{currentPhoto.label}</span>
        {isOwner && (
          <div className="absolute top-2 right-2">
            <Eye size={14} className="text-white/60" />
          </div>
        )}
      </div>
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-600 truncate">{currentPhoto.label}</span>
        {isOwner ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-[#3B5998] transition-colors"
            >
              {currentVis?.icon} {currentVis?.label}
              <ChevronDown size={10} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 w-28 z-10">
                {visOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      changePhotoVisibility(currentPhoto.id, opt.value);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-1.5 px-2 py-1 text-[11px] hover:bg-gray-50 transition-colors ${currentPhoto.visibility === opt.value ? 'text-[#3B5998] font-medium' : 'text-gray-500'}`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
            {currentVis?.icon} {currentVis?.label}
          </span>
        )}
      </div>
    </div>
  );
}
