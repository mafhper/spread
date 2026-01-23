/**
 * Landing Page - Main container for welcome state sections
 * 
 * Renders a full promotional landing page when user is in welcome state.
 * Includes Hero, Features, Tech Stack, GitHub Activity, About, and Footer.
 */

import React from 'react';
import { HeroSection } from './HeroSection';
import { FeatureGrid } from './FeatureGrid';
import { TechStackSection } from './TechStackSection';
import { GitHubActivity } from './GitHubActivity';
import { AboutAuthor } from './AboutAuthor';
import { FooterSection } from './FooterSection';

interface LandingPageProps {
    inputUrl: string;
    setInputUrl: (url: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
    inputUrl,
    setInputUrl,
    onGenerate,
    isLoading
}) => {
    return (
        <div className="w-full">
            {/* Hero Section with URL Input */}
            <HeroSection 
                inputUrl={inputUrl}
                setInputUrl={setInputUrl}
                onGenerate={onGenerate}
                isLoading={isLoading}
            />

            {/* Feature Grid */}
            <FeatureGrid />

            {/* Tech Stack */}
            <TechStackSection />

            {/* GitHub Activity */}
            <GitHubActivity />

            {/* About Author */}
            <AboutAuthor />

            {/* Footer */}
            <div className="snap-start">
                <FooterSection />
            </div>
        </div>
    );
};
