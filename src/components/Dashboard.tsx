import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { 
  Trophy, 
  Clock, 
  BarChart3, 
  Database, 
  Zap 
} from 'lucide-react';
import { motion } from 'motion/react';

export function Dashboard() {
  const gamesCount = useLiveQuery(() => db.games.count()) ?? 0;
  const lastGame = useLiveQuery(() => db.games.orderBy('importDate').last());
  const totalSize = useLiveQuery(async () => {
    const games = await db.games.toArray();
    return games.reduce((acc, g) => acc + g.size, 0);
  }) ?? 0;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = [
    { label: 'Total de Jogos', value: gamesCount.toString(), icon: Trophy, color: 'text-yellow-500' },
    { label: 'Espaço Usado', value: formatSize(totalSize), icon: Database, color: 'text-blue-500' },
    { label: 'Sessões Ativas', value: '1', icon: BarChart3, color: 'text-green-500' },
    { label: 'Status do Sistema', value: 'Online', icon: Zap, color: 'text-primary' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Bem-vindo ao centro de comando X9.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-black/20 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Última Atividade</h3>
          </div>
          
          {lastGame ? (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-black/20 border border-white/5">
              <div className="w-16 h-16 rounded bg-primary/20 flex items-center justify-center font-bold text-primary">
                {lastGame.name[0].toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold truncate">{lastGame.name}</h4>
                <p className="text-xs text-muted-foreground">Importado em: {new Date(lastGame.importDate).toLocaleString()}</p>
                <div className="mt-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 inline-block border border-white/10">
                  {lastGame.engineType}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground italic border border-dashed border-white/10 rounded-lg">
              Nenhum jogo importado ainda.
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Integridade</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Database Sync</span>
                <span className="text-green-500">Pronto</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Sandboxing</span>
                <span className="text-green-500">Ativado</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-full" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
