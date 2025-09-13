import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { ManualActivity } from '../shared/types';
import { CloseIcon } from '../assets/icons';

interface EditActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    activity: ManualActivity;
    onSave: (activity: ManualActivity) => void;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({ isOpen, onClose, activity, onSave }) => {
    const [formData, setFormData] = useState(activity);

    useEffect(() => {
        setFormData(activity);
    }, [activity]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="bg-bkg-surface rounded-lg shadow-xl w-full max-w-md border border-border-base">
                <div className="p-4 border-b border-border-base flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-text-base">Edit Activity</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-bkg-muted">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                     <div>
                        <label htmlFor="title" className="block text-sm font-medium text-text-muted mb-1">Title</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full bg-bkg-muted border border-border-base rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                     <div>
                        <label htmlFor="time" className="block text-sm font-medium text-text-muted mb-1">Time (optional)</label>
                        <input type="text" name="time" id="time" value={formData.time || ''} onChange={handleChange} placeholder="e.g., 2:00 PM" className="w-full bg-bkg-muted border border-border-base rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-text-muted mb-1">Notes (optional)</label>
                        <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="w-full bg-bkg-muted border border-border-base rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                </div>
                <div className="p-4 flex justify-end gap-3 bg-bkg-base/50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-bkg-muted hover:opacity-80 transition-opacity">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm rounded-md bg-primary hover:opacity-90 text-white font-semibold transition-opacity">Save Changes</button>
                </div>
            </form>
        </div>,
        document.body
    );
};
