/**
 * Footer Section - Site footer with links and credits
 */

import React from 'react';
import { Heart } from 'lucide-react';

export const FooterSection: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
                {/* Logo and tagline */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center">
                            <img src="/spread/logo.svg" alt="" className="w-6 h-6 opacity-90 invert brightness-0" />
                        </div>
                        <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            Spread
                        </span>
                    </div>
                    <p className="text-white/40 text-sm">
                        Visualizações elegantes de links
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                    <a 
                        href="https://github.com/mafhper/spread"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                        GitHub
                    </a>
                    <a 
                        href="https://github.com/mafhper/spread/blob/main/LICENSE"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                        Licença MIT
                    </a>
                    <a 
                        href="https://github.com/mafhper/spread/blob/main/CONTRIBUTING.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                        Contribuir
                    </a>
                </div>

                {/* Credit */}
                <div className="text-center text-white/30 text-sm">
                    <p className="flex items-center justify-center gap-1.5">
                        Feito com <Heart size={14} className="text-red-400 fill-red-400" /> por 
                        <a 
                            href="https://github.com/mafhper"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/50 hover:text-white transition-colors font-medium"
                        >
                            mafhper
                        </a>
                    </p>
                    <p className="mt-2">
                        © {currentYear} Spread. Código aberto sob licença MIT.
                    </p>
                </div>
            </div>
        </footer>
    );
};
