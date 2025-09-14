
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { Plan } from '../shared/types';
import dayjs from 'dayjs';
import { CloseIcon, TrashIcon, EditIcon, AddIcon } from '../assets/icons';
import { v4 as uuidv4 } from 'uuid';

interface SavedPlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    plans: Plan[];
    setPlans: (plans: Plan[]) => void;
    activePlanId: string | null;
    setActivePlanId: (id: string) => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({ isOpen, onClose, plans, setPlans, activePlanId, setActivePlanId }) => {
    React.useEffect(() => {
        const now = new Date().toISOString();
        let changed = false;
        const updated = plans.map(p => {
            if (!p.createdAt || !p.updatedAt) {
                changed = true;
                return { ...p, createdAt: p.createdAt || now, updatedAt: p.updatedAt || p.createdAt || now };
            }
            return p;
        });
        if (changed) setPlans(updated);
    }, [plans, setPlans]);
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');


    if (!isOpen) return null;

    // Sort plans so the selected one is first
    const sortedPlans = [...plans].sort((a, b) => {
        if (a.id === activePlanId) return -1;
        if (b.id === activePlanId) return 1;
        return 0;
    });

    const handleCreatePlan = () => {
        const now = new Date().toISOString();
        const newPlan: Plan = {
            id: uuidv4(),
            name: `New Weekend Plan ${plans.length + 1}`,
            days: [
                { id: uuidv4(), name: 'Saturday', date: '', activities: [] },
                { id: uuidv4(), name: 'Sunday', date: '', activities: [] },
            ],
            createdAt: now,
            updatedAt: now
        };
        const newPlans = [...plans, newPlan];
        setPlans(newPlans);
        setActivePlanId(newPlan.id);
        onClose();
    };

    const handleDeletePlan = (planId: string) => {
        if (plans.length === 1) {
            alert("You can't delete your only plan!");
            return;
        }
        const newPlans = plans.filter(p => p.id !== planId);
        setPlans(newPlans);
        if (activePlanId === planId) {
            setActivePlanId(newPlans[0].id);
        }
    };

    const handleSelectPlan = (planId: string) => {
        setActivePlanId(planId);
        onClose();
    };

    const handleStartEditing = (plan: Plan) => {
        setEditingPlanId(plan.id);
        setEditingName(plan.name);
    };

    const handleSaveName = (planId: string) => {
        const now = new Date().toISOString();
        const newPlans = plans.map(p => p.id === planId ? { ...p, name: editingName, updatedAt: now } : p);
        setPlans(newPlans);
        setEditingPlanId(null);
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-bkg-surface rounded-lg shadow-xl w-full max-w-lg border border-border-base flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-border-base flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-text-base">My Plans</h3>
                     <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-bkg-muted">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-3">
                    {sortedPlans.map(plan => {
                        const isSelected = activePlanId === plan.id && editingPlanId !== plan.id;
                        return (
                            <div
                                key={plan.id}
                                className={`flex items-center justify-between p-3 rounded-md transition-colors ${isSelected ? 'bg-primary/20 border-2 border-primary' : ''}`}
                            >

                                {editingPlanId === plan.id ? (
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onBlur={() => handleSaveName(plan.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName(plan.id)}
                                        autoFocus
                                        className="bg-bkg-base border border-border-base rounded-md px-2 py-1 text-sm w-full"
                                    />
                                ) : (
                                    <div className="flex flex-col w-full">
                                        <button
                                            onClick={() => handleSelectPlan(plan.id)}
                                            className={`font-semibold text-left ${isSelected ? 'text-primary font-extrabold' : ''}`}
                                        >
                                            {plan.name}
                                        </button>
                                        <span className="text-xs text-text-muted mt-1">
                                            Created: {plan.createdAt ? dayjs(plan.createdAt).format('DD-MM-YYYY HH:mm') : 'N/A'}
                                            {plan.updatedAt && plan.updatedAt !== plan.createdAt ? (
                                                <>
                                                    <br />Last Modified: {dayjs(plan.updatedAt).format('DD-MM-YYYY HH:mm')}
                                                </>
                                            ) : null}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleStartEditing(plan)} className="p-1 text-text-muted hover:text-primary rounded-full"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeletePlan(plan.id)} className="p-1 text-text-muted hover:text-red-400 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-border-base">
                     <button onClick={handleCreatePlan} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-primary text-white hover:opacity-90 transition-opacity">
                        <AddIcon className="w-4 h-4" />
                        Create New Plan
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
