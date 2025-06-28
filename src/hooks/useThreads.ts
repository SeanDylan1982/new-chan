import { useState, useEffect } from 'react';
import { Thread, Post, CreateThreadData } from '../types';

export const useThreads = (boardId?: string) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!boardId) return;

    const fetchThreads = async () => {
      setIsLoading(true);
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockThreads: Thread[] = [
        {
          id: 'thread-1',
          boardId,
          title: 'Welcome to the new board!',
          content: 'This is the first thread on this board. Feel free to discuss anything related to the topic.',
          author: {
            id: 'admin',
            username: 'Admin',
            email: 'admin@example.com',
            isAnonymous: false,
            joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
            postCount: 150
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          lastReply: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          replyCount: 23,
          isSticky: true,
          isLocked: false,
          images: [],
          tags: ['announcement', 'welcome']
        },
        {
          id: 'thread-2',
          boardId,
          title: 'What are your thoughts on the latest developments?',
          content: 'I\'ve been following the recent news and wanted to get everyone\'s perspective on what\'s happening.',
          author: {
            id: 'user-1',
            username: 'TechEnthusiast',
            email: '',
            isAnonymous: false,
            joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
            postCount: 42
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          lastReply: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          replyCount: 8,
          isSticky: false,
          isLocked: false,
          images: [],
          tags: ['discussion']
        },
        {
          id: 'thread-3',
          boardId,
          title: 'Check out this amazing project I\'ve been working on',
          content: 'After months of development, I\'m finally ready to share what I\'ve been building. Would love to get your feedback!',
          author: {
            id: 'anon-1',
            username: 'Anonymous',
            email: '',
            isAnonymous: true,
            joinDate: new Date().toISOString(),
            postCount: 0
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          lastReply: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          replyCount: 15,
          isSticky: false,
          isLocked: false,
          images: ['https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg'],
          tags: ['project', 'showcase']
        }
      ];
      
      setThreads(mockThreads);
      setIsLoading(false);
    };

    fetchThreads();
  }, [boardId]);

  const createThread = async (data: CreateThreadData) => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newThread: Thread = {
      id: `thread-${Date.now()}`,
      boardId: boardId!,
      title: data.title,
      content: data.content,
      author: {
        id: 'current-user',
        username: 'CurrentUser',
        email: 'user@example.com',
        isAnonymous: false,
        joinDate: new Date().toISOString(),
        postCount: 1
      },
      createdAt: new Date().toISOString(),
      lastReply: new Date().toISOString(),
      replyCount: 0,
      isSticky: false,
      isLocked: false,
      images: [], // TODO: Handle image uploads
      tags: data.tags
    };
    
    setThreads(prev => [newThread, ...prev]);
    return newThread;
  };

  return { threads, isLoading, createThread };
};

export const usePosts = (threadId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!threadId) return;

    const fetchPosts = async () => {
      setIsLoading(true);
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockPosts: Post[] = [
        {
          id: 'post-1',
          threadId,
          content: 'This is the original post content. Thanks for checking out this thread!',
          author: {
            id: 'user-1',
            username: 'ThreadCreator',
            email: '',
            isAnonymous: false,
            joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
            postCount: 42
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          images: [],
          isOP: true
        },
        {
          id: 'post-2',
          threadId,
          content: 'Great thread! I\'ve been thinking about this topic a lot lately.',
          author: {
            id: 'user-2',
            username: 'RegularUser',
            email: '',
            isAnonymous: false,
            joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
            postCount: 28
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          images: []
        },
        {
          id: 'post-3',
          threadId,
          content: 'Interesting perspective. I have a different take on this...',
          author: {
            id: 'anon-1',
            username: 'Anonymous',
            email: '',
            isAnonymous: true,
            joinDate: new Date().toISOString(),
            postCount: 0
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          replyTo: 'post-2',
          images: []
        }
      ];
      
      setPosts(mockPosts);
      setIsLoading(false);
    };

    fetchPosts();
  }, [threadId]);

  const createPost = async (content: string, images: File[] = [], replyTo?: string) => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPost: Post = {
      id: `post-${Date.now()}`,
      threadId: threadId!,
      content,
      author: {
        id: 'current-user',
        username: 'CurrentUser',
        email: 'user@example.com',
        isAnonymous: false,
        joinDate: new Date().toISOString(),
        postCount: 1
      },
      createdAt: new Date().toISOString(),
      replyTo,
      images: [] // TODO: Handle image uploads
    };
    
    setPosts(prev => [...prev, newPost]);
    return newPost;
  };

  return { posts, isLoading, createPost };
};