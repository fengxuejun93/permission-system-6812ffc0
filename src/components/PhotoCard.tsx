import { useState, useRef, useEffect } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { useToast } from '@/components/Toast';
import { Globe, Users, Lock, ChevronDown, Eye, EyeOff } from 'lucide-react';
import type { Visibility, Photo } from '@/types';

const visOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: '公开', icon: <Globe size={12} /> },
  { value: 'friends', label: '好友可见', icon: <Users size={12} /> },
  { value: 'self', label: '仅自己可见', icon: <Lock size={12} /> },
];

const visLabelMap: Record<Visibility, string> = {
  public: '公开',
  friends: '好友可见',
  self: '仅自己可见',
};

interface Props {
  photo: Photo;
  isOwner: boolean;
}

export default function PhotoCard({ photo, isOwner }: Props) {
  const { changePhotoVisibility, photos } = useSocialStore();
  const { showToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const currentPhoto = photos.find(p => p.id === photo.id) || photo;
  const currentVis = visOptions.find(v => v.value === currentPhoto.visibility);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleVisChange = (newVis: Visibility) => {
    changePhotoVisibility(currentPhoto.id, newVis);
    setDropdownOpen(false);
    showToast(`照片「${currentPhoto.label}」可见性已改为「${visLabelMap[newVis]}」`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
      <div className="w-full h-36 relative">
        {currentPhoto.imageUrl ? (
          <img src={currentPhoto.imageUrl} alt={currentPhoto.label} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: currentPhoto.color }}
          >
            <span className="text-white/80 text-sm font-medium">{currentPhoto.label}</span>
          </div>
        )}
        {isOwner && (
          <div className="absolute top-2 right-2 bg-black/30 rounded-full p-1">
            {currentPhoto.visibility === 'self' ? (
              <EyeOff size={12} className="text-white/80" />
            ) : (
              <Eye size={12} className="text-white/80" />
            )}
          </div>
        )}
      </div>
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-600 truncate">{currentPhoto.label}</span>
        {isOwner ? (
          <div ref={dropRef} className="relative">
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
                    onClick={() => handleVisChange(opt.value)}
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
