import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Map, Layers, Book } from 'lucide-react';
import BuildingManager from './BuildingManager';
import FloorManager from './FloorManager';
import AreaManager from './AreaManager';
import GlossaryManager from './GlossaryManager';

export default function InfrastructureModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('buildings'); // buildings, floors, areas

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with Tabs */}
                    <div className="bg-gradient-to-br from-primary-blue via-primary-purple to-primary-blue p-6 text-white shrink-0">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <Layers size={32} />
                                Gestión de Infraestructura
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('buildings')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold ${activeTab === 'buildings'
                                    ? 'bg-white text-primary-blue shadow-lg scale-105'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <Building2 size={20} />
                                Edificios
                            </button>
                            <button
                                onClick={() => setActiveTab('floors')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold ${activeTab === 'floors'
                                    ? 'bg-white text-primary-blue shadow-lg scale-105'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <Layers size={20} />
                                Pisos
                            </button>
                            <button
                                onClick={() => setActiveTab('areas')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold ${activeTab === 'areas'
                                    ? 'bg-white text-primary-blue shadow-lg scale-105'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <Map size={20} />
                                Áreas
                            </button>
                            <button
                                onClick={() => setActiveTab('glossary')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold ${activeTab === 'glossary'
                                    ? 'bg-white text-primary-blue shadow-lg scale-105'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <Book size={20} />
                                Glosario
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-gray-50 overflow-hidden relative">
                        {/* We pass isOpen=true because the modal itself controls visibility */}
                        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'buildings' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            {/* BuildingManager normally has a modal wrapper, we might need to adjust it or wrap it specifically. 
                                Actually, checking BuildingManager code, it HAS a modal wrapper (motion.div fixed inset-0). 
                                We probably need to refactor BuildingManager/FloorManager to be usable as PANELS, not just MODALS.
                                OR, we can just conditionally render the content of those managers if we refactor them.
                                
                                Refactoring approach:
                                Let's assume for now we render them, but since they have fixed position, they will conflict.
                                CORRECT APPROACH: Refactor BuildingManager, FloorManager to accept a 'mode' prop or just strip the modal container.
                                
                                QUICK FIX: Use a wrapper that hides the modal styles or modify the components.
                                Better: I will modify BuildingManager and FloorManager to optionally render WITHOUT the modal overlay if a prop 'embedded' is true.
                             */}
                            <BuildingManager isOpen={activeTab === 'buildings'} onClose={() => { }} embedded={true} />
                        </div>

                        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'floors' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <FloorManager isOpen={activeTab === 'floors'} onClose={() => { }} embedded={true} />
                        </div>

                        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'areas' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <AreaManager isOpen={activeTab === 'areas'} onClose={() => { }} />
                        </div>

                        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'glossary' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <GlossaryManager isActive={activeTab === 'glossary'} />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
