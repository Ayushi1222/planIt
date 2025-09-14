import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import type { Plan, ManualActivity, Itinerary, SavedPlan, BrowserActivity, ActivityCategory } from './shared/types';
import { WeekendSchedule } from './components/WeekendSchedule';
import { ActivityBrowser } from './components/ActivityBrowser';
import { EditActivityModal } from './components/EditActivityModal';
import { AddActivityModal } from './components/AddActivityModal';
import { AiPlannerModal } from './components/AiPlannerModal';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { SavedPlansModal } from './components/SavedPlansModal';
import { ShareModal } from './components/ShareModal';
import { Navbar } from './components/Navbar';
import { EditIcon } from './assets/icons';

const defaultPlan: Plan = {
  id: uuidv4(),
  name: 'My First Weekend',
  days: [
    { id: uuidv4(), name: 'Saturday', date: '', activities: [] },
    { id: uuidv4(), name: 'Sunday', date: '', activities: [] },
  ],
};

export type Theme = 'theme-default' | 'theme-cozy' | 'theme-adventure' | 'theme-sunny';

export const themes = [
    { name: 'Default', class: 'theme-default', color: 'bg-sky-400' },
    { name: 'Cozy', class: 'theme-cozy', color: 'bg-pink-400' },
    { name: 'Adventure', class: 'theme-adventure', color: 'bg-emerald-400' },
    { name: 'Sunny', class: 'theme-sunny', color: 'bg-orange-500' }
];

const mapAiCategoryToManualCategory = (aiCategory: string): ActivityCategory => {
    const mapping: { [key: string]: ActivityCategory } = {
        'Dining': 'Dining',
        'Entertainment': 'Entertainment',
        'Relaxation': 'Relaxing',
        'Activity': 'Outdoors',
        'Nightlife': 'Entertainment',
        'Shopping': 'Culture',
        'Culture': 'Culture',
        'History & Heritage': 'Culture',
        'Nature & Parks': 'Outdoors',
        'Special Event': 'Entertainment',
        'Outdoor Activities': 'Outdoors',
        'Travel': 'Outdoors', // Best fit available
        'Art & Culture': 'Culture',
        'Live Music': 'Entertainment'
    };
    return mapping[aiCategory] || 'Entertainment';
};

const convertItineraryToPlan = (itinerary: Itinerary): Plan => {
    return {
        id: uuidv4(),
        name: itinerary.title,
        days: itinerary.itinerary.map(dayPlan => {
            const [dayName, ...dateParts] = dayPlan.day.split(',');
            const dateStr = dateParts.join(',').trim();
            let isoDate = '';
            try {
                if(dateStr) {
                    isoDate = new Date(dateStr).toISOString().split('T')[0];
                }
            } catch (e) {
                console.warn("Could not parse date from AI itinerary:", dateStr);
            }
            
            return {
                id: uuidv4(),
                name: dayName.trim(),
                date: isoDate,
                activities: dayPlan.activities.map(activity => ({
                    id: uuidv4(),
                    title: activity.title,
                    time: activity.time,
                    notes: activity.description,
                    category: mapAiCategoryToManualCategory(activity.category)
                }))
            };
        })
    };
};

