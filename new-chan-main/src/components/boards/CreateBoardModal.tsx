import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { CreateBoardData } from '../../types';
import { Hash, AlertTriangle, Loader2 } from 'lucide-react';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBoardData) => Promise<void>;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateBoardData>({
    name: '',
    description: '',
    category: 'General',
    isNSFW: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Technology', 'Entertainment', 'Creative', 'General'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Board name and description are required');
      return;
    }

    // Validate board name format
    if (!formData.name.startsWith('/') || !formData.name.endsWith('/')) {
      setError('Board name must be in format /boardname/');
      return;
    }

    if (formData.name.length < 4 || formData.name.length > 20) {
      setError('Board name must be between 4 and 20 characters (including slashes)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(formData);
      setFormData({ name: '', description: '', category: 'General', isNSFW: false });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
    } finally {
      setIsSubmitting(false);
    }
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Board"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Board Name
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="/boardname/"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              maxLength={20}
              required
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Format: /boardname/ (e.g., /tech/, /gaming/)
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this board is about..."
            rows={3}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
            maxLength={200}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.description.length}/200 characters
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(formData.category)}`}>
              {formData.category}
            </span>
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isNSFW}
              onChange={(e) => setFormData(prev => ({ ...prev, isNSFW: e.target.checked }))}
              className="w-4 h-4 text-cyan-600 bg-white border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
            />
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-sm font-medium text-gray-700">
                NSFW Content (18+)
              </span>
            </div>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Check this if the board will contain adult content
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Create Board'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};