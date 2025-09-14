import React, { useState } from 'react';
import type { SavedPlan, DayPlan, Activity } from '../shared/types';
import { continueItineraryChat, initializeChatFromPlan } from '../services/geminiService';
import {
    ActivityIcon, ArtIcon, CultureIcon, DiningIcon, EntertainmentIcon, HeritageIcon,
    LiveMusicIcon, NatureIcon, NightlifeIcon, OutdoorsIcon, RelaxingIcon,
    ShoppingIcon, SpecialEventIcon, TravelIcon, ArrowRightIcon, SparklesIcon,
    InfoIcon, MapPinIcon, PriceIcon, TimeIcon, TransportIcon, BookmarkIcon, ArrowLeftIcon
} from '../assets/icons';

interface ItineraryDisplayProps {
    initialPlan: SavedPlan;
    setPlan: (plan: SavedPlan) => void;
    onReset: () => void;
    onSavePlan: (plan: SavedPlan) => void;
}

const categoryIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    'Dining': DiningIcon,
    'Entertainment': EntertainmentIcon,
    'Relaxation': RelaxingIcon,
    'Activity': ActivityIcon,
    'Nightlife': NightlifeIcon,
    'Shopping': ShoppingIcon,
    'Culture': CultureIcon,
    'History & Heritage': HeritageIcon,
    'Nature & Parks': NatureIcon,
    'Special Event': SpecialEventIcon,
    'Outdoor Activities': OutdoorsIcon,
    'Travel': TravelIcon,
    'Art & Culture': ArtIcon,
    'Live Music': LiveMusicIcon
};

const ActivityCard: React.FC<{ activity: Activity, isFirst: boolean }> = ({ activity, isFirst }) => {
    const Icon = categoryIcons[activity.category] || ActivityIcon;
    return (
        <div className="pl-8 relative">
            {!isFirst && <div className="absolute left-3 top-0 h-full w-0.5 bg-border-base"></div>}
            <div className="absolute left-0 top-1.5 transform -translate-x-1/2">
                <div className="w-7 h-7 bg-bkg-muted rounded-full flex items-center justify-center ring-4 ring-bkg-surface">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
            </div>
            <div className="bg-bkg-surface p-4 rounded-lg border border-border-base mb-6">
                 <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-text-base">{activity.title}</h4>
                    {activity.isSpecialEvent && <span className="text-xs font-bold bg-accent/20 text-accent px-2 py-1 rounded-full">Special Event</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted mb-3">
                    <div className="flex items-center gap-1.5"><TimeIcon className="w-3.5 h-3.5"/><span>{activity.time}</span></div>
                    <div className="flex items-center gap-1.5"><PriceIcon className="w-3.5 h-3.5"/><span>{activity.estimatedCost}</span></div>
                </div>
                <p className="text-text-muted mb-4 text-sm">{activity.description}</p>
                 <div className="space-y-3 text-xs border-t border-border-base pt-3">
                    <div className="flex items-start gap-2 text-text-muted">
                        <MapPinIcon className="w-3.5 h-3.5 mt-0.5 shrink-0"/>
                        <div>
                            <span className="font-semibold text-text-muted">{activity.location.name || 'Location'}: </span>
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location.address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline decoration-dotted">
                                {activity.location.address}
                            </a>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 text-text-muted">
                        <TransportIcon className="w-3.5 h-3.5 mt-0.5 shrink-0"/>
                        <div>
                             <span className="font-semibold text-text-muted">Travel: </span>
                             {activity.travelInfo.mode} ({activity.travelInfo.duration})
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const DayTimeline: React.FC<{ dayPlan: DayPlan }> = ({ dayPlan }) => (
    <div>
        <div className="mb-4">
            <h3 className="text-2xl font-bold text-primary">{dayPlan.day.split(',')[0]}</h3>
            <p className="text-text-muted">{dayPlan.day.split(',').slice(1).join(', ')}</p>
            <p className="italic text-text-muted mt-1">"{dayPlan.theme}"</p>
        </div>
        <div>
            {dayPlan.activities.map((activity, index) => (
                <ActivityCard key={index} activity={activity} isFirst={index === 0} />
            ))}
        </div>
    </div>
);


export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ initialPlan, setPlan, onReset, onSavePlan }) => {
    const [plan, setInternalPlan] = useState(initialPlan);
    const [userInput, setUserInput] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleModification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isUpdating) return;

        setIsUpdating(true);
        setError(null);
        try {
            const chat = initializeChatFromPlan(plan);
            const { updatedItinerary, updatedHistory } = await continueItineraryChat(chat, userInput, plan.preferences);
            const newPlan = { ...updatedItinerary, chatHistory: updatedHistory };
            setInternalPlan(newPlan);
            setPlan(newPlan);
        } catch (e: any) {
            setError(e.message || 'Failed to update the plan. Please try a different request.');
        } finally {
            setIsUpdating(false);
            setUserInput('');
        }
    };

    const handleSave = () => {
        onSavePlan(plan);
    };

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center">
                <button
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 text-text-muted font-semibold py-2 px-4 rounded-lg hover:bg-bkg-muted transition-colors"
                    aria-label="Back to planner"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to Planner</span>
                </button>
                <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all"
                >
                    <BookmarkIcon className="w-4 h-4" />
                    Save to My Plans
                </button>
            </div>

            <div className="bg-bkg-surface p-6 md:p-8 rounded-2xl shadow-2xl border border-border-base">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-text-base">{plan.title}</h2>
                    <p className="text-lg text-text-muted mt-2">
                        Total Estimated Cost: <span className="font-bold text-primary">{plan.totalEstimatedCost}</span>
                    </p>
                </div>

                <div className="space-y-12">
                    {plan.itinerary.map((dayPlan, index) => (
                        <DayTimeline key={index} dayPlan={dayPlan} />
                    ))}
                </div>
            </div>

            <div className="bg-bkg-surface p-6 rounded-2xl border border-border-base">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><SparklesIcon/> Modify Your Plan</h3>
                <p className="text-sm text-text-muted mb-4">Want to change something? Just ask! For example: "Swap the museum on Saturday for a park" or "Find a cheaper dinner option for Friday".</p>
                <form onSubmit={handleModification}>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Tell the AI what to change..."
                            className="flex-grow bg-bkg-muted border border-border-base rounded-lg px-3 py-2 text-sm text-text-base focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                            disabled={isUpdating}
                        />
                        <button
                            type="submit"
                            disabled={isUpdating || !userInput.trim()}
                            className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-bkg-muted disabled:text-text-subtle disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Updating...' : 'Update'}
                            {!isUpdating && <ArrowRightIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
                {error && <p className="text-sm text-red-400 mt-2 text-center">{error}</p>}
            </div>

            {plan.sources && plan.sources.length > 0 && (
                <div className="bg-bkg-surface p-6 rounded-2xl border border-border-base">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><InfoIcon/> Plan Sources</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {plan.sources.map((source, index) => (
                            <li key={index}>
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {source.title || new URL(source.uri).hostname}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};