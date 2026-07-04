export type Visibility = 'public' | 'friends' | 'self';

export type FriendStatus = 'accepted' | 'pending' | 'rejected';

export type RelationType = 'self' | 'friend' | 'pending_sent' | 'pending_received' | 'rejected' | 'none';

export type ArticleCategory = 'mental_health' | 'fashion' | 'cooking' | 'hot_topics';

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  mental_health: '心理健康',
  fashion: '穿搭',
  cooking: '烹饪',
  hot_topics: '热点',
};

export const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  mental_health: '#7C3AED',
  fashion: '#EC4899',
  cooking: '#F59E0B',
  hot_topics: '#EF4444',
};

export interface User {
  id: string;
  name: string;
  avatarColor: string;
  school: string;
  className: string;
  signature: string;
  grade: string;
  online: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  visibility: Visibility;
  photoIds: string[];
  createdAt: string;
}

export interface Photo {
  id: string;
  ownerId: string;
  postId: string | null;
  color: string;
  visibility: Visibility;
  label: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
}

export interface Friendship {
  userId: string;
  friendId: string;
  status: FriendStatus;
}

export interface Article {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: ArticleCategory;
  tags: string[];
  visibility: Visibility;
  imageUrl?: string;
  createdAt: string;
}

// 操作日志
export type ActivityAction =
  | 'send_friend_request' | 'accept_friend_request' | 'reject_friend_request'
  | 'cancel_friend_request' | 'unfriend'
  | 'add_post' | 'delete_post' | 'update_post_visibility'
  | 'add_comment'
  | 'add_article' | 'delete_article' | 'update_article'
  | 'change_photo_visibility' | 'delete_photo'
  | 'switch_user';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  operatorId: string;
  targetId: string;       // 操作对象ID（好友userId/动态postId/照片photoId/文章articleId）
  targetName: string;     // 操作对象名称（人名/动态内容摘要）
  detail: string;         // 操作描述
  createdAt: string;
}
