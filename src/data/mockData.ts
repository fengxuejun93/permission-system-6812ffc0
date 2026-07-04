import type { User, Post, Photo, Comment, Friendship } from '@/types';
import { generateSampleImageUri } from '@/utils/sampleImages';

export const mockUsers: User[] = [
  { id: 'u1', name: '李明', avatarColor: '#4A90D9', school: '北京大学', className: '计算机08本', signature: '永远相信美好的事情即将发生', grade: '2008级', online: true },
  { id: 'u2', name: '王芳', avatarColor: '#E74C3C', school: '北京大学', className: '计算机08本', signature: '今天也要元气满满！', grade: '2008级', online: true },
  { id: 'u3', name: '张伟', avatarColor: '#2ECC71', school: '清华大学', className: '经管08本', signature: 'Life is beautiful.', grade: '2008级', online: false },
  { id: 'u4', name: '刘洋', avatarColor: '#F39C12', school: '北京大学', className: '数学08本', signature: '数学是我的浪漫', grade: '2008级', online: true },
  { id: 'u5', name: '陈静', avatarColor: '#9B59B6', school: '复旦大学', className: '新闻08本', signature: '记录生活的每一刻', grade: '2008级', online: false },
  { id: 'u6', name: '赵磊', avatarColor: '#1ABC9C', school: '清华大学', className: '电子08本', signature: '电子世界，无限可能', grade: '2008级', online: true },
  { id: 'u7', name: '孙悦', avatarColor: '#E67E22', school: '浙江大学', className: '心理08本', signature: '了解自己，理解他人', grade: '2008级', online: false },
  { id: 'u8', name: '周婷', avatarColor: '#3498DB', school: '浙江大学', className: '英语08本', signature: 'Reading makes life better.', grade: '2008级', online: true },
];

// 好友关系：u1-u2, u1-u4, u1-u5, u2-u3, u3-u6, u5-u7
// 待处理申请：u6 → u1（u6向u1发了申请，u1待确认）
// 被拒绝：u8 → u1（u8向u1申请被拒）
export const mockFriendships: Friendship[] = [
  { userId: 'u1', friendId: 'u2', status: 'accepted' },
  { userId: 'u2', friendId: 'u1', status: 'accepted' },
  { userId: 'u1', friendId: 'u4', status: 'accepted' },
  { userId: 'u4', friendId: 'u1', status: 'accepted' },
  { userId: 'u1', friendId: 'u5', status: 'accepted' },
  { userId: 'u5', friendId: 'u1', status: 'accepted' },
  { userId: 'u2', friendId: 'u3', status: 'accepted' },
  { userId: 'u3', friendId: 'u2', status: 'accepted' },
  { userId: 'u3', friendId: 'u6', status: 'accepted' },
  { userId: 'u6', friendId: 'u3', status: 'accepted' },
  { userId: 'u5', friendId: 'u7', status: 'accepted' },
  { userId: 'u7', friendId: 'u5', status: 'accepted' },
  // u6 向 u1 发送了好友申请（u1待确认）
  { userId: 'u6', friendId: 'u1', status: 'pending' },
  // u8 向 u1 发送了好友申请被拒绝
  { userId: 'u8', friendId: 'u1', status: 'rejected' },
];

export const mockPhotos: Photo[] = [
  { id: 'ph1', ownerId: 'u1', postId: 'p1', color: '#FF6B6B', visibility: 'public', label: '校园晚霞', imageUrl: generateSampleImageUri('#FF6B6B', '校园晚霞', 4) },
  { id: 'ph2', ownerId: 'u1', postId: 'p2', color: '#4ECDC4', visibility: 'friends', label: '宿舍生活', imageUrl: generateSampleImageUri('#4ECDC4', '宿舍生活', 1) },
  { id: 'ph3', ownerId: 'u1', postId: 'p6', color: '#45B7D1', visibility: 'self', label: '私密日记', imageUrl: generateSampleImageUri('#45B7D1', '私密日记', 2) },
  { id: 'ph4', ownerId: 'u2', postId: 'p3', color: '#96CEB4', visibility: 'public', label: '班级聚餐', imageUrl: generateSampleImageUri('#96CEB4', '班级聚餐', 5) },
  { id: 'ph5', ownerId: 'u2', postId: null, color: '#FFEAA7', visibility: 'friends', label: '闺蜜合照', imageUrl: generateSampleImageUri('#FFEAA7', '闺蜜合照', 1) },
  { id: 'ph6', ownerId: 'u3', postId: 'p4', color: '#DDA0DD', visibility: 'public', label: '清华园春色', imageUrl: generateSampleImageUri('#DDA0DD', '清华园春色', 4) },
  { id: 'ph7', ownerId: 'u3', postId: 'p9', color: '#98D8C8', visibility: 'self', label: '私藏回忆', imageUrl: generateSampleImageUri('#98D8C8', '私藏回忆', 3) },
  { id: 'ph8', ownerId: 'u4', postId: 'p7', color: '#F7DC6F', visibility: 'public', label: '数学之美', imageUrl: generateSampleImageUri('#F7DC6F', '数学之美', 2) },
  { id: 'ph9', ownerId: 'u5', postId: 'p5', color: '#BB8FCE', visibility: 'friends', label: '新闻实习', imageUrl: generateSampleImageUri('#BB8FCE', '新闻实习', 5) },
  { id: 'ph10', ownerId: 'u6', postId: 'p8', color: '#85C1E9', visibility: 'public', label: '电路实验', imageUrl: generateSampleImageUri('#85C1E9', '电路实验', 3) },
  { id: 'ph11', ownerId: 'u7', postId: null, color: '#F0B27A', visibility: 'friends', label: '心理学课堂', imageUrl: generateSampleImageUri('#F0B27A', '心理学课堂', 1) },
  { id: 'ph12', ownerId: 'u8', postId: null, color: '#AED6F1', visibility: 'public', label: '英语角', imageUrl: generateSampleImageUri('#AED6F1', '英语角', 4) },
];

