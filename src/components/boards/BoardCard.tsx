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

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technology':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'entertainment':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'creative':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'general':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-white hover:border-cyan-300 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
              {board.name}
            </h3>
            {board.isNSFW && (
              <div className="bg-red-100 border border-red-200 px-2 py-1 rounded-full">
                <AlertTriangle size={12} className="text-red-600" />
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-3">{board.description}</p>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(board.category)}`}>
            {board.category}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageCircle size={16} />
            <span>{formatNumber(board.threadCount)} threads</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>{formatNumber(board.postCount)} posts</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-gray-400">
          <Clock size={14} />
          <span className="text-xs">{formatTimeAgo(board.lastActivity)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Last activity: {formatTimeAgo(board.lastActivity)}
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 px-3 py-1 rounded-full">
            <span className="text-xs text-cyan-600 font-medium">Enter Board →</span>
          </div>
        </div>
      </div>
    </div>
  );
};