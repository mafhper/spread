import React, { useState } from 'react';
import { Sidebar } from './toolbar/Sidebar';
import { PreviewSection } from './preview/PreviewSection';
import { HistoryPanel } from './history/HistoryPanel';
import { History } from 'lucide-react';
import { useCardStore } from '../store/cardStore';

export const SpreadEditor: React.FC = () => {
    const [showHistory, setShowHistory] = useState(false);
    const { isWelcomeState: isWelcome } = useCardStore();

    return (
        <div className="h-screen w-full flex bg-black text-[var(--text-main)] overflow-hidden">
             {/* Left Sidebar - Only show when NOT in welcome state */}
             {/* Left Sidebar - Only show when NOT in welcome state */}
             {!isWelcome && <div className="z-30 h-full"><Sidebar /></div>}

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-700 ${isWelcome ? 'z-20' : 'z-10'}`}>
                {/* Background (Fixed to back) */}
                <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
                    {/* Animated Blobs - Visible only in Welcome State */}
                    {isWelcome && (
                        <>
                            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-violet-600/20 rounded-full blur-[130px] animate-blob-slow" />
                            <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-fuchsia-600/20 rounded-full blur-[130px] animate-blob-slow animation-delay-2000" />
                            <div className="absolute top-[30%] right-[20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[110px] animate-blob-slow animation-delay-4000" />
                        </>
                    )}
                    
                    {/* Grid Overlay - Transitions opacity */}
                    <svg className={`absolute inset-0 w-full h-full transition-opacity duration-1000 mix-blend-overlay ${isWelcome ? 'opacity-[0.15]' : 'opacity-0'}`} xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="welcome-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#welcome-grid)" />
                    </svg>
                </div>

                {/* Header / Top Bar */}
                <header className={`flex-shrink-0 p-6 flex justify-between items-center z-20 transition-all duration-700 ${isWelcome ? 'max-w-7xl mx-auto w-full' : ''}`}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className={`flex items-center gap-3 p-2 pl-3 pr-5 rounded-full border transition-all duration-500 hover:scale-105 active:scale-95 ${isWelcome ? 'bg-white/10 backdrop-blur-2xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/10' : 'bg-[var(--bg-card)]/80 backdrop-blur-md border-[var(--border-color)] shadow-lg'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 via-violet-500 to-pink-500 flex items-center justify-center p-1.5 shadow-xl">
                                <img src="/spread/logo.svg" alt="" className="w-full h-full opacity-95 invert brightness-0" />
                            </div>
                            <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Spread</span>
                        </button>

                        <a 
                            href="https://github.com/mafhper/spread" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`p-3 rounded-full border transition-all duration-500 ${isWelcome ? 'bg-white/10 backdrop-blur-2xl border-white/20 hover:bg-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/10' : 'bg-[var(--bg-card)]/80 backdrop-blur-md border-[var(--border-color)] shadow-lg hover:bg-[var(--bg-input)]'} text-[var(--text-muted)] hover:text-white`}
                            title="Ver no GitHub"
                        >
                            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                            </svg>
                        </a>
                    </div>

                    <button 
                        onClick={() => setShowHistory(true)}
                        className={`p-3 rounded-full border transition-all duration-500 ${isWelcome ? 'bg-white/10 backdrop-blur-2xl border-white/20 hover:bg-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/10' : 'bg-[var(--bg-card)]/80 backdrop-blur-md border-[var(--border-color)] shadow-lg hover:bg-[var(--bg-input)]'} text-[var(--text-muted)] hover:text-white flex items-center gap-2 group`}
                        title="Histórico"
                    >
                        <History size={20} className="group-hover:rotate-[-20deg] transition-transform" />
                        {isWelcome && <span className="text-xs font-bold uppercase tracking-widest pr-2 hidden sm:inline">Histórico</span>}
                    </button>

                </header>

                {/* History Panel (Overlay) */}
                {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
                
                {/* Main Preview Area - fills remaining space, no scroll */}
                <main className="flex-1 min-h-0 overflow-hidden">
                    <PreviewSection />
                </main>
            </div>
        </div>
    );
};
