import React, { useState } from 'react';
import { useBoards } from '../../hooks/useBoards';
import { BoardCard } from './BoardCard';
import { CreateBoardModal } from './CreateBoardModal';
import { CreateBoardData } from '../../types';
import { Loader2, Zap, Plus, AlertCircle } from 'lucide-react';

interface BoardListProps {
  onBoardSelect: (boardId: string) => void;
}

export const BoardList: React.FC<BoardListProps> = ({ onBoardSelect }) => {
  const { boards, isLoading, error, createBoard } = useBoards();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateBoard = async (data: CreateBoardData) => {
    await createBoard(data);
    setIsCreateModalOpen(false);
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">Connection Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to NeoBoard
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
          Discover communities, share ideas, and connect with people who share
          your interests. Choose a board below to start exploring.
        </p>

        {/* Create Board Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-300 hover:to-emerald-400 transition-all transform hover:scale-105 font-semibold shadow-lg"
        >
          <Plus size={20} />
          <span>Create New Board</span>
        </button>
      </div>

      <div className="flex justify-end mb-4">
        <button
          className={`px-3 py-1 rounded-l ${
            viewMode === "list" ? "bg-cyan-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setViewMode("list")}
        >
          List
        </button>
        <button
          className={`px-3 py-1 rounded-r ${
            viewMode === "grid" ? "bg-cyan-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setViewMode("grid")}
        >
          Grid
        </button>
      </div>

      {/* Boards by Category */}
      {categories.length > 0 &&
        categories.map((category) => {
          const categoryBoards = boards.filter(
            (board) => board.category === category
          );

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
                {categoryBoards.map((board) => (
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

      {boards.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
            <Plus className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No boards yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to create a board and start building your community!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all"
            >
              Create First Board
            </button>
          </div>
        </div>
      )}

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBoard}
      />
    </div>
  );
};