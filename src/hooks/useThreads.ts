import { useState, useEffect } from 'react';
import { Thread, Post, CreateThreadData } from '../types';
import { threadsAPI, postsAPI } from '../services/api';

export const useThreads = (boardId?: string) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!boardId) {
      setIsLoading(false);
      return;
    }

    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        const response = await threadsAPI.getByBoard(boardId);
        setThreads(response.threads);
      } catch (error) {
        console.error('Failed to fetch threads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [boardId]);

  const createThread = async (data: CreateThreadData) => {
    if (!boardId) throw new Error('Board ID is required');
    
    try {
      const response = await threadsAPI.create({
        boardId,
        title: data.title,
        content: data.content,
        images: [], // TODO: Handle image uploads
        tags: data.tags
      });
      
      setThreads(prev => [response.thread, ...prev]);
      return response.thread;
    } catch (error) {
      throw error;
    }
  };

  const updateThread = async (id: string, data: { isSticky?: boolean; isLocked?: boolean }) => {
    try {
      const response = await threadsAPI.update(id, data);
      setThreads(prev => prev.map(thread => 
        thread.id === id ? response.thread : thread
      ));
      return response.thread;
    } catch (error) {
      throw error;
    }
  };

  const deleteThread = async (id: string) => {
    try {
      await threadsAPI.delete(id);
      setThreads(prev => prev.filter(thread => thread.id !== id));
    } catch (error) {
      throw error;
    }
  };

  return { 
    threads, 
    isLoading, 
    createThread, 
    updateThread, 
    deleteThread 
  };
};

export const usePosts = (threadId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!threadId) {
      setIsLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await postsAPI.getByThread(threadId);
        setPosts(response.posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [threadId]);

  const createPost = async (content: string, images: File[] = [], replyTo?: string) => {
    if (!threadId) throw new Error('Thread ID is required');
    
    try {
      const response = await postsAPI.create({
        threadId,
        content,
        images: [], // TODO: Handle image uploads
        replyTo
      });
      
      setPosts(prev => [...prev, response.post]);
      return response.post;
    } catch (error) {
      throw error;
    }
  };

  const updatePost = async (id: string, content: string) => {
    try {
      const response = await postsAPI.update(id, { content });
      setPosts(prev => prev.map(post => 
        post.id === id ? response.post : post
      ));
      return response.post;
    } catch (error) {
      throw error;
    }
  };

  const deletePost = async (id: string) => {
    try {
      await postsAPI.delete(id);
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (error) {
      throw error;
    }
  };

  return { 
    posts, 
    isLoading, 
    createPost, 
    updatePost, 
    deletePost 
  };
};