import { create } from 'zustand';
import type { User, Post, Photo, Comment, Friendship, Visibility, RelationType, Article, ArticleCategory, ActivityLog, ActivityAction } from '@/types';
import { mockUsers, mockPosts, mockPhotos, mockComments, mockFriendships } from '@/data/mockData';
import { mockArticles } from '@/data/mockArticles';

interface Stats {
  friendCount: number;
  postCount: number;
  photoCount: number;
  pendingReceivedCount: number;
  pendingSentCount: number;
  commentCount: number;
  articleCount: number;
}

interface SocialState {
  currentUserId: string;
  users: User[];
  posts: Post[];
  photos: Photo[];
  comments: Comment[];
  friendships: Friendship[];
  articles: Article[];
  activityLogs: ActivityLog[];

  // 计算属性
  currentUser: () => User;
  getRelation: (userId: string) => RelationType;
  isFriend: (userId: string) => boolean;
  getFriendsOf: (userId: string) => User[];
  getPendingReceived: () => Friendship[];
  getPendingSent: () => Friendship[];
  getVisiblePosts: (ownerId?: string) => Post[];
  getVisiblePhotos: (ownerId: string) => Photo[];
  getVisiblePhotosForPost: (photoIds: string[]) => Photo[];
  getCommentsForPost: (postId: string) => Comment[];
  canComment: (postId: string) => boolean;
  getStats: () => Stats;
  getVisibleArticles: (category?: ArticleCategory) => Article[];

  // 操作
  addArticle: (title: string, content: string, category: ArticleCategory, tags: string[], visibility: Visibility, imageUrl?: string) => void;
  deleteArticle: (articleId: string) => void;
  updateArticle: (articleId: string, updates: Partial<Pick<Article, 'title' | 'content' | 'category' | 'tags' | 'visibility' | 'imageUrl'>>) => boolean;
  getHiddenArticleCount: (category?: ArticleCategory) => number;

  // 社交操作
  switchUser: (userId: string) => void;
  addPost: (content: string, visibility: Visibility, imageUrl?: string, photoLabel?: string) => void;
  addComment: (postId: string, parentId: string | null, content: string) => boolean;
  sendFriendRequest: (friendId: string) => void;
  acceptFriendRequest: (userId: string) => void;
  rejectFriendRequest: (userId: string) => void;
  cancelFriendRequest: (friendId: string) => void;
  changePhotoVisibility: (photoId: string, visibility: Visibility) => void;
  deletePost: (postId: string) => void;
  updatePostVisibility: (postId: string, visibility: Visibility) => void;
  deletePhoto: (photoId: string) => void;
  unfriend: (userId: string) => void;
  searchUsers: (keyword: string) => User[];
  getMutualFriends: (userId: string) => User[];
  getActivityLogs: () => ActivityLog[];
  clearActivityLogs: () => void;
}

