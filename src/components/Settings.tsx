import React from 'react';
import { db } from '../services/db';
import { 
  Trash2, 
  ShieldAlert, 
  Database, 
  Info,
  Github
} from 'lucide-react';

export function Settings() {
  const handleClearDatabase = async () => {
    if (confirm('ATENÇÃO: Isso excluirá TODOS os seus jogos permanentemente. Deseja continuar?')) {
      await db.games.clear();
      alert('Banco de dados limpo com sucesso.');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as preferências do seu Hub.</p>
      </div>

      <div className="space-y-6">
        <section className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="font-bold">Zona de Perigo</h3>
          </div>
          <p className="text-sm text-muted-foreground">Ações irreversíveis relacionadas aos seus dados locais.</p>
          <button 
            onClick={handleClearDatabase}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold"
          >
            <Trash2 className="w-5 h-5" />
            Limpar Todo o Banco de Dados
          </button>
        </section>

        <section className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Armazenamento Local</h3>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Modo de Persistência</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5">IndexedDB / Dexie</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Encryption</span>
                <span className="text-green-500 text-xs font-bold uppercase">Disabled (Local Only)</span>
             </div>
          </div>
        </section>

        <section className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold">Sobre o X9 Game Hub</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              O X9 Game Hub Pro Version é um launcher de alto desempenho projetado para entusiastas de jogos HTML5 que desejam manter sua coleção offline.
            </p>
            <p>
              Utilizando as mais recentes tecnologias web como React, Service Workers e IndexedDB, garantimos uma experiência de execução rápida e segura através de sandboxing rigoroso.
            </p>
            <div className="pt-4 flex items-center gap-4">
               <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-1 rounded">Build 2026.05.18</span>
               <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-1 rounded">Engine v1.2.0</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
