import React from 'react';
import { Board } from '../../types';
import { MessageCircle, Users, Clock, AlertTriangle } from 'lucide-react';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, onClick }) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 hover:border-cyan-400/30 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
              {board.name}
            </h3>
            {board.isNSFW && (
              <div className="bg-red-600/20 border border-red-600/40 px-2 py-1 rounded-full">
                <AlertTriangle size={12} className="text-red-400" />
              </div>
            )}
          </div>
          <p className="text-gray-300 text-sm mb-3">{board.description}</p>
          <div className="inline-block bg-gray-700/50 px-3 py-1 rounded-full text-xs text-gray-400 border border-gray-600">
            {board.category}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-400">
          <div className="flex items-center space-x-1">
            <MessageCircle size={16} />
            <span>{formatNumber(board.threadCount)} threads</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>{formatNumber(board.postCount)} posts</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-gray-500">
          <Clock size={14} />
          <span className="text-xs">{formatTimeAgo(board.lastActivity)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Last activity: {formatTimeAgo(board.lastActivity)}
          </div>
          <div className="bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 px-3 py-1 rounded-full">
            <span className="text-xs text-cyan-400 font-medium">Enter Board →</span>
          </div>
        </div>
      </div>
    </div>
  );
};