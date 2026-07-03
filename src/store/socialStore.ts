import { create } from 'zustand';
import type { User, Post, Photo, Comment, Friendship, Visibility } from '@/types';
import { mockUsers, mockPosts, mockPhotos, mockComments, mockFriendships } from '@/data/mockData';

interface SocialState {
  currentUserId: string;
  users: User[];
  posts: Post[];
  photos: Photo[];
  comments: Comment[];
  friendships: Friendship[];

  // 计算属性
  currentUser: () => User;
  isFriend: (userId: string) => boolean;
  getFriendsOf: (userId: string) => User[];
  getVisiblePosts: (ownerId?: string) => Post[];
  getVisiblePhotos: (ownerId: string) => Photo[];
  getCommentsForPost: (postId: string) => Comment[];
  getStats: () => { friendCount: number; postCount: number; photoCount: number };

  // 操作
  switchUser: (userId: string) => void;
  addPost: (content: string, visibility: Visibility, withPhoto: boolean) => void;
  addComment: (postId: string, parentId: string | null, content: string) => void;
  addFriend: (friendId: string) => void;
  changePhotoVisibility: (photoId: string, visibility: Visibility) => void;
  searchUsers: (keyword: string) => User[];
}

const generateId = (prefix: string) => `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const useSocialStore = create<SocialState>((set, get) => ({
  currentUserId: 'u1',
  users: mockUsers,
  posts: mockPosts,
  photos: mockPhotos,
  comments: mockComments,
  friendships: mockFriendships,

  currentUser: () => {
    const state = get();
    return state.users.find(u => u.id === state.currentUserId) || mockUsers[0];
  },

  isFriend: (userId: string) => {
    const state = get();
    if (userId === state.currentUserId) return true;
    return state.friendships.some(
      f => f.userId === state.currentUserId && f.friendId === userId && f.status === 'accepted'
    );
  },

  getFriendsOf: (userId: string) => {
    const state = get();
    const friendIds = state.friendships
      .filter(f => f.userId === userId && f.status === 'accepted')
      .map(f => f.friendId);
    return state.users.filter(u => friendIds.includes(u.id));
  },

  getVisiblePosts: (ownerId?: string) => {
    const state = get();
    const currentId = state.currentUserId;
    let posts = state.posts;
    if (ownerId) {
      posts = posts.filter(p => p.authorId === ownerId);
    }
    return posts.filter(post => {
      if (post.authorId === currentId) return true;
      if (post.visibility === 'public') return true;
      if (post.visibility === 'friends' && state.isFriend(post.authorId)) return true;
      return false;
    });
  },

  getVisiblePhotos: (ownerId: string) => {
    const state = get();
    const currentId = state.currentUserId;
    return state.photos.filter(photo => {
      if (photo.ownerId !== ownerId) return false;
      if (ownerId === currentId) return true;
      if (photo.visibility === 'public') return true;
      if (photo.visibility === 'friends' && state.isFriend(ownerId)) return true;
      return false;
    });
  },

  getCommentsForPost: (postId: string) => {
    return get().comments.filter(c => c.postId === postId);
  },

  getStats: () => {
    const state = get();
    const friends = state.getFriendsOf(state.currentUserId);
    const myPosts = state.posts.filter(p => p.authorId === state.currentUserId);
    const myPhotos = state.photos.filter(p => p.ownerId === state.currentUserId);
    return {
      friendCount: friends.length,
      postCount: myPosts.length,
      photoCount: myPhotos.length,
    };
  },

  switchUser: (userId: string) => {
    set({ currentUserId: userId });
  },

  addPost: (content: string, visibility: Visibility, withPhoto: boolean) => {
    const state = get();
    const newPostId = generateId('p');
    const photoIds: string[] = [];
    if (withPhoto) {
      const newPhotoId = generateId('ph');
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#BB8FCE', '#F0B27A'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newPhoto: Photo = {
        id: newPhotoId,
        ownerId: state.currentUserId,
        postId: newPostId,
        color: randomColor,
        visibility,
        label: '新照片',
      };
      photoIds.push(newPhotoId);
      set({ photos: [...state.photos, newPhoto] });
    }
    const newPost: Post = {
      id: newPostId,
      authorId: state.currentUserId,
      content,
      visibility,
      photoIds,
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
    };
    set(s => ({ posts: [newPost, ...s.posts] }));
  },

  addComment: (postId: string, parentId: string | null, content: string) => {
    const state = get();
    const newComment: Comment = {
      id: generateId('c'),
      postId,
      authorId: state.currentUserId,
      parentId,
      content,
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
    };
    set({ comments: [...state.comments, newComment] });
  },

  addFriend: (friendId: string) => {
    const state = get();
    const alreadyFriends = state.friendships.some(
      f => f.userId === state.currentUserId && f.friendId === friendId && f.status === 'accepted'
    );
    if (alreadyFriends) return;
    const newFriendships: Friendship[] = [
      { userId: state.currentUserId, friendId, status: 'accepted' },
      { userId: friendId, friendId: state.currentUserId, status: 'accepted' },
    ];
    set({ friendships: [...state.friendships, ...newFriendships] });
  },

  changePhotoVisibility: (photoId: string, visibility: Visibility) => {
    set(state => ({
      photos: state.photos.map(p => p.id === photoId ? { ...p, visibility } : p),
    }));
  },

  searchUsers: (keyword: string) => {
    const state = get();
    const kw = keyword.toLowerCase().trim();
    if (!kw) return [];
    return state.users.filter(
      u => u.id !== state.currentUserId &&
        (u.name.toLowerCase().includes(kw) || u.school.toLowerCase().includes(kw) || u.className.toLowerCase().includes(kw))
    );
  },
}));
