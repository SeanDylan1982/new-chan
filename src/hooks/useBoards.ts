import { useState, useEffect } from 'react';
import { Board, CreateBoardData } from '../types';
import { boardsAPI } from '../services/api';

export const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await boardsAPI.getAll();
        setBoards(response.boards);
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const createBoard = async (data: CreateBoardData) => {
    try {
      const response = await boardsAPI.create(data);
      setBoards(prev => [response.board, ...prev]);
      return response.board;
    } catch (error) {
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
    createBoard, 
    updateBoard, 
    deleteBoard 
  };
};