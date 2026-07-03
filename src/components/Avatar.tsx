import { useSocialStore } from '@/store/socialStore';

export default function Avatar({ userId, size = 40 }: { userId: string; size?: number }) {
  const user = useSocialStore(s => s.users.find(u => u.id === userId));
  if (!user) return null;
  const initial = user.name[0];
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, backgroundColor: user.avatarColor, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}
