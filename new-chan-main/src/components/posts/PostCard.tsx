import React, { useState } from 'react';
import { Post } from '../../types';
import { Clock, Reply, Image, MoreHorizontal, User } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onReply: (postId: string) => void;
  showReplyTo?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onReply, showReplyTo = true }) => {
  const [showFullContent, setShowFullContent] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const isLongContent = post.content.length > 500;
  const displayContent = showFullContent || !isLongContent 
    ? post.content 
    : post.content.substring(0, 500) + '...';

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-white hover:shadow-md transition-all duration-200 ${
      post.isOP ? 'border-cyan-300 bg-cyan-50' : ''
    }`}>
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            post.isOP 
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500' 
              : post.author.isAnonymous 
                ? 'bg-gray-400' 
                : 'bg-gradient-to-r from-purple-400 to-pink-500'
          }`}>
            <User size={20} className="text-white" />
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${
                post.isOP ? 'text-cyan-600' : 'text-gray-900'
              }`}>
                {post.author.isAnonymous ? 'Anonymous' : post.author.username}
              </span>
              {post.isOP && (
                <span className="bg-cyan-100 border border-cyan-200 px-2 py-1 rounded-full text-xs text-cyan-600 font-medium">
                  OP
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span>#{post.id.slice(-6)}</span>
            </div>
          </div>
        </div>

        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Reply Reference */}
      {showReplyTo && post.replyTo && (
        <div className="mb-4 p-3 bg-gray-100 border-l-4 border-cyan-300 rounded-r-lg">
          <div className="text-sm text-gray-600">
            <Reply size={14} className="inline mr-1" />
            Replying to #{post.replyTo.slice(-6)}
          </div>
        </div>
      )}

      {/* Post Content */}
      <div className="mb-4">
        <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {displayContent}
        </div>
        {isLongContent && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-cyan-600 hover:text-cyan-700 text-sm mt-2 transition-colors"
          >
            {showFullContent ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Post Images */}
      {post.images.length > 0 && (
        <div className="mb-4">
          <div className={`grid gap-3 ${
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {post.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                  <Image className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onReply(post.id)}
            className="flex items-center space-x-2 text-gray-500 hover:text-cyan-600 transition-colors"
          >
            <Reply size={16} />
            <span className="text-sm">Reply</span>
          </button>
        </div>

        <div className="text-xs text-gray-400">
          Post #{post.id.slice(-6)}
        </div>
      </div>
    </div>
  );
};