import React, { useState, useRef, useEffect } from 'react';
import type { Plan, ManualActivity, Day } from '../shared/types';
import { ActivityCard } from './ActivityCard';
import { TrashIcon, AddIcon, EditIcon } from '../assets/icons';

interface WeekendScheduleProps {
    plan: Plan;
    onDrop: (dayId: string, index: number, activityData: Omit<ManualActivity, 'id'>) => void;
    onMoveActivity: (activity: ManualActivity, fromDayId: string, toDayId: string, toIndex: number) => void;
    onEdit: (dayId: string, activity: ManualActivity) => void;
    onDelete: (dayId: string, activityId: string) => void;
    onClearDay: (dayId: string) => void;
    onAddDay: () => void;
    onDateChange: (dayId: string, newDate: string) => void;
    onAddActivity: (dayId: string) => void;
    onDeleteDay: (dayId: string) => void;
    onDayNameChange: (dayId: string, newName: string) => void;
}

const DayColumn: React.FC<{
    day: Day;
    onDrop: (dayId: string, index: number, activityData: Omit<ManualActivity, 'id'>) => void;
    onMoveActivity: (activity: ManualActivity, fromDayId: string, toDayId: string, toIndex: number) => void;
    onEdit: (activity: ManualActivity) => void;
    onDelete: (activityId: string) => void;
    onClearDay: () => void;
    onDateChange: (newDate: string) => void;
    onAddActivity: () => void;
    onDeleteDay: () => void;
    onDayNameChange: (newName: string) => void;
    isLastDay: boolean;
}> = ({ day, onDrop, onMoveActivity, onEdit, onDelete, onClearDay, onDateChange, onAddActivity, onDeleteDay, onDayNameChange, isLastDay }) => {
    const [isOver, setIsOver] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(day.name);
    const nameInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    useEffect(() => {
        if (!isEditingName) {
            setNameInput(day.name);
        }
    }, [day.name, isEditingName]);


    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };
    
    const handleDragLeave = () => setIsOver(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        
        const internalMoveData = e.dataTransfer.getData('internal-move');
        if (internalMoveData) {
            const { activity, fromDayId } = JSON.parse(internalMoveData);
            const newIndex = getDropIndex(e, day.activities.length);
            onMoveActivity(activity, fromDayId, day.id, newIndex);
        } else {
            const activityData = JSON.parse(e.dataTransfer.getData('application/json'));
            const newIndex = getDropIndex(e, day.activities.length);
            onDrop(day.id, newIndex, activityData);
        }
    };

    const getDropIndex = (e: React.DragEvent<HTMLDivElement>, defaultIndex: number): number => {
        const dropTarget = e.currentTarget.querySelector('[data-role="activity-list"]');
        if (!dropTarget) return defaultIndex;
        
        const rect = dropTarget.getBoundingClientRect();
        const dropY = e.clientY - rect.top;
        const cardElements = Array.from(dropTarget.querySelectorAll('[data-activity-id]'));

        let newIndex = defaultIndex;
        for (let i = 0; i < cardElements.length; i++) {
            const card = cardElements[i] as HTMLElement;
            if (dropY < card.offsetTop + card.offsetHeight / 2) {
                newIndex = i;
                break;
            }
        }
        return newIndex;
    };

    const handleInternalDragStart = (e: React.DragEvent<HTMLDivElement>, activity: ManualActivity) => {
        e.dataTransfer.setData('internal-move', JSON.stringify({ activity, fromDayId: day.id }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleSaveName = () => {
        if (nameInput.trim() && nameInput.trim() !== day.name) {
            onDayNameChange(nameInput.trim());
        } else {
            setNameInput(day.name);
        }
        setIsEditingName(false);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            setNameInput(day.name);
            setIsEditingName(false);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-bkg-surface/50 rounded-2xl p-4 transition-colors shrink-0 w-[350px] h-[calc(100vh-32px)] flex flex-col justify-between ${isOver ? 'bg-primary/20' : ''}`}
        >
            <div className="flex justify-between items-start mb-4 px-2">
                <div>
                    {isEditingName ? (
                         <input
                            ref={nameInputRef}
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={handleNameKeyDown}
                            className="text-2xl font-bold bg-bkg-surface border-b-2 border-primary text-text-base outline-none w-full"
                            autoFocus
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold text-primary capitalize">{day.name}</h3>
                             <span className="bg-bkg-muted text-text-muted text-xs font-bold px-2 py-1 rounded-full">{day.activities.length}</span>
                            <button 
                                onClick={() => setIsEditingName(true)} 
                                className="p-1 text-text-subtle hover:text-primary rounded-full"
                                aria-label="Edit day name"
                            >
                                <EditIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <input 
                        type="date"
                        value={day.date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="bg-transparent text-text-muted text-sm p-0 border-0 focus:ring-0"
                    />
                </div>
                 <div className="flex items-center gap-2">
                    {day.activities.length > 0 && (
                        <button onClick={onClearDay} className="text-xs font-semibold text-text-subtle hover:text-red-400 transition-colors">
                            CLEAR
                        </button>
                    )}
                    <button 
                        onClick={() => {if(window.confirm('Are you sure you want to delete this day? This cannot be undone.')) onDeleteDay()}} 
                        disabled={isLastDay} 
                        className="p-1 text-text-subtle hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isLastDay ? "Cannot delete the only day" : "Delete day"}
                        aria-label="Delete day"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto" data-role="activity-list">
                {day.activities.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onDragStart={(e) => handleInternalDragStart(e, activity)}
                        onEdit={() => onEdit(activity)}
                        onDelete={() => onDelete(activity.id)}
                    />
                ))}
                {day.activities.length === 0 && (
                    <div className="flex-grow flex items-center justify-center h-full min-h-[150px] border-2 border-dashed border-border-base rounded-lg">
                        <p className="text-text-subtle">Drop activities here</p>
                    </div>
                )}
            </div>
            <div className="pt-4">
                <button onClick={onAddActivity} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-bkg-muted/50 border border-dashed border-border-base hover:bg-primary/20 hover:text-primary transition-colors">
                    <AddIcon className="w-4 h-4" />
                    Add Activity
                </button>
            </div>
        </div>
    );
};


export const WeekendSchedule: React.FC<WeekendScheduleProps> = (props) => {
    return (
        <section className="lg:col-span-9">
            <div className="flex gap-6 overflow-x-auto pb-4">
                {props.plan.days.map(day => (
                     <DayColumn 
                        key={day.id}
                        day={day}
                        onDrop={props.onDrop}
                        onMoveActivity={props.onMoveActivity}
                        onEdit={(activity) => props.onEdit(day.id, activity)}
                        onDelete={(id) => props.onDelete(day.id, id)}
                        onClearDay={() => props.onClearDay(day.id)}
                        onDateChange={(newDate) => props.onDateChange(day.id, newDate)}
                        onDayNameChange={(newName) => props.onDayNameChange(day.id, newName)}
                        onAddActivity={() => props.onAddActivity(day.id)}
                        onDeleteDay={() => props.onDeleteDay(day.id)}
                        isLastDay={props.plan.days.length === 1}
                    />
                ))}
                 <button
                    onClick={props.onAddDay}
                    className="shrink-0 w-[300px] bg-bkg-surface/50 rounded-2xl flex flex-col items-center justify-center text-text-subtle hover:bg-primary/20 hover:text-primary transition-colors border-2 border-dashed border-border-base"
                >
                    <AddIcon className="w-8 h-8 mb-2" />
                    <span className="font-semibold">Add Day</span>
                </button>
            </div>
        </section>
    );
};