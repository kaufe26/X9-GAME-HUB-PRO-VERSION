import React, { useState, useEffect } from 'react';
import { type Game } from '../types';
import { 
  Maximize2, 
  RotateCcw, 
  X, 
  Loader2,
  Gamepad
} from 'lucide-react';
import { cn } from '../lib/utils';

interface GamePlayerProps {
  game: Game | null;
  onClose: () => void;
}

export function GamePlayer({ game, onClose }: GamePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (game) {
      setIsLoading(true);
      // Give SW a moment to initialize the ZIP
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [game]);

  const handleRestart = () => {
    setIframeKey(prev => prev + 1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
    window.dispatchEvent(new CustomEvent('x9-log', { detail: `Jogo "${game?.name}" reiniciado.` }));
  };

  const handleFullscreen = () => {
    const iframe = document.getElementById('game-viewport');
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
          <Gamepad className="w-10 h-10" />
        </div>
        <div>
          <h3 className="font-bold text-xl">Nenhum Jogo Selecionado</h3>
          <p className="text-muted-foreground">Vá até sua biblioteca e selecione um jogo para começar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
            {game.name[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold tracking-tight">{game.name}</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">{game.engineType} ENGINE &bull; SANDBOX READY</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRestart}
            className="p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleFullscreen}
            className="p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
            title="Tela Cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button 
            onClick={onClose}
            className="p-2 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-red-500"
            title="Fechar Jogo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {isLoading && (
          <div className="absolute inset-0 bg-black z-10 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary animate-pulse">Initializing Virtual Runner</p>
          </div>
        )}
        
        <iframe
          key={iframeKey}
          id="game-viewport"
          src={game.htmlCode ? undefined : `/game-runtime/${game.entryFile}`}
          srcDoc={game.htmlCode || undefined}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
          title={game.name}
        />
      </div>
    </div>
  );
}
