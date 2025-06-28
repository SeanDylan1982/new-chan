import React, { useState } from 'react';
import { useThreads } from '../../hooks/useThreads';
import { ThreadCard } from '../threads/ThreadCard';
import { CreateThreadModal } from '../threads/CreateThreadModal';
import { Board, CreateThreadData } from '../../types';
import { ArrowLeft, Plus, Search, Filter, SortDesc, Loader2 } from 'lucide-react';

interface BoardViewProps {
  board: Board;
  onBack: () => void;
  onThreadSelect: (threadId: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({ board, onBack, onThreadSelect }) => {
  const { threads, isLoading, createThread } = useThreads(board.id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'replies' | 'activity'>('activity');

  const handleCreateThread = async (data: CreateThreadData) => {
    await createThread(data);
    setIsCreateModalOpen(false);
  };

  const filteredAndSortedThreads = threads
    .filter(thread => 
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'replies':
          return b.replyCount - a.replyCount;
        case 'activity':
        default:
          return new Date(b.lastReply).getTime() - new Date(a.lastReply).getTime();
      }
    });

  // Separate sticky threads
  const stickyThreads = filteredAndSortedThreads.filter(thread => thread.isSticky);
  const regularThreads = filteredAndSortedThreads.filter(thread => !thread.isSticky);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading threads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Boards</span>
          </button>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all"
          >
            <Plus size={20} />
            <span>New Thread</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <h1 className="text-3xl font-bold text-white">{board.name}</h1>
          <div className="bg-gray-700/50 px-3 py-1 rounded-full text-sm text-gray-400 border border-gray-600">
            {board.category}
          </div>
        </div>
        
        <p className="text-gray-300 mb-4">{board.description}</p>
        
        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <span>{board.threadCount} threads</span>
          <span>{board.postCount} posts</span>
          <span>Last activity: {new Date(board.lastActivity).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400" size={20} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
          >
            <option value="activity">Latest Activity</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="replies">Most Replies</option>
          </select>
        </div>
      </div>

      {/* Thread Lists */}
      <div className="space-y-6">
        {/* Sticky Threads */}
        {stickyThreads.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-yellow-400">Pinned Threads</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-400/30 to-transparent"></div>
            </div>
            {stickyThreads.map(thread => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => onThreadSelect(thread.id)}
              />
            ))}
          </div>
        )}

        {/* Regular Threads */}
        {regularThreads.length > 0 && (
          <div className="space-y-4">
            {stickyThreads.length > 0 && (
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-white">Threads</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
                <span className="text-sm text-gray-400">{regularThreads.length} threads</span>
              </div>
            )}
            {regularThreads.map(thread => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => onThreadSelect(thread.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedThreads.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
              <SortDesc className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'No threads found' : 'No threads yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Be the first to start a discussion in this board!'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all"
                >
                  Create First Thread
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateThreadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateThread}
        boardName={board.name}
      />
    </div>
  );
};