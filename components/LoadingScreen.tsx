
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '../assets/icons';

const messages = [
    "Consulting local guides...",
    "Finding hidden gems...",
    "Checking for special events...",
    "Crafting your unique experience...",
    "Perfecting the schedule...",
    "Just a moment more..."
];

export const LoadingScreen: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-bkg-surface rounded-2xl shadow-2xl border border-border-base text-center">
            <SparklesIcon className="w-12 h-12 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold text-text-base mt-4">Curating Your Perfect Weekend</h2>
            <p className="text-text-muted mt-2 transition-opacity duration-500">
                {messages[messageIndex]}
            </p>
        </div>
    );
};