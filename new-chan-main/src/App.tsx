import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BoardList } from './components/boards/BoardList';
import { BoardView } from './components/boards/BoardView';
import { ThreadView } from './components/threads/ThreadView';
import { AuthModal } from './components/auth/AuthModal';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useBoards } from './hooks/useBoards';
import { useThreads } from './hooks/useThreads';
import { useAuth } from './hooks/useAuth';
import { AuthModalState } from './types';

type ViewState = 
  | { type: 'boards' }
  | { type: 'board'; boardId: string }
  | { type: 'thread'; threadId: string; boardId: string };

function App() {
  const { isInitialized } = useAuth();
  const [authModalState, setAuthModalState] = useState<AuthModalState>({
    isOpen: false,
    mode: 'signin'
  });
  const [viewState, setViewState] = useState<ViewState>({ type: 'boards' });
  
  const { boards } = useBoards();
  const { threads } = useThreads(viewState.type === 'board' ? viewState.boardId : undefined);

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
    setViewState({ type: 'board', boardId });
  };

  const handleThreadSelect = (threadId: string) => {
    if (viewState.type === 'board') {
      setViewState({ type: 'thread', threadId, boardId: viewState.boardId });
    }
  };

  const handleBackToBoards = () => {
    setViewState({ type: 'boards' });
  };

  const handleBackToBoard = () => {
    if (viewState.type === 'thread') {
      setViewState({ type: 'board', boardId: viewState.boardId });
    }
  };

  const getCurrentBoard = () => {
    if (viewState.type === 'board' || viewState.type === 'thread') {
      return boards.find(board => board.id === viewState.boardId);
    }
    return undefined;
  };

  const getCurrentThread = () => {
    if (viewState.type === 'thread') {
      return threads.find(thread => thread.id === viewState.threadId);
    }
    return undefined;
  };

  const renderCurrentView = () => {
    switch (viewState.type) {
      case 'boards':
        return <BoardList onBoardSelect={handleBoardSelect} />;
      
      case 'board':
        const board = getCurrentBoard();
        if (!board) return <div className="text-center py-12 text-gray-500">Board not found</div>;
        return (
          <BoardView
            board={board}
            onBack={handleBackToBoards}
            onThreadSelect={handleThreadSelect}
          />
        );
      
      case 'thread':
        const thread = getCurrentThread();
        if (!thread) return <div className="text-center py-12 text-gray-500">Thread not found</div>;
        return (
          <ThreadView
            thread={thread}
            onBack={handleBackToBoard}
          />
        );
      
      default:
        return <BoardList onBoardSelect={handleBoardSelect} />;
    }
  };

  // Show loading spinner while initializing auth
  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header onAuthModal={setAuthModalState} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
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