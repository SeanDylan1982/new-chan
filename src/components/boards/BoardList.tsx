import React from 'react';
import { useBoards } from '../../hooks/useBoards';
import { BoardCard } from './BoardCard';
import { Loader2, Zap } from 'lucide-react';

interface BoardListProps {
  onBoardSelect: (boardId: string) => void;
}

export const BoardList: React.FC<BoardListProps> = ({ onBoardSelect }) => {
  const { boards, isLoading } = useBoards();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading boards...</p>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(boards.map(board => board.category)));

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-xl">
            <Zap className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to NeoBoard</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover communities, share ideas, and connect with people who share your interests.
          Choose a board below to start exploring.
        </p>
      </div>

      {/* Boards by Category */}
      {categories.map(category => {
        const categoryBoards = boards.filter(board => board.category === category);
        
        return (
          <div key={category} className="space-y-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-white">{category}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
              <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                {categoryBoards.length} boards
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryBoards.map(board => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onClick={() => onBoardSelect(board.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {boards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No boards available at the moment.</p>
        </div>
      )}
    </div>
  );
};