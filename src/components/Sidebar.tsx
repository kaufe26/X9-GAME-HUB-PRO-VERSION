import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Library, 
  Gamepad2, 
  Download, 
  Settings, 
  Activity,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export type NavView = 'dashboard' | 'import' | 'library' | 'player' | 'export' | 'settings' | 'diagnostics';

interface SidebarProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'import', label: 'Importar Jogo', icon: PlusCircle },
  { id: 'library', label: 'Biblioteca', icon: Library },
  { id: 'player', label: 'Player', icon: Gamepad2 },
  { id: 'export', label: 'Exportar', icon: Download },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'diagnostics', label: 'Diagnóstico', icon: Activity },
] as const;

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-[#0c0c0e] border-r border-white/5 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          X9
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight">GAME HUB</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">PRO VERSION</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as NavView)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all group",
              currentView === item.id 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("w-5 h-5", currentView === item.id ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {currentView === item.id && <ChevronRight className="w-4 h-4" />}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/10">
          <p className="text-xs font-semibold text-primary mb-1">Local Mode</p>
          <p className="text-[10px] text-muted-foreground">IndexedDB Connected</p>
        </div>
      </div>
    </div>
  );
}