export const mockPosts: Post[] = [
  {
    id: 'p1',
    authorId: 'u1',
    content: '今天在未名湖边看到了绝美的晚霞，和大家分享！',
    visibility: 'public',
    photoIds: ['ph1'],
    createdAt: '2024-03-15 18:30',
  },
  {
    id: 'p2',
    authorId: 'u1',
    content: '宿舍夜聊，大学生活真是太美好了～仅好友可见哦',
    visibility: 'friends',
    photoIds: ['ph2'],
    createdAt: '2024-03-14 23:15',
  },
  {
    id: 'p3',
    authorId: 'u2',
    content: '班级聚餐好开心！大家都来了，下次还要约～',
    visibility: 'public',
    photoIds: ['ph4'],
    createdAt: '2024-03-15 20:00',
  },
  {
    id: 'p4',
    authorId: 'u3',
    content: '清华园的春天，花开满园。欢迎来玩！',
    visibility: 'public',
    photoIds: ['ph6'],
    createdAt: '2024-03-14 10:00',
  },
  {
    id: 'p5',
    authorId: 'u5',
    content: '第一份实习报道出炉了！感谢导师的指导～仅好友可见',
    visibility: 'friends',
    photoIds: ['ph9'],
    createdAt: '2024-03-13 16:00',
  },
  {
    id: 'p6',
    authorId: 'u1',
    content: '这是一条仅自己可见的日记，记录一下心情。',
    visibility: 'self',
    photoIds: ['ph3'],
    createdAt: '2024-03-12 01:00',
  },
  {
    id: 'p7',
    authorId: 'u4',
    content: '数学分析期中考试终于结束了！庆祝一下',
    visibility: 'public',
    photoIds: ['ph8'],
    createdAt: '2024-03-13 14:00',
  },
  {
    id: 'p8',
    authorId: 'u6',
    content: '电子实验课的作品，焊接了好久终于成功了！',
    visibility: 'public',
    photoIds: ['ph10'],
    createdAt: '2024-03-12 17:00',
  },
  {
    id: 'p9',
    authorId: 'u3',
    content: '一些不想让别人看到的碎碎念...',
    visibility: 'self',
    photoIds: ['ph7'],
    createdAt: '2024-03-11 02:00',
  },
];

export const mockComments: Comment[] = [
  { id: 'c1', postId: 'p1', authorId: 'u2', parentId: null, content: '好漂亮！我也想去未名湖看晚霞', createdAt: '2024-03-15 18:45' },
  { id: 'c2', postId: 'p1', authorId: 'u1', parentId: 'c1', content: '明天一起来呀～', createdAt: '2024-03-15 18:50' },
  { id: 'c3', postId: 'p1', authorId: 'u4', parentId: null, content: '北大的风景就是好！', createdAt: '2024-03-15 19:00' },
  { id: 'c4', postId: 'p3', authorId: 'u1', parentId: null, content: '好羡慕！我也想参加聚餐', createdAt: '2024-03-15 20:10' },
  { id: 'c5', postId: 'p3', authorId: 'u3', parentId: null, content: '看起来好好吃！', createdAt: '2024-03-15 20:30' },
  { id: 'c6', postId: 'p4', authorId: 'u2', parentId: null, content: '清华的春天也很美！', createdAt: '2024-03-14 11:00' },
  { id: 'c7', postId: 'p4', authorId: 'u6', parentId: 'c6', content: '欢迎来清华做客～', createdAt: '2024-03-14 11:15' },
  { id: 'c8', postId: 'p7', authorId: 'u1', parentId: null, content: '恭喜考完！晚上出来庆祝？', createdAt: '2024-03-13 14:30' },
  { id: 'c9', postId: 'p5', authorId: 'u1', parentId: null, content: '太厉害了！恭喜师姐', createdAt: '2024-03-13 16:20' },
  { id: 'c10', postId: 'p8', authorId: 'u3', parentId: null, content: '理工男的浪漫哈哈', createdAt: '2024-03-12 17:30' },
];
