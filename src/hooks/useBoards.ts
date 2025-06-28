import { useState, useEffect } from 'react';
import { Board } from '../types';

// Mock boards hook - ready for backend integration
export const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchBoards = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockBoards: Board[] = [
        {
          id: 'tech',
          name: '/tech/',
          description: 'Technology & Programming',
          category: 'Technology',
          threadCount: 1247,
          postCount: 12450,
          lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          isNSFW: false
        },
        {
          id: 'gaming',
          name: '/g/',
          description: 'Video Games & Gaming Culture',
          category: 'Entertainment',
          threadCount: 892,
          postCount: 8920,
          lastActivity: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          isNSFW: false
        },
        {
          id: 'art',
          name: '/art/',
          description: 'Digital Art & Creative Works',
          category: 'Creative',
          threadCount: 456,
          postCount: 4560,
          lastActivity: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          isNSFW: false
        },
        {
          id: 'random',
          name: '/r/',
          description: 'Random Discussion',
          category: 'General',
          threadCount: 2341,
          postCount: 23410,
          lastActivity: new Date(Date.now() - 1000 * 30).toISOString(),
          isNSFW: false
        }
      ];
      
      setBoards(mockBoards);
      setIsLoading(false);
    };

    fetchBoards();
  }, []);

  return { boards, isLoading };
};