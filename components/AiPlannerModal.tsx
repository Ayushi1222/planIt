import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { Preferences, Itinerary } from '../shared/types';
import { generateItinerary } from '../services/geminiService';
import { PreferenceForm } from './PreferenceForm';
import { LoadingScreen } from './LoadingScreen';
import { CloseIcon } from '../assets/icons';

interface AiPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerated: (plan: Itinerary) => void;
}

export const AiPlannerModal: React.FC<AiPlannerModalProps> = ({ isOpen, onClose, onGenerated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreatePlan = async (preferences: Preferences) => {
        setIsLoading(true);
        setError(null);
        try {
            const itinerary = await generateItinerary(preferences);
            onGenerated(itinerary);
        } catch (e: any) {
            console.error("Failed to create plan:", e);
            setError(e.message || 'An unknown error occurred while creating your weekend plan. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setError(null);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-bkg-surface rounded-2xl shadow-2xl w-full max-w-4xl border border-border-base max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-border-base flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold">Create Itinerary with AI</h2>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-bkg-muted">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 md:p-8 overflow-y-auto">
                    {isLoading ? (
                        <LoadingScreen />
                    ) : error ? (
                         <div className="text-center p-8 bg-bkg-base rounded-lg">
                            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
                            <p className="text-text-muted mb-6">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <PreferenceForm onSubmit={handleCreatePlan} />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
