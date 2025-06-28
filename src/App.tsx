import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BoardList } from './components/boards/BoardList';
import { AuthModal } from './components/auth/AuthModal';
import { AuthModalState } from './types';

function App() {
  const [authModalState, setAuthModalState] = useState<AuthModalState>({
    isOpen: false,
    mode: 'signin'
  });
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // Handle auth modal events
  useEffect(() => {
    const handleAuthModal = (event: CustomEvent) => {
      setAuthModalState({
        isOpen: true,
        mode: event.detail.mode
      });
    };

    // Listen for auth modal events
    window.addEventListener('auth-modal', handleAuthModal as EventListener);
    
    return () => {
      window.removeEventListener('auth-modal', handleAuthModal as EventListener);
    };
  }, []);

  const handleAuthModalClose = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleBoardSelect = (boardId: string) => {
    setSelectedBoardId(boardId);
    // TODO: Navigate to board view
    console.log('Selected board:', boardId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header onAuthModal={setAuthModalState} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BoardList onBoardSelect={handleBoardSelect} />
      </main>

      <AuthModal
        modalState={authModalState}
        onClose={handleAuthModalClose}
      />

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

export default App;