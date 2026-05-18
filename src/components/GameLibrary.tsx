import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { type Game } from '../types';
import { 
  Play, 
  Trash2, 
  Download, 
  Info,
  Calendar,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface GameLibraryProps {
  onPlay: (game: Game) => void;
}

export function GameLibrary({ onPlay }: GameLibraryProps) {
  const games = useLiveQuery(() => db.games.toArray()) ?? [];

  const [deleteMessage, setDeleteMessage] = React.useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este jogo?')) {
      try {
        await db.transaction('rw', db.games, async () => {
          await db.games.delete(id);
        });
        window.dispatchEvent(new CustomEvent('x9-log', { detail: `Jogo ID ${id} removido da biblioteca.` }));
        setDeleteMessage('Jogo removido com sucesso!');
        setTimeout(() => setDeleteMessage(null), 3000);
      } catch (error) {
        console.error('Falha ao excluir:', error);
        alert('Erro ao excluir o jogo.');
      }
    }
  };

  const handleExport = async (game: Game) => {
    const url = URL.createObjectURL(game.zipData);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.name}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Biblioteca</h2>
          <p className="text-muted-foreground">Sua coleção de jogos offline.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <AnimatePresence>
            {deleteMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg uppercase tracking-widest"
              >
                {deleteMessage}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Box className="w-3 h-3" />
            {games.length} JOGOS
          </div>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
          <p className="text-muted-foreground italic">Sua biblioteca está vazia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {games.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all flex flex-col"
              >
                <div className="aspect-video relative bg-black/40 flex items-center justify-center">
                  {game.thumbnail ? (
                    <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-primary/20 p-8 flex flex-col items-center gap-2">
                       <Play className="w-12 h-12" />
                       <span className="text-[10px] uppercase font-mono tracking-widest">{game.engineType}</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => onPlay(game)}
                      className="p-3 rounded-full bg-primary text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transform scale-90 group-hover:scale-100 transition-transform"
                    >
                      <Play className="w-6 h-6 fill-current" />
                    </button>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-2">
                     <button 
                      onClick={() => handleExport(game)}
                      className="p-1.5 rounded bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => game.id && handleDelete(game.id)}
                      className="p-1.5 rounded bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col">
                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{game.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mt-1">v{game.version}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground uppercase font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-primary/50" />
                      {new Date(game.importDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-primary/50" />
                      {formatSize(game.size)}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                     <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground">
                        {game.engineType}
                     </span>
                     <span className="text-muted-foreground">
                        {game.playCount} JOGADAS
                     </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
