import { useState, useEffect } from 'react';
import { Board, CreateBoardData } from '../types';
import { boardsAPI } from '../services/api';

export const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoards = async () => {
      console.log('🔄 Fetching boards...');
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await boardsAPI.getAll();
        console.log('✅ Boards fetched successfully:', response);
        setBoards(response.boards || []);
      } catch (error) {
        console.error('❌ Failed to fetch boards:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch boards');
        setBoards([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const createBoard = async (data: CreateBoardData) => {
    try {
      console.log('🔄 Creating board:', data);
      const response = await boardsAPI.create(data);
      console.log('✅ Board created successfully:', response);
      setBoards(prev => [response.board, ...prev]);
      return response.board;
    } catch (error) {
      console.error('❌ Failed to create board:', error);
      throw error;
    }
  };

  const updateBoard = async (id: string, data: Partial<CreateBoardData>) => {
    try {
      const response = await boardsAPI.update(id, data);
      setBoards(prev => prev.map(board => 
        board.id === id ? response.board : board
      ));
      return response.board;
    } catch (error) {
      throw error;
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      await boardsAPI.delete(id);
      setBoards(prev => prev.filter(board => board.id !== id));
    } catch (error) {
      throw error;
    }
  };

  return { 
    boards, 
    isLoading, 
    error,
    createBoard, 
    updateBoard, 
    deleteBoard 
  };
};