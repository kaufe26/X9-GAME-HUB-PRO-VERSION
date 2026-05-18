/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavView } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { GameImport } from './components/GameImport';
import { GameLibrary } from './components/GameLibrary';
import { GamePlayer } from './components/GamePlayer';
import { Diagnostics } from './components/Diagnostics';
import { Settings as SettingsView } from './components/Settings';
import { Export } from './components/Export';
import { Game } from './types';
import { db } from './services/db';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('SW Registered', reg))
        .catch(err => console.error('SW Registration Failed', err));
    }
  }, []);

  const handlePlayGame = async (game: Game) => {
    setActiveGame(game);
    
    // Notify SW to load this game's ZIP
    if (navigator.serviceWorker.controller && game.id) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_ACTIVE_GAME',
        gameId: game.id
      });
      
      // Update play count
      await db.games.update(game.id, { playCount: (game.playCount || 0) + 1 });
      window.dispatchEvent(new CustomEvent('x9-log', { detail: `Sessão iniciada: ${game.name}` }));
    }
    
    setCurrentView('player');
  };

  const handleCloseGame = () => {
    window.dispatchEvent(new CustomEvent('x9-log', { detail: `Sessão encerrada: ${activeGame?.name}` }));
    setCurrentView('library');
    setActiveGame(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'import': return <GameImport />;
      case 'library': return <GameLibrary onPlay={handlePlayGame} />;
      case 'player': return <GamePlayer game={activeGame} onClose={handleCloseGame} />;
      case 'diagnostics': return <Diagnostics />;
      case 'settings': return <SettingsView />;
      case 'export': return <Export />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="max-w-7xl mx-auto p-8 min-h-full flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
          
          <footer className="mt-auto pt-12 pb-6 text-center text-[10px] text-muted-foreground uppercase font-mono tracking-[0.2em]">
            &copy; 2026 X9 GAME HUB PRO &bull; LOCAL DATABASE ENCRYPTED &bull; SANDBOX ACTIVE
          </footer>
        </div>
      </main>
    </div>
  );
}