const generateId = (prefix: string) => `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const nowStr = () => new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-');

// 记录操作日志的辅助函数
function logActivity(
  set: (partial: Partial<SocialState> | ((state: SocialState) => Partial<SocialState>)) => void,
  get: () => SocialState,
  action: ActivityAction,
  targetId: string,
  targetName: string,
  detail: string
) {
  const state = get();
  const log: ActivityLog = {
    id: generateId('log'),
    action,
    operatorId: state.currentUserId,
    targetId,
    targetName,
    detail,
    createdAt: nowStr(),
  };
  set({ activityLogs: [log, ...state.activityLogs] });
}

export const useSocialStore = create<SocialState>((set, get) => ({
  currentUserId: 'u1',
  users: mockUsers,
  posts: mockPosts,
  photos: mockPhotos,
  comments: mockComments,
  friendships: mockFriendships,
  articles: mockArticles,
  activityLogs: [],

  currentUser: () => {
    const state = get();
    return state.users.find(u => u.id === state.currentUserId) || mockUsers[0];
  },

  getRelation: (userId: string): RelationType => {
    const state = get();
    if (userId === state.currentUserId) return 'self';
    const fs = state.friendships;
    if (fs.some(f => f.userId === state.currentUserId && f.friendId === userId && f.status === 'accepted')) return 'friend';
    if (fs.some(f => f.userId === state.currentUserId && f.friendId === userId && f.status === 'pending')) return 'pending_sent';
    if (fs.some(f => f.userId === userId && f.friendId === state.currentUserId && f.status === 'pending')) return 'pending_received';
    // 我发出的申请被拒
    if (fs.some(f => f.userId === state.currentUserId && f.friendId === userId && f.status === 'rejected')) return 'rejected';
    // 我拒绝了对方的申请
    if (fs.some(f => f.userId === userId && f.friendId === state.currentUserId && f.status === 'rejected')) return 'rejected_them';
    return 'none';
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

  getPendingReceived: () => {
    const state = get();
    return state.friendships.filter(
      f => f.friendId === state.currentUserId && f.status === 'pending'
    );
  },

  getPendingSent: () => {
    const state = get();
    return state.friendships.filter(
      f => f.userId === state.currentUserId && f.status === 'pending'
    );
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

  getVisiblePhotosForPost: (photoIds: string[]) => {
    const state = get();
    const currentId = state.currentUserId;
    return state.photos.filter(photo => {
      if (!photoIds.includes(photo.id)) return false;
      if (photo.ownerId === currentId) return true;
      if (photo.visibility === 'public') return true;
      if (photo.visibility === 'friends' && state.isFriend(photo.ownerId)) return true;
      return false;
    });
  },

  getCommentsForPost: (postId: string) => {
    return get().comments.filter(c => c.postId === postId);
  },

  canComment: (postId: string) => {
    const state = get();
    const post = state.posts.find(p => p.id === postId);
    if (!post) return false;
    if (post.authorId === state.currentUserId) return true;
    if (post.visibility === 'public') return true;
    if (post.visibility === 'friends' && state.isFriend(post.authorId)) return true;
    return false;
  },

  getStats: () => {
    const state = get();
    const friends = state.getFriendsOf(state.currentUserId);
    const myPosts = state.posts.filter(p => p.authorId === state.currentUserId);
    const myPhotos = state.photos.filter(p => p.ownerId === state.currentUserId);
    const pendingReceived = state.getPendingReceived();
    const pendingSent = state.getPendingSent();
    const myComments = state.comments.filter(c => c.authorId === state.currentUserId);
    return {
      friendCount: friends.length,
      postCount: myPosts.length,
      photoCount: myPhotos.length,
      pendingReceivedCount: pendingReceived.length,
      pendingSentCount: pendingSent.length,
      commentCount: myComments.length,
      articleCount: state.articles.filter(a => a.authorId === state.currentUserId).length,
    };
  },

  getVisibleArticles: (category?: ArticleCategory) => {
    const state = get();
    const currentId = state.currentUserId;
    let articles = state.articles;
    if (category) {
      articles = articles.filter(a => a.category === category);
    }
    return articles.filter(article => {
      if (article.authorId === currentId) return true;
      if (article.visibility === 'public') return true;
      if (article.visibility === 'friends' && state.isFriend(article.authorId)) return true;
      return false;
    });
  },

  addArticle: (title: string, content: string, category: ArticleCategory, tags: string[], visibility: Visibility, imageUrl?: string) => {
    const state = get();
    const newArticle: Article = {
      id: generateId('a'),
      authorId: state.currentUserId,
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.map(t => t.trim()).filter(Boolean),
      visibility,
      imageUrl,
      createdAt: nowStr(),
    };
    set(s => ({ articles: [newArticle, ...s.articles] }));
    logActivity(set, get, 'add_article', newArticle.id, title.trim(), `发布文章「${title.trim()}」`);
  },

  deleteArticle: (articleId: string) => {
    const state = get();
    const article = state.articles.find(a => a.id === articleId);
    if (!article || article.authorId !== state.currentUserId) return;
    set({ articles: state.articles.filter(a => a.id !== articleId) });
    logActivity(set, get, 'delete_article', articleId, article.title, `删除文章「${article.title}」`);
  },

  updateArticle: (articleId: string, updates) => {
    const state = get();
    const article = state.articles.find(a => a.id === articleId);
    if (!article || article.authorId !== state.currentUserId) return false;
    if (updates.title !== undefined && !updates.title.trim()) return false;
    if (updates.content !== undefined && !updates.content.trim()) return false;
    set({
      articles: state.articles.map(a => a.id === articleId ? { ...a, ...updates } : a),
    });
    logActivity(set, get, 'update_article', articleId, article.title, `编辑文章「${article.title}」`);
    return true;
  },

  getHiddenArticleCount: (category?: ArticleCategory) => {
    const state = get();
    const currentId = state.currentUserId;
    let articles = state.articles;
    if (category) {
      articles = articles.filter(a => a.category === category);
    }
    const hidden = articles.filter(article => {
      if (article.authorId === currentId) return false;
      if (article.visibility === 'public') return false;
      if (article.visibility === 'friends' && state.isFriend(article.authorId)) return false;
      return true;
    });
    return hidden.length;
  },

  switchUser: (userId: string) => {
    const state = get();
    const user = state.users.find(u => u.id === userId);
    const oldUser = state.users.find(u => u.id === state.currentUserId);
    // 先记录日志（此时 currentUserId 还是旧用户）
    if (user && oldUser && userId !== state.currentUserId) {
      logActivity(set, get, 'switch_user', userId, user.name, `切换账号：${oldUser.name} → ${user.name}`);
    }
    // 再更新状态
    set({ currentUserId: userId });
  },

  addPost: (content: string, visibility: Visibility, imageUrl?: string, photoLabel?: string) => {
    const state = get();
    const newPostId = generateId('p');
    const photoIds: string[] = [];
    if (imageUrl) {
      const newPhotoId = generateId('ph');
      const newPhoto: Photo = {
        id: newPhotoId,
        ownerId: state.currentUserId,
        postId: newPostId,
        color: '#6C9BD2',
        visibility,
        label: photoLabel || '新照片',
        imageUrl,
      };
      photoIds.push(newPhotoId);
      set(s => ({ photos: [newPhoto, ...s.photos] }));
    }
    const newPost: Post = {
      id: newPostId,
      authorId: state.currentUserId,
      content,
      visibility,
      photoIds,
      createdAt: nowStr(),
    };
    set(s => ({ posts: [newPost, ...s.posts] }));
    const visLabel = visibility === 'public' ? '公开' : visibility === 'friends' ? '好友可见' : '仅自己';
    logActivity(set, get, 'add_post', newPostId, content.slice(0, 20), `发布动态（${visLabel}）`);
  },

  addComment: (postId: string, parentId: string | null, content: string): boolean => {
    const state = get();
    if (!state.canComment(postId)) return false;
    if (!content.trim()) return false;
    const newComment: Comment = {
      id: generateId('c'),
      postId,
      authorId: state.currentUserId,
      parentId,
      content: content.trim(),
      createdAt: nowStr(),
    };
    set({ comments: [...state.comments, newComment] });
    logActivity(set, get, 'add_comment', postId, content.slice(0, 20), `评论动态：${content.trim().slice(0, 20)}`);
    return true;
  },

  sendFriendRequest: (friendId: string) => {
    const state = get();
    const relation = state.getRelation(friendId);
    if (relation !== 'none' && relation !== 'rejected' && relation !== 'rejected_them') return;
    const targetUser = state.users.find(u => u.id === friendId);
    // 清理双方所有 rejected 记录
    const filtered = state.friendships.filter(
      f => !((f.userId === state.currentUserId && f.friendId === friendId && f.status === 'rejected') ||
             (f.userId === friendId && f.friendId === state.currentUserId && f.status === 'rejected'))
    );
    const newRequest: Friendship = {
      userId: state.currentUserId,
      friendId,
      status: 'pending',
    };
    set({ friendships: [...filtered, newRequest] });
    logActivity(set, get, 'send_friend_request', friendId, targetUser?.name || friendId, `向 ${targetUser?.name || friendId} 发送好友申请`);
  },

  acceptFriendRequest: (userId: string) => {
    const state = get();
    const target = state.friendships.find(
      f => f.userId === userId && f.friendId === state.currentUserId && f.status === 'pending'
    );
    if (!target) return;
    const senderUser = state.users.find(u => u.id === userId);
    // 将对方发来的 pending 改为 accepted，同时将任何旧的反向记录也更新为 accepted
    const updated = state.friendships.map(f => {
      if (f.userId === userId && f.friendId === state.currentUserId && f.status === 'pending') {
        return { ...f, status: 'accepted' as const };
      }
      // 如果有旧的反向记录（rejected等），也更新为 accepted
      if (f.userId === state.currentUserId && f.friendId === userId && f.status !== 'accepted') {
        return { ...f, status: 'accepted' as const };
      }
      return f;
    });
    // 确保反向记录存在
    const hasReverse = updated.some(f => f.userId === state.currentUserId && f.friendId === userId && f.status === 'accepted');
    if (!hasReverse) {
      updated.push({ userId: state.currentUserId, friendId: userId, status: 'accepted' });
    }
    set({ friendships: updated });
    logActivity(set, get, 'accept_friend_request', userId, senderUser?.name || userId, `通过 ${senderUser?.name || userId} 的好友申请`);
  },

  rejectFriendRequest: (userId: string) => {
    const state = get();
    const senderUser = state.users.find(u => u.id === userId);
    const updated = state.friendships.map(
      f => (f.userId === userId && f.friendId === state.currentUserId && f.status === 'pending')
        ? { ...f, status: 'rejected' as const }
        : f
    );
    set({ friendships: updated });
    logActivity(set, get, 'reject_friend_request', userId, senderUser?.name || userId, `拒绝 ${senderUser?.name || userId} 的好友申请`);
  },

  cancelFriendRequest: (friendId: string) => {
    const state = get();
    const targetUser = state.users.find(u => u.id === friendId);
    set({
      friendships: state.friendships.filter(
        f => !(f.userId === state.currentUserId && f.friendId === friendId && f.status === 'pending')
      ),
    });
    logActivity(set, get, 'cancel_friend_request', friendId, targetUser?.name || friendId, `取消对 ${targetUser?.name || friendId} 的好友申请`);
  },

  changePhotoVisibility: (photoId: string, visibility: Visibility) => {
    const state = get();
    const photo = state.photos.find(p => p.id === photoId);
    set(s => ({
      photos: s.photos.map(p => p.id === photoId ? { ...p, visibility } : p),
    }));
    if (photo) {
      const visLabel = visibility === 'public' ? '公开' : visibility === 'friends' ? '好友可见' : '仅自己';
      logActivity(set, get, 'change_photo_visibility', photoId, photo.label, `照片「${photo.label}」可见性改为${visLabel}`);
    }
  },

  deletePost: (postId: string) => {
    const state = get();
    const post = state.posts.find(p => p.id === postId);
    if (!post || post.authorId !== state.currentUserId) return;
    const photoIds = post.photoIds;
    set({
      posts: state.posts.filter(p => p.id !== postId),
      photos: state.photos.filter(p => !photoIds.includes(p.id)),
      comments: state.comments.filter(c => c.postId !== postId),
    });
    logActivity(set, get, 'delete_post', postId, post.content.slice(0, 20), `删除动态`);
  },

  updatePostVisibility: (postId: string, visibility: Visibility) => {
    const state = get();
    const post = state.posts.find(p => p.id === postId);
    if (!post || post.authorId !== state.currentUserId) return;
    const visLabel = visibility === 'public' ? '公开' : visibility === 'friends' ? '好友可见' : '仅自己';
    set({
      posts: state.posts.map(p => p.id === postId ? { ...p, visibility } : p),
      photos: state.photos.map(p => post.photoIds.includes(p.id) ? { ...p, visibility } : p),
    });
    logActivity(set, get, 'update_post_visibility', postId, post.content.slice(0, 20), `动态可见性改为${visLabel}`);
  },

  deletePhoto: (photoId: string) => {
    const state = get();
    const photo = state.photos.find(p => p.id === photoId);
    if (!photo || photo.ownerId !== state.currentUserId) return;
    set({
      photos: state.photos.filter(p => p.id !== photoId),
      posts: state.posts.map(p => ({
        ...p,
        photoIds: p.photoIds.filter(id => id !== photoId),
      })),
    });
    logActivity(set, get, 'delete_photo', photoId, photo.label, `删除照片「${photo.label}」`);
  },

  unfriend: (userId: string) => {
    const state = get();
    const targetUser = state.users.find(u => u.id === userId);
    set({
      friendships: state.friendships.filter(
        f => !((f.userId === state.currentUserId && f.friendId === userId && f.status === 'accepted') ||
               (f.userId === userId && f.friendId === state.currentUserId && f.status === 'accepted'))
      ),
    });
    logActivity(set, get, 'unfriend', userId, targetUser?.name || userId, `解除与 ${targetUser?.name || userId} 的好友关系`);
  },

  searchUsers: (keyword: string) => {
    const state = get();
    const kw = keyword.toLowerCase().trim();
    if (!kw) return [];
    return state.users.filter(
      u => u.id !== state.currentUserId &&
        (u.name.toLowerCase().includes(kw) || u.school.toLowerCase().includes(kw) || u.className.toLowerCase().includes(kw) || u.grade.toLowerCase().includes(kw))
    );
  },

  getMutualFriends: (userId: string) => {
    const state = get();
    const myFriends = state.getFriendsOf(state.currentUserId);
    const theirFriends = state.getFriendsOf(userId);
    const theirIds = new Set(theirFriends.map(f => f.id));
    return myFriends.filter(f => theirIds.has(f.id));
  },

  getActivityLogs: () => {
    return get().activityLogs;
  },

  clearActivityLogs: () => {
    set({ activityLogs: [] });
  },
}));
