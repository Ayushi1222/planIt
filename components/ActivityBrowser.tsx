import React, { useState } from 'react';
import type { ManualActivity, ActivityCategory, BrowserActivity } from '../shared/types';
import { DiningIcon, OutdoorsIcon, RelaxingIcon, EntertainmentIcon, FamilyIcon, CultureIcon, SparklesIcon } from '../assets/icons';
import { generateIdeas } from '../services/geminiService';

const activities: BrowserActivity[] = [
    { title: 'Brunch', category: 'Dining', notes: 'Pancakes, mimosas, and good company.' },
    { title: 'Go for a Hike', category: 'Outdoors', notes: 'Find a scenic trail and enjoy nature.' },
    { title: 'Movie Night', category: 'Entertainment', notes: 'Popcorn, cozy blankets, and a blockbuster.' },
    { title: 'Read a Book', category: 'Relaxing', notes: 'Get lost in a good story at a cafe or park.' },
    { title: 'Visit a Museum', category: 'Culture', notes: 'Explore art, history, or science.' },
    { title: 'Park Picnic', category: 'Family', notes: 'Pack a basket and enjoy the sunshine.' },
];

const categoryConfig: { [key in ActivityCategory]: { icon: React.FC<any>, color: string } } = {
    Dining: { icon: DiningIcon, color: 'bg-orange-500/20 text-orange-400' },
    Outdoors: { icon: OutdoorsIcon, color: 'bg-green-500/20 text-green-400' },
    Relaxing: { icon: RelaxingIcon, color: 'bg-purple-500/20 text-purple-400' },
    Entertainment: { icon: EntertainmentIcon, color: 'bg-pink-500/20 text-pink-400' },
    Family: { icon: FamilyIcon, color: 'bg-blue-500/20 text-blue-400' },
    Culture: { icon: CultureIcon, color: 'bg-yellow-500/20 text-yellow-400' },
};

const DraggableActivity: React.FC<{ activity: BrowserActivity }> = ({ activity }) => {
    const config = categoryConfig[activity.category] || categoryConfig.Entertainment;
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('application/json', JSON.stringify(activity));
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="flex items-center gap-3 p-3 bg-bkg-surface border border-border-base rounded-lg cursor-grab active:cursor-grabbing hover:bg-bkg-muted transition-colors"
        >
            <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${config.color}`}>
                <config.icon className="w-5 h-5" />
            </div>
            <div>
                <p className="font-semibold text-text-base">{activity.title}</p>
                <p className="text-xs text-text-muted">{activity.notes}</p>
            </div>
        </div>
    );
};

interface ActivityBrowserProps {
    aiIdeas: BrowserActivity[];
    setAiIdeas: (ideas: BrowserActivity[]) => void;
}


export const ActivityBrowser: React.FC<ActivityBrowserProps> = ({ aiIdeas, setAiIdeas }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateIdeas = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError('');
        setAiIdeas([]);

        setTimeout(async () => {
            try {
                const ideas = await generateIdeas(prompt);
                setAiIdeas(ideas);
            } catch (err) {
                setError('Could not generate ideas. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }, 50);
    };

    return (
        <aside className="lg:col-span-3 bg-bkg-surface/50 rounded-2xl p-4 flex flex-col h-full">
            <div className="px-2 pb-4 border-b border-border-base mb-4">
                <h2 className="text-xl font-bold text-text-base mb-3">Activity Palette</h2>
                <form onSubmit={handleGenerateIdeas} className="space-y-2">
                    <input 
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'relaxing indoor activities'"
                        className="w-full bg-bkg-surface border border-border-base rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                     <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-bkg-surface border border-border-base hover:bg-bkg-muted transition-colors disabled:opacity-50">
                        <SparklesIcon className="w-4 h-4 text-primary" />
                        <span>{isLoading ? 'Generating...' : 'Generate Ideas'}</span>
                    </button>
                    {error && <p className="text-xs text-red-400 text-center mt-2">{error}</p>}
                </form>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 pr-2 min-h-0">
                
                {aiIdeas.length > 0 && (
                    <>
                        {aiIdeas.map((activity, index) => (
                            <DraggableActivity key={`ai-${index}`} activity={activity} />
                        ))}
                        <div className="py-2 px-2">
                            <hr className="border-t border-border-base" />
                        </div>
                    </>
                )}

                {activities.map((activity, index) => (
                    <DraggableActivity key={index} activity={activity} />
                ))}
            </div>
        </aside>
    );
};