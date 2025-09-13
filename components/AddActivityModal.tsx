
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { ManualActivity, ActivityCategory } from '../shared/types';
import { CloseIcon } from '../assets/icons';

interface AddActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (activity: Omit<ManualActivity, 'id'>) => void;
}

const categories: ActivityCategory[] = ['Dining', 'Outdoors', 'Relaxing', 'Entertainment', 'Family', 'Culture'];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [category, setCategory] = useState<ActivityCategory>('Entertainment');

    if (!isOpen) return null;

    const resetForm = () => {
        setTitle('');
        setTime('');
        setNotes('');
        setCategory('Entertainment');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('A title is required for the activity.');
            return;
        }
        onSave({ title, category, time, notes });
        handleClose();
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="bg-bkg-surface rounded-lg shadow-xl w-full max-w-md border border-border-base">
                <div className="p-4 border-b border-border-base flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-text-base">Add New Activity</h3>
                    <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-bkg-muted">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                     <div>
                        <label htmlFor="title" className="block text-sm font-medium text-text-muted mb-1">Title *</label>
                        <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-bkg-muted border border-border-base rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Category</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setCategory(cat)}
                              className={`px-3 py-1 text-sm rounded-full border transition-colors ${category === cat ? 'bg-primary text-white border-primary' : 'bg-bkg-muted border-border-base hover:bg-opacity-80'}`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="time" className="block text-sm font-medium text-text-muted mb-1">Time (optional)</label>
                        <input type="text" name="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g., 2:00 PM" className="w-full bg-bkg-muted border border-border-base rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-text-muted mb-1">Notes (optional)</label>
                        <textarea name="notes" id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-bkg-muted border border-border-base rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                </div>
                <div className="p-4 flex justify-end gap-3 bg-bkg-base/50 rounded-b-lg">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm rounded-md bg-bkg-muted hover:opacity-80 transition-opacity">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm rounded-md bg-primary hover:opacity-90 text-white font-semibold transition-opacity">Add Activity</button>
                </div>
            </form>
        </div>,
        document.body
    );
};
