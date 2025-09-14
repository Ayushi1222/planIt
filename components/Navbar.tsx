import React from 'react';
import type { Theme } from '../App';
import { themes } from '../App';
import { LogoIcon, SparklesIcon, PlansIcon, ShareIcon, AddIcon } from '../assets/icons';

interface NavbarProps {
    onOpenAiModal: () => void;
    onOpenPlansModal: () => void;
    onOpenShareModal: () => void;
    onOpenNewPlanModal: () => void;
    activeTheme: Theme;
    onSetTheme: (theme: Theme) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
    onOpenAiModal, 
    onOpenPlansModal, 
    onOpenShareModal, 
    onOpenNewPlanModal,
    activeTheme, 
    onSetTheme 
}) => {
    return (
        <header className="flex justify-between items-center p-4 border-b border-border-base bg-bkg-base/80 backdrop-blur-sm shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <LogoIcon className="w-8 h-8 text-primary" />
                <button
                    type="button"
                    onClick={() => window.location.href = '/'}
                    className="text-4xl font-bold tracking-tight hidden sm:block bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none"
                    style={{ background: 'none' }}
                    aria-label="Go to home page"
                >
                    planIt
                </button>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={onOpenNewPlanModal}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-bkg-surface border border-border-base hover:bg-bkg-muted transition-colors"
                    title="New Plan"
                >
                    <AddIcon className="w-4 h-4" />
                    <span className="hidden md:inline">New Plan</span>
                </button>
                <button
                    onClick={onOpenPlansModal}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-bkg-surface border border-border-base hover:bg-bkg-muted transition-colors"
                    title="My Plans"
                >
                    <PlansIcon className="w-4 h-4" />
                    <span className="hidden md:inline">My Plans</span>
                </button>
                <button
                    onClick={onOpenShareModal}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-bkg-surface border border-border-base hover:bg-bkg-muted transition-colors"
                    title="Share"
                >
                    <ShareIcon className="w-4 h-4" />
                    <span className="hidden md:inline">Share</span>
                </button>

                <div className="h-6 w-px bg-border-base mx-2"></div>

                <div className="flex items-center gap-2">
                    {themes.map(t => (
                        <button
                            key={t.name}
                            onClick={() => onSetTheme(t.class as Theme)}
                            className={`w-5 h-5 rounded-full ${t.color} border-2 transition-all ${activeTheme === t.class ? 'border-text-base' : 'border-transparent hover:scale-110'}`}
                            aria-label={`Switch to ${t.name} theme`}
                            title={t.name}
                        />
                    ))}
                </div>
                <button 
                    onClick={onOpenAiModal} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-primary text-white hover:opacity-90 transition-opacity transform hover:scale-105"
                >
                    <SparklesIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Create with AI</span>
                </button>
            </div>
        </header>
    );
};