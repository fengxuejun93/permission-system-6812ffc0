export type Visibility = 'public' | 'friends' | 'self';

export interface User {
  id: string;
  name: string;
  avatarColor: string;
  school: string;
  className: string;
  signature: string;
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
  status: 'accepted' | 'pending';
}
