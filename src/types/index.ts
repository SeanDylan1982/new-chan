export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isAnonymous: boolean;
  joinDate: string;
  postCount: number;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  category: string;
  threadCount: number;
  postCount: number;
  lastActivity: string;
  isNSFW: boolean;
}

export interface Thread {
  id: string;
  boardId: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  lastReply: string;
  replyCount: number;
  isSticky: boolean;
  isLocked: boolean;
  images: string[];
  tags?: string[];
}

export interface Post {
  id: string;
  threadId: string;
  content: string;
  author: User;
  createdAt: string;
  replyTo?: string;
  images: string[];
  isOP?: boolean;
}

export interface AuthModalState {
  isOpen: boolean;
  mode: 'signin' | 'signup';
}

export interface CreateThreadData {
  title: string;
  content: string;
  images: File[];
  tags: string[];
}