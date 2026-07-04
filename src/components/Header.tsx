import { useSocialStore } from '@/store/socialStore';
import { Users, FileText, Image, Search, Home, ChevronDown, Bell, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const { currentUserId, users, switchUser, getStats } = useSocialStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef = useRef<HTMLDivElement>(null);
  const stats = getStats();
  const currentUser = users.find(u => u.id === currentUserId);

  const profileMatch = location.pathname.match(/^\/profile\/(.+)$/);
  const viewingOwnProfile = profileMatch ? profileMatch[1] === currentUserId : false;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="bg-[#3B5998] text-white h-14 flex items-center px-4 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-3 mr-6">
        <button onClick={() => navigate('/')} className="text-xl font-bold tracking-wide hover:opacity-90 transition-opacity">校内网</button>
        <span className="text-[#8B9DC3] text-xs">Xiaonei</span>
      </div>

      <nav className="flex items-center gap-1 mr-auto">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${location.pathname === '/' ? 'bg-[#2A4A7F]' : 'hover:bg-[#2A4A7F]/60'}`}
        >
          <Home size={16} /> 首页
        </button>
        <button
          onClick={() => navigate('/search')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${location.pathname === '/search' ? 'bg-[#2A4A7F]' : 'hover:bg-[#2A4A7F]/60'}`}
        >
          <Search size={16} /> 搜索同学
        </button>
        <button
          onClick={() => navigate('/knowledge')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${location.pathname === '/knowledge' ? 'bg-[#2A4A7F]' : 'hover:bg-[#2A4A7F]/60'}`}
        >
          <BookOpen size={16} /> 知识分享
        </button>
        <button
          onClick={() => navigate(`/profile/${currentUserId}`)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${viewingOwnProfile ? 'bg-[#2A4A7F]' : 'hover:bg-[#2A4A7F]/60'}`}
        >
          个人主页
        </button>
      </nav>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-3 mr-1">
          <span className="flex items-center gap-1 text-[#B8C9E8]" title="好友数"><Users size={14} /> <b className="text-white">{stats.friendCount}</b></span>
          <span className="flex items-center gap-1 text-[#B8C9E8]" title="动态数"><FileText size={14} /> <b className="text-white">{stats.postCount}</b></span>
          <span className="flex items-center gap-1 text-[#B8C9E8]" title="照片数"><Image size={14} /> <b className="text-white">{stats.photoCount}</b></span>
          <span className="flex items-center gap-1 text-[#B8C9E8]" title="评论数"><FileText size={14} /> <b className="text-white">{stats.commentCount}</b></span>
          <span className="flex items-center gap-1 text-[#B8C9E8]" title="文章数"><BookOpen size={14} /> <b className="text-white">{stats.articleCount}</b></span>
          {stats.pendingReceivedCount > 0 && (
            <button
              onClick={() => navigate('/notifications')}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors"
              title={`${stats.pendingReceivedCount} 条待处理好友申请`}
            >
              <Bell size={14} /> <b>{stats.pendingReceivedCount}</b>
            </button>
          )}
          {stats.pendingReceivedCount === 0 && (
            <button
              onClick={() => navigate('/notifications')}
              className="flex items-center gap-1 text-[#8B9DC3] hover:text-white transition-colors"
              title="通知中心"
            >
              <Bell size={14} />
            </button>
          )}
        </div>

        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#2A4A7F] transition-colors"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: currentUser?.avatarColor }}>
              {currentUser?.name[0]}
            </div>
            <span className="text-sm">{currentUser?.name}</span>
            <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-48 z-50">
              <div className="px-3 py-1.5 text-xs text-gray-400 border-b">切换模拟账号</div>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => { switchUser(u.id); setDropdownOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${u.id === currentUserId ? 'bg-blue-50 text-[#3B5998] font-medium' : 'text-gray-700'}`}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: u.avatarColor }}>{u.name[0]}</div>
                  <span>{u.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{u.school}</span>
                  {u.id === currentUserId && <span className="text-[10px] bg-[#3B5998] text-white px-1.5 py-0.5 rounded ml-1">当前</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
