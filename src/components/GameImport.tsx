import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { db } from '../services/db';
import { GameEngine, type Game } from '../types';
import { 
  Upload, 
  FileArchive, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Code2,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function GameImport() {
  const [importMode, setImportMode] = useState<'zip' | 'code'>('zip');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Code Paste State
  const [pastedName, setPastedName] = useState('');
  const [pastedCode, setPastedCode] = useState('');

  const handleImport = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setError('Por favor, selecione um arquivo .zip');
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      // Look for entry file
      let entryFile = '';
      const files = Object.keys(zipContent.files);
      
      // Heuristic for entry file
      if (files.includes('index.html')) entryFile = 'index.html';
      else {
        entryFile = files.find(f => f.endsWith('.html') && !f.includes('/')) || 
                    files.find(f => f.endsWith('.html')) || '';
      }

      if (!entryFile) {
        throw new Error('Não foi possível encontrar um arquivo de entrada HTML (index.html).');
      }

      // Detect engine and thumbnail
      let engineType = GameEngine.UNKNOWN;
      let thumbnail = '';
      
      // Try to find a thumbnail image (first image found in root or common names)
      const imageFile = files.find(f => 
        (f.toLowerCase().includes('thumb') || f.toLowerCase().includes('icon') || f.toLowerCase().includes('cover')) && 
        (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
      ) || files.find(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

      if (imageFile) {
        const imageBlob = await zipContent.files[imageFile].async('blob');
        thumbnail = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageBlob);
        });
      }

      // Read some files to detect engine
      const detectionFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.html') || f.endsWith('.json')).slice(0, 30);
      const contents = await Promise.all(detectionFiles.map(f => zipContent.files[f].async('string')));
      const contentStr = contents.join(' ').toLowerCase();

      if (contentStr.includes('phaser')) engineType = GameEngine.PHASER;
      else if (contentStr.includes('three.js') || contentStr.includes('threejs') || contentStr.includes('three.module')) engineType = GameEngine.THREEJS;
      else if (contentStr.includes('babylon')) engineType = GameEngine.BABYLON;
      else engineType = GameEngine.HTML;

      const game: Game = {
        name: file.name.replace('.zip', ''),
        version: '1.0.0',
        importDate: Date.now(),
        size: file.size,
        playCount: 0,
        thumbnail,
        zipData: file, 
        entryFile,
        engineType
      };

      await db.games.add(game);
      window.dispatchEvent(new CustomEvent('x9-log', { detail: `Novo jogo importado: ${game.name} (${game.engineType})` }));
      setSuccess(`Jogo "${game.name}" importado com sucesso!`);
    } catch (err: any) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('x9-log', { detail: `FALHA NA IMPORTAÇÃO: ${err.message}` }));
      setError(err.message || 'Erro ao processar o arquivo ZIP.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCodeImport = async () => {
    if (!pastedName.trim()) {
      setError('Por favor, informe o nome do jogo.');
      return;
    }

    if (!pastedCode.includes('<html') && !pastedCode.toLowerCase().includes('<!doctype html>')) {
      setError('O código colado não parece ser um HTML válido.');
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create a ZIP on the fly for consistency and Export support
      const zip = new JSZip();
      zip.file('index.html', pastedCode);
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const game: Game = {
        name: pastedName,
        version: '1.0.0',
        importDate: Date.now(),
        size: zipBlob.size,
        playCount: 0,
        thumbnail: '',
        zipData: zipBlob,
        entryFile: 'index.html',
        engineType: GameEngine.HTML,
        htmlCode: pastedCode
      };

      await db.games.add(game);
      window.dispatchEvent(new CustomEvent('x9-log', { detail: `Novo código HTML importado como: ${game.name}` }));
      setSuccess(`Jogo "${game.name}" criado com sucesso!`);
      setPastedName('');
      setPastedCode('');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao salvar o código HTML.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImport(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Importar Jogo</h2>
        <p className="text-muted-foreground">Adicione sua coleção de jogos ao launcher.</p>
      </div>

      <div className="flex justify-center p-1 bg-white/5 rounded-xl border border-white/10">
        <button
          onClick={() => setImportMode('zip')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
            importMode === 'zip' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
          )}
        >
          <FileArchive className="w-4 h-4" />
          Upload ZIP
        </button>
        <button
          onClick={() => setImportMode('code')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
            importMode === 'code' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
          )}
        >
          <Code2 className="w-4 h-4" />
          Colar Código HTML
        </button>
      </div>

      <AnimatePresence mode="wait">
        {importMode === 'zip' ? (
          <motion.div
            key="zip-mode"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "relative group border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center gap-4 text-center cursor-pointer",
                dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-white/10 bg-white/5 hover:border-white/20"
              )}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input 
                id="file-upload"
                type="file" 
                className="hidden" 
                accept=".zip" 
                onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
              />
              
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all",
                dragActive ? "bg-primary text-white scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)]" : "bg-black/40 text-muted-foreground group-hover:text-white"
              )}>
                {isImporting ? <Loader2 className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
              </div>

              <div className="space-y-1">
                <p className="font-bold text-lg">
                  {isImporting ? 'Processando...' : 'Clique ou arraste o arquivo'}
                </p>
                <p className="text-sm text-muted-foreground">Apenas arquivos .zip são aceitos</p>
              </div>

              {isImporting && (
                <div className="absolute inset-0 bg-[#09090b]/80 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="font-mono text-xs uppercase tracking-widest text-primary animate-pulse">Descompactando & Indexando</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="code-mode"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
          >
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-muted-foreground">Nome do Jogo</label>
              <input 
                type="text" 
                value={pastedName}
                onChange={(e) => setPastedName(e.target.value)}
                placeholder="Ex: Meu Incrível Jogo 2D"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-muted-foreground">Código HTML Completo</label>
              <textarea 
                value={pastedCode}
                onChange={(e) => setPastedCode(e.target.value)}
                placeholder="Cole aqui o <html>...</html> ou <!DOCTYPE html>..."
                className="w-full h-64 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-xs font-mono leading-relaxed focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleCodeImport}
              disabled={isImporting || !pastedName || !pastedCode}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100"
            >
              {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              SALVAR E IMPORTAR
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-lg bg-green-950/30 border border-green-500/20 text-green-400 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <FileArchive className="w-6 h-6 mx-auto mb-2 text-primary/50" />
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">ZIP Auto-Detect</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <Database className="w-6 h-6 mx-auto mb-2 text-primary/50" />
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Blob Storage</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <Loader2 className="w-6 h-6 mx-auto mb-2 text-primary/50" />
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Fast Sync</p>
        </div>
      </div>
    </div>
  );
}
