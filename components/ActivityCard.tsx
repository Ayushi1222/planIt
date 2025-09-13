import React from 'react';
import type { ManualActivity, ActivityCategory } from '../shared/types';
import { TimeIcon, NotesIcon, EditIcon, TrashIcon, SpecialEventIcon } from '../assets/icons';

interface ActivityCardProps {
    activity: ManualActivity;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onEdit: () => void;
    onDelete: () => void;
}

const categoryConfig: { [key in ActivityCategory]: { color: string, border: string } } = {
    Dining: { color: 'bg-orange-500/20 text-orange-400', border: 'border-orange-500/50' },
    Outdoors: { color: 'bg-green-500/20 text-green-400', border: 'border-green-500/50' },
    Relaxing: { color: 'bg-purple-500/20 text-purple-400', border: 'border-purple-500/50' },
    Entertainment: { color: 'bg-pink-500/20 text-pink-400', border: 'border-pink-500/50' },
    Family: { color: 'bg-blue-500/20 text-blue-400', border: 'border-blue-500/50' },
    Culture: { color: 'bg-yellow-500/20 text-yellow-400', border: 'border-yellow-500/50' },
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onDragStart, onEdit, onDelete }) => {
    const config = categoryConfig[activity.category] || categoryConfig.Entertainment;

    return (
        <div
            draggable
            onDragStart={onDragStart}
            data-activity-id={activity.id}
            className={`group bg-bkg-surface p-3 rounded-lg border-l-4 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-primary/80 transition-all ${config.border}`}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                    <SpecialEventIcon className="w-5 h-5 mt-0.5 text-text-muted" />
                    <p className="font-bold text-text-base">{activity.title}</p>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={onEdit} className="p-1 text-text-muted hover:text-primary rounded-full"><EditIcon className="w-4 h-4" /></button>
                     <button onClick={onDelete} className="p-1 text-text-muted hover:text-red-400 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
             <div className="pl-8 pt-2 space-y-1 text-sm">
                {activity.notes && (
                    <p className="flex items-start gap-1.5 text-text-muted">
                        {activity.notes}
                    </p>
                )}
                {activity.time && (
                    <p className="flex items-center gap-1.5 text-orange-500 font-bold">
                        <TimeIcon className="w-3 h-3" /> {activity.time}
                    </p>
                )}
                {!activity.time && (
                    <button
                        type="button"
                        className="flex items-center gap-1.5 text-text-subtle italic hover:text-primary focus:outline-none"
                        onClick={onEdit}
                    >
                        <EditIcon className="w-3 h-3" />
                        <span>Edit to add time</span>
                    </button>
                )}
            </div>
        </div>
    );
};