import React from 'react';
import { Thread } from '../../types';
import { MessageCircle, Clock, Pin, Lock, Image, Tag, User } from 'lucide-react';

interface ThreadCardProps {
  thread: Thread;
  onClick: () => void;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onClick }) => {
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
      className={`bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-white hover:border-cyan-300 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.01] group ${
        thread.isSticky ? 'border-yellow-300 bg-yellow-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {thread.isSticky && (
              <Pin size={16} className="text-yellow-600" />
            )}
            {thread.isLocked && (
              <Lock size={16} className="text-red-600" />
            )}
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-cyan-600 transition-colors line-clamp-2">
              {thread.title}
            </h3>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{thread.content}</p>
          
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1 text-gray-500">
              <User size={14} />
              <span className="text-xs">
                {thread.author.isAnonymous ? 'Anonymous' : thread.author.username}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-400">
              <Clock size={12} />
              <span className="text-xs">{formatTimeAgo(thread.createdAt)}</span>
            </div>
          </div>

          {thread.tags && thread.tags.length > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              <Tag size={14} className="text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {thread.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {thread.images.length > 0 && (
          <div className="ml-4 flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={thread.images[0]}
                alt="Thread preview"
                className="w-full h-full object-cover"
              />
              {thread.images.length > 1 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="flex items-center space-x-1 text-white text-xs">
                    <Image size={12} />
                    <span>+{thread.images.length - 1}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageCircle size={16} />
            <span>{formatNumber(thread.replyCount)} replies</span>
          </div>
          {thread.images.length > 0 && (
            <div className="flex items-center space-x-1">
              <Image size={16} />
              <span>{thread.images.length}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 text-gray-400">
          <span className="text-xs">Last reply: {formatTimeAgo(thread.lastReply)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created by {thread.author.isAnonymous ? 'Anonymous' : thread.author.username}
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 px-3 py-1 rounded-full">
            <span className="text-xs text-cyan-600 font-medium">View Thread →</span>
          </div>
        </div>
      </div>
    </div>
  );
};