import React from 'react';
import { BackgroundTabs } from './BackgroundTabs';
import { PhotoTabs } from './PhotoTabs';

export const MediaTabs: React.FC = () => {
    return (
        <div className="space-y-8">
            <section>
                 <h3 className="text-sm font-semibold text-white mb-4">Fundo</h3>
                 <BackgroundTabs />
            </section>
            
            <div className="w-full h-px bg-white/10" />

            <section>
                 <PhotoTabs />
            </section>
        </div>
    );
};
