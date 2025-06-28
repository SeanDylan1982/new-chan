import React, { useState } from 'react';
import { usePosts } from '../../hooks/useThreads';
import { PostCard } from '../posts/PostCard';
import { Thread } from '../../types';
import { ArrowLeft, MessageCircle, Users, Clock, Pin, Lock, Loader2, Send } from 'lucide-react';

interface ThreadViewProps {
  thread: Thread;
  onBack: () => void;
}

export const ThreadView: React.FC<ThreadViewProps> = ({ thread, onBack }) => {
  const { posts, isLoading, createPost } = usePosts(thread.id);
  const [replyContent, setReplyContent] = useState('');
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleReply = (postId: string) => {
    setReplyToId(postId);
    // Scroll to reply form
    document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost(replyContent, [], replyToId);
      setReplyContent('');
      setReplyToId(undefined);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading thread...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thread Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Board</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          {thread.isSticky && <Pin size={20} className="text-yellow-400" />}
          {thread.isLocked && <Lock size={20} className="text-red-400" />}
          <h1 className="text-2xl font-bold text-white">{thread.title}</h1>
        </div>

        {thread.tags && thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {thread.tags.map(tag => (
              <span
                key={tag}
                className="bg-gray-700/50 px-3 py-1 rounded-full text-sm text-gray-400 border border-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <MessageCircle size={16} />
            <span>{thread.replyCount} replies</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>by {thread.author.isAnonymous ? 'Anonymous' : thread.author.username}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>Created {formatTimeAgo(thread.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onReply={handleReply}
          />
        ))}
      </div>

      {/* Reply Form */}
      {!thread.isLocked && (
        <div id="reply-form" className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {replyToId ? `Replying to #${replyToId.slice(-6)}` : 'Post a Reply'}
          </h3>
          
          {replyToId && (
            <div className="mb-4 p-3 bg-gray-700/30 border-l-4 border-cyan-400/50 rounded-r-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Replying to #{replyToId.slice(-6)}
                </span>
                <button
                  onClick={() => setReplyToId(undefined)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitReply} className="space-y-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
              maxLength={5000}
              required
            />
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {replyContent.length}/5000 characters
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Send size={16} />
                )}
                <span>{isSubmitting ? 'Posting...' : 'Post Reply'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {thread.isLocked && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <Lock className="mx-auto text-red-400 mb-2" size={32} />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Thread Locked</h3>
          <p className="text-gray-400">This thread has been locked and no new replies can be posted.</p>
        </div>
      )}
    </div>
  );
};