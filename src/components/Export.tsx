import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { 
  Download, 
  FileArchive, 
  Share2,
  HardDriveDownload
} from 'lucide-react';
import { motion } from 'motion/react';

export function Export() {
  const games = useLiveQuery(() => db.games.toArray()) ?? [];

  const handleExport = async (game: any) => {
    const url = URL.createObjectURL(game.zipData);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.name}_backup.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Exportar Dados</h2>
        <p className="text-muted-foreground">Exporte seus jogos para backup ou transferência.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <HardDriveDownload className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-bold">Transferência de Coleção</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os seus jogos são armazenadoslocalmente neste navegador. Para usá-los em outro dispositivo ou navegador, você deve exportar cada arquivo individualmente.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {games.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground italic border border-dashed border-white/10 rounded-xl">
             Nenhum jogo para exportar.
          </div>
        ) : (
          games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-black/40 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <FileArchive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">{game.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono">{game.engineType} &bull; {(game.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport(game)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold"
                >
                  <Download className="w-4 h-4" />
                  EXPORTAR ZIP
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