const App: React.FC = () => {
    const handleCreatePlan = () => {
        const newPlan: Plan = {
            id: uuidv4(),
            name: `New Weekend Plan ${plans.length + 1}`,
            days: [
                { id: uuidv4(), name: 'Saturday', date: '', activities: [] },
                { id: uuidv4(), name: 'Sunday', date: '', activities: [] },
            ]
        };
        setPlans([...plans, newPlan]);
        setActivePlanId(newPlan.id);
    };
    const [plans, setPlans] = useLocalStorage<Plan[]>('weekend-plans', [defaultPlan]);
    const [activePlanId, setActivePlanId] = useLocalStorage<string | null>('active-weekend-plan-id', defaultPlan.id);
    const [aiPlan, setAiPlan] = useLocalStorage<SavedPlan | null>('ai-weekend-plan', null);
    const [theme, setTheme] = useLocalStorage<Theme>('weekend-theme', 'theme-default');
    
    type View = 'ai-itinerary' | 'manual-planner';
    const [view, setView] = useState<View>('manual-planner');

    const [isAiModalOpen, setAiModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isPlansModalOpen, setPlansModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [isEditingPlanName, setIsEditingPlanName] = useState(false);
    
    const [aiIdeas, setAiIdeas] = useState<BrowserActivity[]>([]);

    const [activityToEdit, setActivityToEdit] = useState<{ dayId: string; activity: ManualActivity } | null>(null);
    const [dayToAddActivity, setDayToAddActivity] = useState<string | null>(null);
    const [planNameInput, setPlanNameInput] = useState('');
    const planNameInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        if (!activePlanId || !plans.find(p => p.id === activePlanId)) {
            setActivePlanId(plans[0]?.id || null);
        }
    }, [plans, activePlanId, setActivePlanId]);
    
    const activePlan = plans.find(p => p.id === activePlanId) || plans[0];

     useEffect(() => {
        if (activePlan && !isEditingPlanName) {
            setPlanNameInput(activePlan.name);
        }
    }, [activePlan, isEditingPlanName]);

    useEffect(() => {
        if (isEditingPlanName && planNameInputRef.current) {
            planNameInputRef.current.select();
        }
    }, [isEditingPlanName]);

    const setActivePlan = (updatedPlan: Plan) => {
        const now = new Date().toISOString();
        setPlans(prevPlans => prevPlans.map(p => p.id === updatedPlan.id ? { ...updatedPlan, updatedAt: now } : p));
    };

    const handleSavePlanName = () => {
        if (!activePlan || !planNameInput.trim()) {
            if(activePlan) setPlanNameInput(activePlan.name); 
            setIsEditingPlanName(false);
            return;
        };
        const updatedPlan = { ...activePlan, name: planNameInput.trim() };
        setActivePlan(updatedPlan);
        setIsEditingPlanName(false);
    };

    const handlePlanNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSavePlanName();
        } else if (e.key === 'Escape') {
            if(activePlan) setPlanNameInput(activePlan.name);
            setIsEditingPlanName(false);
        }
    };

    const handleAddDay = () => {
        if (!activePlan) return;
        const dayNumber = activePlan.days.length + 1;
        const newDay = { id: uuidv4(), name: `Day ${dayNumber}`, date: '', activities: [] };
        const updatedPlan = { ...activePlan, days: [...activePlan.days, newDay] };
        setActivePlan(updatedPlan);
    };
    
    const handleDeleteDay = (dayId: string) => {
        setPlans(prevPlans => {
            const planContainingDay = prevPlans.find(p => p.days.some(d => d.id === dayId));

            if (!planContainingDay) {
                console.error("No plan found containing the day to be deleted.");
                return prevPlans; 
            }

            if (planContainingDay.days.length <= 1) {
                alert("You cannot delete the last remaining day of a plan.");
                return prevPlans; 
            }

            return prevPlans.map(plan => {
                if (plan.id !== planContainingDay.id) {
                    return plan;
                }
                
                return {
                    ...plan,
                    days: plan.days.filter(d => d.id !== dayId),
                };
            });
        });
    };

    const handleClearDay = (dayId: string) => {
        if (!activePlan) return;
        const updatedPlan = {
            ...activePlan,
            days: activePlan.days.map(day => day.id === dayId ? { ...day, activities: [] } : day)
        };
        setActivePlan(updatedPlan);
    };
    
    const handleDateChange = (dayId: string, newDate: string) => {
        if (!activePlan) return;
        const updatedPlan = {
            ...activePlan,
            days: activePlan.days.map(day => day.id === dayId ? { ...day, date: newDate } : day)
        };
        setActivePlan(updatedPlan);
    };

    const handleDayNameChange = (dayId: string, newName: string) => {
        if (!activePlan) return;
        const updatedPlan = {
            ...activePlan,
            days: activePlan.days.map(day => 
                day.id === dayId ? { ...day, name: newName } : day
            )
        };
        setActivePlan(updatedPlan);
    };

    const handleDropActivity = (dayId: string, index: number, activityData: Omit<ManualActivity, 'id'>) => {
        if (!activePlan) return;
        const newActivity = { ...activityData, id: uuidv4() };
        const updatedPlan = {
            ...activePlan,
            days: activePlan.days.map(day => {
                if (day.id === dayId) {
                    const newActivities = [...day.activities];
                    newActivities.splice(index, 0, newActivity);
                    return { ...day, activities: newActivities };
                }
                return day;
            })
        };
        setActivePlan(updatedPlan);
    };
    
    const handleMoveActivity = (activity: ManualActivity, fromDayId: string, toDayId: string, toIndex: number) => {
        if (!activePlan) return;

        let tempPlan = { ...activePlan };
        tempPlan = {
            ...tempPlan,
            days: tempPlan.days.map(day => {
                if (day.id === fromDayId) {
                    return { ...day, activities: day.activities.filter(a => a.id !== activity.id) };
                }
                return day;
            })
        };
        tempPlan = {
            ...tempPlan,
            days: tempPlan.days.map(day => {
                if (day.id === toDayId) {
                    const newActivities = [...day.activities];
                    newActivities.splice(toIndex, 0, activity);
                    return { ...day, activities: newActivities };
                }
                return day;
            })
        };
        setActivePlan(tempPlan);
    };
    
    const handleDeleteActivity = (dayId: string, activityId: string) => {
        if (!activePlan) return;
        const updatedPlan = {
            ...activePlan,
            days: activePlan.days.map(day => {
                if (day.id === dayId) {
                    return { ...day, activities: day.activities.filter(a => a.id !== activityId) };
                }
                return day;
            })
        };
        setActivePlan(updatedPlan);
    };
    
    const handleOpenEditModal = (dayId: string, activity: ManualActivity) => {
        setActivityToEdit({ dayId, activity });
        setEditModalOpen(true);
    };

    const handleSaveActivity = (updatedActivity: ManualActivity) => {
        if (!activePlan || !activityToEdit) return;
        const { dayId } = activityToEdit;
        const updatedPlan = {
            ...activePlan,
            days: activePlan.days.map(day => {
                if (day.id === dayId) {
                    return { ...day, activities: day.activities.map(a => a.id === updatedActivity.id ? updatedActivity : a) };
                }
                return day;
            })
        };
        setActivePlan(updatedPlan);
        setEditModalOpen(false);
        setActivityToEdit(null);
    };

    const handleOpenAddModal = (dayId: string) => {
        setDayToAddActivity(dayId);
        setAddModalOpen(true);
    };

    const handleAddManualActivity = (activityData: Omit<ManualActivity, 'id'>) => {
        if (!activePlan || !dayToAddActivity) return;
        const newActivity = { ...activityData, id: uuidv4() };
        const updatedPlan = {
            ...activePlan,
            days: activePlan.days.map(day => {
                if (day.id === dayToAddActivity) {
                    return { ...day, activities: [...day.activities, newActivity] };
                }
                return day;
            })
        };
        setActivePlan(updatedPlan);
        setAddModalOpen(false);
        setDayToAddActivity(null);
    };
    
    const handleGeneratedPlan = (itinerary: Itinerary) => {
        const newAiPlan: SavedPlan = { ...itinerary, chatHistory: [] };
        setAiPlan(newAiPlan);
        setView('ai-itinerary');
        setAiModalOpen(false);
    };

    const handleSaveAiPlan = (itinerary: Itinerary) => {
        const newPlan = convertItineraryToPlan(itinerary);
        setPlans(prevPlans => [...prevPlans, newPlan]);
        setActivePlanId(newPlan.id);
        setAiPlan(null);
        setView('manual-planner');
    };

    if (!activePlan) {
         if (plans.length > 0) {
            setActivePlanId(plans[0].id);
        } else {
            const newDefaultPlan = defaultPlan;
            setPlans([newDefaultPlan]);
            setActivePlanId(newDefaultPlan.id);
        }
        return <div className="p-4 text-center">Loading plan...</div>;
    }

    const ManualPlanner = () => (
        <div className="flex-grow flex flex-col p-4 md:p-6 lg:p-8 space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 px-4 md:px-0">
                <div>
                    <div className="flex items-center gap-3">
                        {isEditingPlanName ? (
                            <input
                                ref={planNameInputRef}
                                type="text"
                                value={planNameInput}
                                onChange={(e) => setPlanNameInput(e.target.value)}
                                onBlur={handleSavePlanName}
                                onKeyDown={handlePlanNameKeyDown}
                                className="text-3xl font-bold bg-bkg-surface border-b-2 border-primary text-text-base outline-none px-1"
                                autoFocus
                            />
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-text-base">{activePlan.name}</h2>
                                <button
                                    onClick={() => setIsEditingPlanName(true)}
                                    className="p-1 text-text-subtle hover:text-primary rounded-full"
                                    aria-label="Edit plan name"
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                    <p className="text-text-muted">Drag & drop activities to build your perfect weekend.</p>
                </div>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow min-h-0">
                <WeekendSchedule
                    plan={activePlan}
                    onDrop={handleDropActivity}
                    onMoveActivity={handleMoveActivity}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteActivity}
                    onClearDay={handleClearDay}
                    onAddDay={handleAddDay}
                    onDateChange={handleDateChange}
                    onAddActivity={handleOpenAddModal}
                    onDeleteDay={handleDeleteDay}
                    onDayNameChange={handleDayNameChange}
                />
                 <div className="lg:col-span-3 relative">
                    <div className="absolute top-0 bottom-0 -left-3 w-px bg-border-base hidden lg:block" aria-hidden="true"></div>
                    <ActivityBrowser aiIdeas={aiIdeas} setAiIdeas={setAiIdeas} />
                </div>
            </main>
        </div>
    );
    
    const AiItineraryViewer = () => {
        if (!aiPlan) {
            setView('manual-planner');
            return null;
        }
        return <div className="flex-grow p-4 md:p-6 lg:p-8">
            <ItineraryDisplay 
                initialPlan={aiPlan} 
                setPlan={setAiPlan}
                onReset={() => {
                    setAiPlan(null);
                    setView('manual-planner');
                }}
                onSavePlan={handleSaveAiPlan}
            />
        </div>;
    };

    return (
        <div className="h-screen bg-bkg-base text-text-base flex flex-col">
             <Navbar
                onOpenAiModal={() => setAiModalOpen(true)}
                onOpenPlansModal={() => setPlansModalOpen(true)}
                onOpenShareModal={() => setShareModalOpen(true)}
                onOpenNewPlanModal={handleCreatePlan}
                activeTheme={theme}
                onSetTheme={setTheme}
            />
            <div className="flex-grow flex flex-col overflow-y-auto">
                 {view === 'ai-itinerary' ? <AiItineraryViewer /> : <ManualPlanner />}
            </div>

            <AiPlannerModal
                isOpen={isAiModalOpen}
                onClose={() => setAiModalOpen(false)}
                onGenerated={handleGeneratedPlan}
            />
            {activityToEdit && (
                <EditActivityModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    activity={activityToEdit.activity}
                    onSave={handleSaveActivity}
                />
            )}
            {dayToAddActivity && (
                 <AddActivityModal
                    isOpen={isAddModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    onSave={handleAddManualActivity}
                />
            )}
             <SavedPlansModal
                isOpen={isPlansModalOpen}
                onClose={() => setPlansModalOpen(false)}
                plans={plans}
                setPlans={setPlans}
                activePlanId={activePlanId}
                setActivePlanId={setActivePlanId}
            />
            {activePlan && (
                <ShareModal 
                    isOpen={isShareModalOpen} 
                    onClose={() => setShareModalOpen(false)} 
                    plan={activePlan} 
                />
            )}
        </div>
    );
};

export default App;