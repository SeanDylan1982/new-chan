import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
        <p className="text-gray-400 text-lg">Loading NeoBoard...</p>
      </div>
    </div>
  );
};