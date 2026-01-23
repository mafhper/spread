import React, { useRef, useState, useEffect } from 'react';
import { useCardStore } from '../../store/cardStore';
import { PreviewCard } from './PreviewCard';
import { WelcomeCard } from './WelcomeCard';
import { HeadlessArtboard } from './HeadlessArtboard';

import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { Download, Loader2, Sparkles, Zap } from 'lucide-react';
import { useHistory } from '../../hooks/useHistory';
import { fetchMetadata } from '../../services/metadata';
import { useColorExtractor } from '../../hooks/useColorExtractor';
import { urlToBase64, getEmbeddedFontCSS } from '../../services/exportUtils';

export const PreviewSection: React.FC = () => {
    const { 
        url, colors, canvasSize, cardPosition, 
        gradientStyle, pattern, customBgImage,
        patternOpacity, patternScale,
        updateField, setFullState, updateNestedField,
        isWelcomeState, layout
    } = useCardStore();
    const currentState = useCardStore();
    const { saveToHistory, history, loadFromHistory } = useHistory();
    const { extractColorsFromImage } = useColorExtractor();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const exportOnlyRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [viewScale, setViewScale] = useState(1);
    const [autoScale, setAutoScale] = useState(1);
    const [inputUrl, setInputUrl] = useState(url);

    // Helper & Computed States
    const isAutoCanvas = canvasSize.preset === 'auto';

    console.log('[PreviewSection] Render Cycle', { isWelcomeState, isAutoCanvas, canvasSize, viewScale });

    const CANVAS_PRESETS: Record<string, { w: number, h: number }> = {
        'ig-story': { w: 1080, h: 1920 },
        'ig-post': { w: 1080, h: 1080 },
        'twitter': { w: 1200, h: 675 },
        'linkedin': { w: 1200, h: 627 },
        'auto': { w: 1080, h: 1080 } // Fallback
    };
    
    const canvasWidth = canvasSize.width > 0 ? canvasSize.width : (CANVAS_PRESETS[canvasSize.preset]?.w || 1080);
    const canvasHeight = canvasSize.height > 0 ? canvasSize.height : (CANVAS_PRESETS[canvasSize.preset]?.h || 1080);

    // Computed Background Style
    const getBackgroundStyle = () => {
        if (customBgImage) return { backgroundImage: `url('${customBgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
        
        const isValidGradient = gradientStyle?.includes('deg') || gradientStyle?.includes('circle');
        const style = isValidGradient ? gradientStyle : '135deg';

        return { 
            backgroundImage: style.includes('circle') 
                ? `radial-gradient(${style}, ${colors.bg1}, ${colors.bg2})` 
                : `linear-gradient(${style}, ${colors.bg1}, ${colors.bg2})` 
        };
    };

    const backgroundStyle = getBackgroundStyle();

    useEffect(() => {
        if (!isWelcomeState) {
            console.log('[PreviewSection] Background Style Update:', { 
                colors, 
                gradientStyle, 
                hasCustomImage: !!customBgImage 
            });
        }
    }, [colors, gradientStyle, customBgImage, isWelcomeState]);

    // Dynamic Pattern Style
    const getPatternSize = () => {
        const base = pattern === 'dots' ? 20 
                    : pattern === 'grid' ? 40 
                    : pattern === 'diagonal' ? 10 
                    : 20;
        const scale = patternScale || 1;
        return `${base * scale}px ${base * scale}px`;
    };

    const patternStyle: React.CSSProperties = {
        backgroundImage: pattern === 'dots' ? 'radial-gradient(#ffffff 1.5px, transparent 1.5px)' 
                      : pattern === 'grid' ? 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)'
                      : pattern === 'lines' ? 'repeating-linear-gradient(0deg, transparent, transparent 19px, #ffffff 20px)'
                      : pattern === 'diagonal' ? 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)'
                      : pattern === 'noise' ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                      : pattern === 'mesh' ? `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L20 10 L10 20 L0 10 Z' fill='none' stroke='white' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`
                      : 'none',
        backgroundSize: getPatternSize(),
        opacity: pattern === 'none' ? 0 : patternOpacity,
        mixBlendMode: 'overlay'
    };

    // stabilize layout before measurement
    const stabilizeLayout = async () => {
        // Prevent font loading from blocking render indefinitely (max 500ms wait)
        const fontReady = document.fonts.ready;
        const timeout = new Promise(resolve => setTimeout(resolve, 500));
        await Promise.race([fontReady, timeout]);
        
        await new Promise(r => requestAnimationFrame(r));
        await new Promise(r => setTimeout(r, 0));
    };
    
    // Resizing logic for Preview area
    useEffect(() => {
        let cancelled = false;

        const handleResize = async () => {
             if (!containerRef.current || !exportRef.current) return;
             
             await stabilizeLayout();
             if (cancelled) return;

             const padding = window.innerWidth < 640 ? 32 : 64;
             const availableWidth = containerRef.current.clientWidth - padding;
             const availableHeight = containerRef.current.clientHeight - padding;
             
             const artboard = exportRef.current;
             const contentWidth = artboard.offsetWidth;
             const contentHeight = artboard.offsetHeight;

             console.log('[Layout] Sizing Trace:', { 
                isAutoCanvas, 
                contentWidth, 
                contentHeight, 
                availableWidth,
                availableHeight
             });

             if (contentWidth <= 0 || contentHeight <= 0) return;

             // Modo Auto: Não escala o container se ele couber, apenas centraliza.
             // No entanto, ainda precisamos de um scale base para o preview caber na tela.
             // Mas para o EXPORT, o scale deve ser 1.
             const rawScale = Math.min(
                 availableWidth / Math.max(1, contentWidth),
                 availableHeight / Math.max(1, contentHeight),
                 1
             );
             
             const finalScale = Math.max(0.01, rawScale);

             if (Math.abs(viewScale - finalScale) > 0.001) {
                setViewScale(finalScale);
             }
        };

        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) observer.observe(containerRef.current);
        
        handleResize();

        return () => { 
            cancelled = true;
            observer.disconnect(); 
        };
    }, [isAutoCanvas, canvasWidth, canvasHeight, isWelcomeState, currentState.template, layout.cardScale, layout.cardAspectRatio]);


    // Auto Scale Card Logic (to fit inside canvas if needed)
    useEffect(() => {
        // 🔥 FIX SOLUÇÃO 02: Se for modo AUTO, o scale deve ser sempre 1.
        // O Canvas envolve o card naturalmente, não há necessidade de "encaixar".
        if (!cardRef.current || !exportRef.current || isWelcomeState || isAutoCanvas) {
            if (autoScale !== 1) setAutoScale(1);
            return;
        }
        
        const checkCardFit = () => {
             // Only scale if we have a fixed canvas size
             if (cardRef.current && exportRef.current && !isAutoCanvas) {
                 const card = cardRef.current;
                 const cardW = 640; // Rigid artboard width
                 const cardH = card.scrollHeight;
                 
                 const canvasW = canvasWidth;
                 const canvasH = canvasHeight;
                 
                 // Subtract padding to keep card away from edges
                 const safeW = Math.max(100, canvasW - 80); 
                 const safeH = Math.max(100, canvasH - 80);
                 
                 let s = 1;
                 if (cardW > safeW || cardH > safeH) {
                     s = Math.min(safeW / cardW, safeH / cardH);
                 }

                 const finalS = Number.isFinite(s) && s > 0 ? s : 1;
                 if (Math.abs(autoScale - finalS) > 0.001) {
                    console.log('[Layout] Adjusting autoScale:', finalS);
                    setAutoScale(finalS);
                 }
             } else {
                 if (autoScale !== 1) setAutoScale(1);
             }
        };
        
        checkCardFit();
    }, [isAutoCanvas, canvasWidth, canvasHeight, url, colors, currentState, isWelcomeState]);

    const autoExtractColors = async (imageUrl: string) => {
        try {
            console.log('[PreviewSection] autoExtractColors triggered for image');
            const extracted = await extractColorsFromImage(imageUrl);
            if (extracted) {
                console.log('[PreviewSection] Applying extracted colors to store:', extracted);
                updateNestedField('colors', 'bg1', extracted.primary);
                updateNestedField('colors', 'bg2', extracted.secondary);
                updateField('extractedColors', { bg1: extracted.primary, bg2: extracted.secondary });
            } else {
                console.warn('[PreviewSection] extractColorsFromImage returned null');
            }
        } catch (error) {
            console.error('[PreviewSection] Auto color extraction error:', error);
        }
    };

    const handleGenerate = async () => {
        if (!inputUrl) return;
        setIsLoadingMetadata(true);
        try {
            const data = await fetchMetadata(inputUrl);
            if (data) {
                const [base64Favicon, base64Image] = await Promise.all([
                    data.favicon ? urlToBase64(data.favicon) : Promise.resolve(null),
                    data.image ? urlToBase64(data.image) : Promise.resolve(null)
                ]);

                setFullState({
                    url: inputUrl,
                    title: data.title,
                    description: data.description,
                    image: base64Image || data.image,
                    favicon: base64Favicon || data.favicon,
                    domain: data.domain,
                    author: data.author || '',
                    template: data.template,
                    isWelcomeState: false, // Transition to editor view
                    isSidebarOpen: true, // Expand sidebar on success
                });
                
                if (data.image) await autoExtractColors(base64Image || data.image);
            } else {
                alert("Não foi possível carregar os dados deste link.");
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao buscar link.");
        } finally {
            setIsLoadingMetadata(false);
        }
    };

    const handleDownload = async () => {
        const target = exportOnlyRef.current || exportRef.current;
        if (!target) return;
        setIsGenerating(true);
        updateField('isExporting', true);
        
        try {
            // Give a moment for the DOM to update styles (fallback colors)
            await new Promise(r => setTimeout(r, 100));
            await document.fonts.ready;
            const fontCss = await getEmbeddedFontCSS(currentState.fontFamily);

            const options = {
                cacheBust: true,
                skipFonts: true,
                fontEmbedCSS: fontCss,
                filter: (node: HTMLElement) => {
                     if (node.tagName === 'LINK' && (node as HTMLLinkElement).href?.includes('fonts.googleapis')) return false;
                     if (node.tagName === 'IMG') {
                         const src = (node as HTMLImageElement).src;
                         if (src && src.startsWith('http') && !src.includes('localhost') && src.includes('favicon')) return false; 
                     }
                     return true;
                }
            };

            // 1. Generate High-Res for Download
            const dataUrl = await toPng(target as HTMLElement, { 
                ...options,
                pixelRatio: 2, 
            });
            
            // 2. Generate Low-Res for History (Thumbnail)
            // We use a small pixel ratio to keep base64 string small
            const thumbnailUrl = await toPng(target, {
                ...options,
                pixelRatio: 0.4
            });

            saveToHistory({ ...currentState, previewImage: thumbnailUrl });
            download(dataUrl, `spread-${Date.now()}.png`);
        } catch (e) {
            console.error('Download failed', e);
            alert('Falha ao gerar imagem.');
        } finally {
            setIsGenerating(false);
            updateField('isExporting', false);
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden relative">
            <div className="absolute inset-0 -z-10">
                   {isWelcomeState ? (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-transparent" />
                      </div>
                  ) : (
                      <>
                          <div 
                             className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-80"
                             style={backgroundStyle} 
                          />
                          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="editor-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5"/>
                                    <circle cx="0" cy="0" r="1" fill="white" opacity="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#editor-grid)" />
                          </svg>
                      </>
                  )}
            </div>
            
            <div className={`flex-shrink-0 w-full max-w-2xl mx-auto px-3 sm:px-4 z-20 transition-all duration-1000 ${isWelcomeState ? 'mt-4 sm:mt-12 py-4 sm:py-8' : 'mt-2 sm:mt-4 py-2 sm:py-3'}`}>
                <div className={`flex gap-2 sm:gap-3 rounded-2xl p-1.5 sm:p-2 border border-white/10 ring-1 ring-white/5 transition-all duration-500 ${isWelcomeState ? 'bg-black/40 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] sm:scale-110' : 'bg-black/60 backdrop-blur-xl shadow-2xl'}`}>
                    <input
                        type="url"
                        placeholder="Cole seu link aqui..."
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        className="flex-1 bg-transparent px-3 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none min-w-0"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={isLoadingMetadata}
                        className="flex-shrink-0 bg-white text-black px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-black hover:bg-gray-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50 flex items-center gap-2 group min-h-[44px]"
                    >
                        {isLoadingMetadata ? <Loader2 className="animate-spin w-5 h-5" /> : <><Zap size={18} className="fill-black group-hover:scale-125 transition-transform" /> <span className="hidden sm:inline">Gerar</span></>}
                    </button>
                </div>
            </div>

            {/* NEW RENDER/MEASURE ARCHITECTURE */}
            <div ref={containerRef} className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-4">
                <div 
                    className="relative transition-transform duration-500 ease-out origin-center flex flex-col items-center justify-center p-20"
                    style={{ 
                        transform: `scale(${viewScale})`,
                        minWidth: 'min-content'
                    }}
                >
                    {isWelcomeState ? (
                        <div ref={exportRef} className="relative w-max max-w-[90vw] mx-auto z-10 transition-all duration-700">
                            <WelcomeCard />
                        </div>
                    ) : (
                            <div 
                                key="preview-artboard"
                                ref={exportRef}
                                 className={isAutoCanvas ? "artboard-root relative overflow-visible w-fit h-fit transition-all duration-300" : "artboard-root relative overflow-visible transition-all duration-300"}
                                 style={{
                                     ...(!isAutoCanvas && {
                                         width: canvasWidth,
                                         height: canvasHeight
                                     }),
                                     ...backgroundStyle,
                                     borderRadius: `${canvasSize.roundness ?? 0}px`,
                                     minWidth: isAutoCanvas ? 'min-content' : undefined
                                 }}
                            >
                            {/* Pattern Layer */}
                            <div className="absolute inset-0 pointer-events-none mix-blend-overlay z-0" style={patternStyle} />
                            
                                 <div
                                     className={
                                         isAutoCanvas
                                             ? 'relative z-10 p-20 flex flex-col items-center justify-center overflow-visible w-full h-full'
                                             : 'relative z-10 flex items-center justify-center h-full w-full overflow-visible'
                                     }
                                 >
                                    <div 
                                        ref={cardRef}
                                        className="w-fit h-fit overflow-visible"
                                        style={{ 
                                            transform: `translate(${cardPosition.x}%, ${cardPosition.y}%) scale(${autoScale * (layout.cardScale ?? 1)})`,
                                            transformOrigin: 'center',
                                            flexShrink: 0,
                                        }} 
                                    >
                                        <PreviewCard /> 
                                    </div>
                                </div>
                        </div>
                    )}
                </div>
            </div>

            {isWelcomeState && history.length > 0 && (
                <div className="flex-shrink-0 py-6 z-20 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                     <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3 font-medium">Recentes</p>
                     <div className="flex items-center gap-3">
                        {history.slice(0, 3).map(item => (
                            <button 
                                key={item.id} 
                                onClick={() => loadFromHistory(item)} 
                                className="w-16 h-16 rounded-lg border border-white/10 hover:border-white/40 hover:scale-105 transition-all shadow-lg overflow-hidden bg-black/40 relative group"
                                title={item.title}
                            >
                                {item.previewImage 
                                    ? <img src={item.previewImage} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> 
                                    : <div className="w-full h-full flex items-center justify-center text-white/20"><Sparkles size={12}/></div>
                                }
                            </button>
                        ))}
                        <button 
                            onClick={() => updateField('isSidebarOpen', true)}
                            className="w-16 h-16 rounded-lg border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1 text-white/30 hover:text-white group"
                        >
                            <span className="text-[9px] uppercase tracking-wider group-hover:text-white/70">Histórico</span>
                        </button>
                     </div>
                </div>
            )}

            {!isWelcomeState && (
                <div className="flex-shrink-0 py-4 sm:py-6 flex justify-center z-10 mb-2 sm:mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <button 
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-sm min-h-[44px]"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        {isGenerating ? 'Gerando...' : 'Baixar Imagem'}
                    </button>
                </div>
            )}
            
            {/* Invisble Artboard for High-Fidelity Exports */}
            <HeadlessArtboard 
                ref={exportOnlyRef} 
            />
        </div>
    );
};
