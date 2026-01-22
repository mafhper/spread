import React, { useState } from 'react';
import { ColorTabs } from './tabs/ColorTabs';
import { TypographyTabs } from './tabs/TypographyTabs';
import { CanvasControls } from './tabs/CanvasControls';
import { BackgroundTabs } from './tabs/BackgroundTabs';
import { Palette, Type, Maximize, Image as ImageIcon, X } from 'lucide-react';
import { clsx } from 'clsx';

type TabType = 'colors' | 'typography' | 'canvas' | 'background' | null;

const TABS = [
    { id: 'colors' as const, label: 'Cores', icon: Palette },
    { id: 'typography' as const, label: 'Texto', icon: Type },
    { id: 'canvas' as const, label: 'Canvas', icon: Maximize },
    { id: 'background' as const, label: 'Fundo', icon: ImageIcon },
];

export const ControlDock: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleTab = (tab: TabType) => {
        if (activeTab === tab && isExpanded) {
            setIsExpanded(false);
        } else {
            setActiveTab(tab);
            setIsExpanded(true);
        }
    };

    const closePanel = () => setIsExpanded(false);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'colors': return <ColorTabs />;
            case 'typography': return <TypographyTabs />;
            case 'canvas': return <CanvasControls />;
            case 'background': return <BackgroundTabs />;
            default: return null;
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
            <div className="max-w-xl mx-auto px-4 pb-4 pointer-events-auto">
                {/* Expanded Panel */}
                <div className={clsx(
                    "bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden transition-all duration-300 mb-3",
                    isExpanded ? "opacity-100 max-h-[60vh] translate-y-0" : "opacity-0 max-h-0 translate-y-4 pointer-events-none"
                )}>
                    {/* Panel Header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            {activeTab && TABS.find(t => t.id === activeTab)?.icon && 
                                React.createElement(TABS.find(t => t.id === activeTab)!.icon, { size: 16 })}
                            {TABS.find(t => t.id === activeTab)?.label}
                        </h3>
                        <button 
                            onClick={closePanel}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    
                    {/* Panel Content */}
                    <div className="p-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>

                {/* Dock Bar */}
                <div className="flex items-center justify-center gap-1.5 p-2 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id && isExpanded;
                        return (
                            <button 
                                key={tab.id}
                                onClick={() => toggleTab(tab.id)}
                                className={clsx(
                                    "relative group flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-200",
                                    isActive 
                                        ? "bg-white text-black scale-105 shadow-lg shadow-white/20" 
                                        : "text-white/50 hover:bg-white/10 hover:text-white"
                                )}
                                title={tab.label}
                            >
                                <Icon size={22} />
                                
                                {/* Tooltip */}
                                <span className="absolute -top-10 bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                                    {tab.label}
                                </span>
                                
                                {/* Active Indicator */}
                                {isActive && (
                                    <span className="absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
