
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import type { Plan, ActivityCategory, ManualActivity } from '../shared/types';
import { CloseIcon, PrintIcon, DiningIcon, OutdoorsIcon, RelaxingIcon, EntertainmentIcon, FamilyIcon, CultureIcon } from '../assets/icons';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: Plan;
}

const categoryConfig: { [key in ActivityCategory]: { icon: React.FC<any> } } = {
    Dining: { icon: DiningIcon }, Outdoors: { icon: OutdoorsIcon },
    Relaxing: { icon: RelaxingIcon }, Entertainment: { icon: EntertainmentIcon },
    Family: { icon: FamilyIcon }, Culture: { icon: CultureIcon },
};

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, plan }) => {
    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=1000');
            if (!printWindow) return;

            const printStyles = `
                <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
                <style>
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        background-color: #f8fafc;
                        color: #0f172a;
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .plan { padding: 2.5rem; max-width: 1100px; margin: auto; }
                    h1 { font-size: 2.5rem !important; font-weight: 800 !important; text-align: center !important; color: #0f172a !important; margin-bottom: 2.5rem !important; letter-spacing: -0.025em; }
                    h2 { font-size: 1.5rem !important; font-weight: 700 !important; color: #38bdf8 !important; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem !important; margin-bottom: 1rem !important; margin-top: 0 !important; }
                    .day-grid { display: grid; grid-template-columns: repeat(${Math.min(plan.days.length, 3)}, 1fr); gap: 2rem !important; }
                    .day { break-inside: avoid; }
                    .day > h2 + p { color: #64748b; margin-bottom: 1rem !important; font-size: 0.875rem !important; margin-top: -0.75rem !important; }
                    .activity {
                        display: flex !important;
                        gap: 0.75rem !important;
                        align-items: flex-start !important;
                        background-color: #ffffff;
                        border: 1px solid #e2e8f0;
                        border-radius: 0.5rem;
                        padding: 1rem !important;
                        margin-bottom: 0.75rem !important;
                        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                    }
                    .activity svg {
                        flex-shrink: 0 !important;
                        margin-top: 0.125rem !important;
                        width: 1.25rem !important;
                        height: 1.25rem !important;
                        color: #64748b !important;
                    }
                    .activity > div { flex-grow: 1; }
                    .activity p { margin: 0; padding: 0; line-height: 1.5; }
                    .activity > div > p:first-of-type { font-weight: 600 !important; color: #1e293b !important; font-size: 1rem !important; }
                    .activity > div > p:not(:first-of-type) { font-size: 0.875rem !important; color: #64748b !important; margin-top: 0.25rem !important; }
                    .text-slate-400 { color: #94a3b8; padding: 2rem; text-align: center; border: 2px dashed #e2e8f0; border-radius: 0.5rem; }
                    @media (max-width: 768px) { .day-grid { grid-template-columns: 1fr; } }
                    @media print {
                        body { background-color: #ffffff; }
                        .plan { padding: 1rem; box-shadow: none; }
                        .activity { box-shadow: none; border: 1px solid #cbd5e1; }
                    }
                </style>
            `;

            printWindow.document.write('<html><head><title>My Weekend Plan</title>');
            printWindow.document.write(printStyles);
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    const renderDay = (day: { name: string, date: string, activities: ManualActivity[] }) => (
        <div className="day">
            <h2 className="text-2xl font-bold text-slate-700 mb-1">{day.name}</h2>
            <p className="text-sm text-slate-500 mb-3">{day.date ? new Date(day.date + 'T00:00:00').toDateString() : 'No date set'}</p>
            {day.activities.length > 0 ? (
                 <div className="space-y-3">
                    {day.activities.map(act => {
                        const config = categoryConfig[act.category] || categoryConfig.Entertainment;
                        const Icon = config.icon;
                        return (
                            <div key={act.id} className="activity flex gap-3 items-start">
                                <Icon className="w-5 h-5 mt-1 text-slate-500 shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-800">{act.title}</p>
                                    {act.time && <p className="text-sm text-slate-500">{act.time}</p>}
                                    {act.notes && <p className="text-sm text-slate-500">{act.notes}</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-slate-400">No activities planned.</p>
            )}
        </div>
    );

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-bkg-surface rounded-lg shadow-xl w-full max-w-4xl border border-border-base flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-border-base flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-text-base">Share Your Weekend</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md bg-primary text-white hover:opacity-90 transition-opacity">
                           <PrintIcon className="w-4 h-4" /> Print/Save as PDF
                        </button>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-bkg-muted">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div ref={printRef} className="plan bg-white text-slate-800 p-8 rounded-md">
                        <h1 className="text-4xl font-extrabold text-center mb-6 text-slate-800">{plan.name}</h1>
                        <div className={`day-grid grid grid-cols-1 md:grid-cols-${Math.min(plan.days.length, 3)} gap-8`}>
                            {plan.days.map(day => renderDay(day))}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
