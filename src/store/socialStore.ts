import { create } from 'zustand';
import type { User, Post, Photo, Comment, Friendship, Visibility, RelationType, Article, ArticleCategory } from '@/types';
import { mockUsers, mockPosts, mockPhotos, mockComments, mockFriendships } from '@/data/mockData';
import { mockArticles } from '@/data/mockArticles';
import { generateSampleImageUri } from '@/utils/sampleImages';

interface Stats {
  friendCount: number;
  postCount: number;
  photoCount: number;
  pendingReceivedCount: number;
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
}

const generateId = (prefix: string) => `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const useSocialStore = create<SocialState>((set, get) => ({
  currentUserId: 'u1',
  users: mockUsers,
  posts: mockPosts,
  photos: mockPhotos,
  comments: mockComments,
  friendships: mockFriendships,
  articles: mockArticles,

  currentUser: () => {
    const state = get();
    return state.users.find(u => u.id === state.currentUserId) || mockUsers[0];
  },

  getRelation: (userId: string): RelationType => {
    const state = get();
    if (userId === state.currentUserId) return 'self';
    const fs = state.friendships;
    // 已是好友
    if (fs.some(f => f.userId === state.currentUserId && f.friendId === userId && f.status === 'accepted')) return 'friend';
    // 我发出的待确认申请
    if (fs.some(f => f.userId === state.currentUserId && f.friendId === userId && f.status === 'pending')) return 'pending_sent';
    // 对方发来的待确认申请
    if (fs.some(f => f.userId === userId && f.friendId === state.currentUserId && f.status === 'pending')) return 'pending_received';
    // 被拒绝（我发出的被拒）
    if (fs.some(f => f.userId === state.currentUserId && f.friendId === userId && f.status === 'rejected')) return 'rejected';
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
    // 作者自己可评论
    if (post.authorId === state.currentUserId) return true;
    // 公开动态任何人可评论
    if (post.visibility === 'public') return true;
    // 好友可见动态仅好友可评论
    if (post.visibility === 'friends' && state.isFriend(post.authorId)) return true;
    return false;
  },

  getStats: () => {
    const state = get();
    const friends = state.getFriendsOf(state.currentUserId);
    const myPosts = state.posts.filter(p => p.authorId === state.currentUserId);
    const myPhotos = state.photos.filter(p => p.ownerId === state.currentUserId);
    const pendingReceived = state.getPendingReceived();
    const myComments = state.comments.filter(c => c.authorId === state.currentUserId);
    return {
      friendCount: friends.length,
      postCount: myPosts.length,
      photoCount: myPhotos.length,
      pendingReceivedCount: pendingReceived.length,
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
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
    };
    set(s => ({ articles: [newArticle, ...s.articles] }));
  },

  deleteArticle: (articleId: string) => {
    const state = get();
    const article = state.articles.find(a => a.id === articleId);
    if (!article || article.authorId !== state.currentUserId) return;
    set({ articles: state.articles.filter(a => a.id !== articleId) });
  },

  updateArticle: (articleId: string, updates) => {
    const state = get();
    const article = state.articles.find(a => a.id === articleId);
    if (!article || article.authorId !== state.currentUserId) return false;
    // 校验标题
    if (updates.title !== undefined && !updates.title.trim()) return false;
    // 校验内容
    if (updates.content !== undefined && !updates.content.trim()) return false;
    set({
      articles: state.articles.map(a => a.id === articleId ? { ...a, ...updates } : a),
    });
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
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
    };
    set(s => ({ posts: [newPost, ...s.posts] }));
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
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
    };
    set({ comments: [...state.comments, newComment] });
    return true;
  },

  sendFriendRequest: (friendId: string) => {
    const state = get();
    const relation = state.getRelation(friendId);
    if (relation !== 'none' && relation !== 'rejected') return;
    // 如果之前被拒绝过，先删除旧记录
    const filtered = state.friendships.filter(
      f => !(f.userId === state.currentUserId && f.friendId === friendId && f.status === 'rejected')
    );
    const newRequest: Friendship = {
      userId: state.currentUserId,
      friendId,
      status: 'pending',
    };
    set({ friendships: [...filtered, newRequest] });
  },

  acceptFriendRequest: (userId: string) => {
    const state = get();
    // 找到对方发来的 pending 申请
    const target = state.friendships.find(
      f => f.userId === userId && f.friendId === state.currentUserId && f.status === 'pending'
    );
    if (!target) return;
    // 更新为 accepted 并添加反向关系
    const updated = state.friendships.map(
      f => (f.userId === userId && f.friendId === state.currentUserId && f.status === 'pending')
        ? { ...f, status: 'accepted' as const }
        : f
    );
    // 添加反向关系（如果不存在）
    const hasReverse = updated.some(f => f.userId === state.currentUserId && f.friendId === userId);
    if (!hasReverse) {
      updated.push({ userId: state.currentUserId, friendId: userId, status: 'accepted' });
    }
    set({ friendships: updated });
  },

  rejectFriendRequest: (userId: string) => {
    const state = get();
    const updated = state.friendships.map(
      f => (f.userId === userId && f.friendId === state.currentUserId && f.status === 'pending')
        ? { ...f, status: 'rejected' as const }
        : f
    );
    set({ friendships: updated });
  },

  cancelFriendRequest: (friendId: string) => {
    const state = get();
    // 删除我发出的 pending 申请
    set({
      friendships: state.friendships.filter(
        f => !(f.userId === state.currentUserId && f.friendId === friendId && f.status === 'pending')
      ),
    });
  },

  changePhotoVisibility: (photoId: string, visibility: Visibility) => {
    set(state => ({
      photos: state.photos.map(p => p.id === photoId ? { ...p, visibility } : p),
    }));
  },

  deletePost: (postId: string) => {
    const state = get();
    const post = state.posts.find(p => p.id === postId);
    if (!post || post.authorId !== state.currentUserId) return;
    // 删除关联照片和评论
    const photoIds = post.photoIds;
    set({
      posts: state.posts.filter(p => p.id !== postId),
      photos: state.photos.filter(p => !photoIds.includes(p.id)),
      comments: state.comments.filter(c => c.postId !== postId),
    });
  },

  updatePostVisibility: (postId: string, visibility: Visibility) => {
    const state = get();
    const post = state.posts.find(p => p.id === postId);
    if (!post || post.authorId !== state.currentUserId) return;
    // 同步更新关联照片的可见性
    set({
      posts: state.posts.map(p => p.id === postId ? { ...p, visibility } : p),
      photos: state.photos.map(p => post.photoIds.includes(p.id) ? { ...p, visibility } : p),
    });
  },

  deletePhoto: (photoId: string) => {
    const state = get();
    const photo = state.photos.find(p => p.id === photoId);
    if (!photo || photo.ownerId !== state.currentUserId) return;
    // 从关联动态中移除该 photoId
    set({
      photos: state.photos.filter(p => p.id !== photoId),
      posts: state.posts.map(p => ({
        ...p,
        photoIds: p.photoIds.filter(id => id !== photoId),
      })),
    });
  },

  unfriend: (userId: string) => {
    const state = get();
    // 删除双向好友关系
    set({
      friendships: state.friendships.filter(
        f => !((f.userId === state.currentUserId && f.friendId === userId && f.status === 'accepted') ||
               (f.userId === userId && f.friendId === state.currentUserId && f.status === 'accepted'))
      ),
    });
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
