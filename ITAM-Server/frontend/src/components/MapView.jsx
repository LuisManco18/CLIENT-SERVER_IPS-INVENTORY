import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Draggable from 'react-draggable';
import {
    ZoomIn, ZoomOut, Maximize2, Grid3x3, RefreshCw, Layers,
    Save, Lightbulb, ChevronDown, Plus
} from 'lucide-react';
import AssetIcon from './AssetIcon';
import UnassignedAssetsList from './UnassignedAssetsList';
import useRealTimeAssets from '../hooks/useRealTimeAssets';

// Sub-component for each draggable asset
const DraggableAsset = ({ pc, onStop, scale }) => {
    const nodeRef = useRef(null);
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultPosition={{ x: pc.pos_x || 0, y: pc.pos_y || 0 }}
            bounds="parent"
            onStop={(e, d) => onStop(e, d, pc.serial_number)}
            scale={scale}
        >
            <div
                ref={nodeRef}
                className="absolute cursor-move group"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <AssetIcon
                    tipo={pc.icono_tipo}
                    isOnline={pc.is_online}
                    size={20}
                />

                {/* Tooltip */}
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
                    >
                        <div className="glass-dark text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                            <div className="font-semibold">{pc.hostname}</div>
                            <div className="text-gray-300">{pc.usuario_detectado}</div>
                            <div className="text-gray-400">{pc.ip_address}</div>
                            <div className={`text-xs mt-1 ${pc.is_online ? 'text-green-400' : 'text-red-400'}`}>
                                {pc.is_online ? '● Online' : '● Offline'}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </Draggable>
    );
};

export default function MapView({ onOpenFloorManager }) {
    const { activos, loading } = useRealTimeAssets();
    const [pisos, setPisos] = useState([]);
    const [selectedPiso, setSelectedPiso] = useState(null);
    const [pisoImage, setPisoImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [showGrid, setShowGrid] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);
    const [draggedAsset, setDraggedAsset] = useState(null);

    const API_ASSETS = 'http://localhost:8000/api/assets';
    const API_FLOORS = 'http://localhost:8000/api/floors';

    useEffect(() => {
        loadFloors();
    }, []);

    useEffect(() => {
        if (selectedPiso) {
            loadFloorImage(selectedPiso);
        }
    }, [selectedPiso]);

    const loadFloors = async () => {
        try {
            const response = await axios.get(API_FLOORS);
            setPisos(response.data);
            if (response.data.length > 0 && !selectedPiso) {
                setSelectedPiso(response.data[0].id);
            }
        } catch (error) {
            console.error('Error loading floors:', error);
        }
    };

    const loadFloorImage = async (pisoId) => {
        setLoadingImage(true);
        try {
            const response = await axios.get(`${API_FLOORS}/${pisoId}/image`);
            setPisoImage(response.data.mapa_imagen);
        } catch (error) {
            console.error('Error loading floor image:', error);
            setPisoImage(null);
        } finally {
            setLoadingImage(false);
        }
    };

    const handleStop = async (e, data, serial) => {
        try {
            await axios.put(`${API_ASSETS}/${serial}/position`, {
                pos_x: data.x,
                pos_y: data.y,
                piso_id: selectedPiso
            });
        } catch (error) {
            console.error('Error saving position:', error);
        }
    };

    const handleDragStart = (e, asset) => {
        setDraggedAsset(asset);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleResetZoom = () => setZoom(1);

    // Filter assets for current floor and unassigned
    const activosEnPiso = activos.filter(pc => pc.piso_id === selectedPiso);
    const activosSinAsignar = activos.filter(pc => !pc.piso_id);

    // Calculate floor stats
    const onlineCount = activosEnPiso.filter(a => a.is_online).length;
    const offlineCount = activosEnPiso.filter(a => !a.is_online).length;
    const totalEquipos = activosEnPiso.length;

    if (loading) {
        return (
            <div className="h-[600px] bg-white rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4" />
                    <p className="text-gray-600">Cargando mapa...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-6"
        >
            {/* Left Sidebar */}
            <div className="w-[280px] flex-shrink-0 space-y-6">
                {/* Floor Selection Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="text-primary-blue" size={20} />
                        <h3 className="font-bold text-gray-900">Selección de Piso</h3>
                    </div>

                    {/* Current Floor Label */}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Piso Actual
                    </label>

                    {/* Floor Dropdown */}
                    <select
                        value={selectedPiso || ''}
                        onChange={(e) => setSelectedPiso(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue font-medium transition-all mb-4"
                    >
                        <option value="">Seleccionar piso...</option>
                        {pisos.map(piso => (
                            <option key={piso.id} value={piso.id}>
                                Piso {piso.nivel} - {piso.nombre}
                            </option>
                        ))}
                    </select>

                    {/* Manage Floors Button */}
                    <button
                        onClick={onOpenFloorManager}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold"
                    >
                        <Plus size={18} />
                        Gestionar Pisos
                    </button>
                </div>

                {/* Floor Stats Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                        Estado del Piso
                    </h3>

                    <div className="space-y-3">
                        {/* Online */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600">Online</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{onlineCount}</span>
                        </div>

                        {/* Offline */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-sm text-gray-600">Offline</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{offlineCount}</span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-3"></div>

                        {/* Total */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Total Equipos</span>
                            <span className="text-xl font-bold text-gray-900">{totalEquipos}</span>
                        </div>
                    </div>
                </div>

                {/* Unassigned Assets */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <UnassignedAssetsList
                        assets={activosSinAsignar}
                        onDragStart={handleDragStart}
                    />
                </div>
            </div>

            {/* Main Map Area */}
            <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleZoomOut}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <span className="px-3 text-sm font-medium min-w-[60px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn size={18} />
                            </button>
                            <button
                                onClick={handleResetZoom}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Reset Zoom"
                            >
                                <Maximize2 size={18} />
                            </button>
                            <button
                                onClick={() => setShowGrid(!showGrid)}
                                className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-primary-blue text-white' : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                title="Toggle Grid"
                            >
                                <Grid3x3 size={18} />
                            </button>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Auto-save Tip */}
                            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                                <Lightbulb size={16} className="text-yellow-600" />
                                <span className="text-xs text-yellow-800 font-medium">
                                    Tip: Los cambios se guardan automáticamente
                                </span>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={loadFloors}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-opacity-90 transition-all shadow-md font-semibold"
                            >
                                <Save size={18} />
                                Guardar Posiciones
                            </button>
                        </div>
                    </div>
                </div>

                {/* Map Container */}
                <div className="relative h-[600px] bg-gray-100 overflow-auto">
                    {loadingImage ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4" />
                                <p className="text-gray-600">Cargando plano...</p>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="relative w-full h-full"
                            style={{
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top left',
                                transition: 'transform 0.2s ease'
                            }}
                        >
                            {/* Background Image */}
                            {pisoImage ? (
                                <img
                                    src={pisoImage}
                                    alt="Floor Plan"
                                    className="absolute inset-0 w-full h-full object-contain"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                    <div className="text-center text-gray-500">
                                        <Layers size={48} className="mx-auto mb-2 opacity-50" />
                                        <p className="font-semibold">No hay plano para este piso</p>
                                        <p className="text-sm mt-2">Sube una imagen del plano arquitectónico (PNG, JPG)</p>
                                        <p className="text-sm">para comenzar a ubicar los activos.</p>
                                        <button
                                            onClick={onOpenFloorManager}
                                            className="mt-4 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
                                        >
                                            Subir Plano
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Grid Overlay */}
                            {showGrid && (
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        backgroundImage: `
                                            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                                            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                                        `,
                                        backgroundSize: '50px 50px'
                                    }}
                                />
                            )}

                            {/* Draggable Assets */}
                            {activosEnPiso.map(pc => (
                                <DraggableAsset
                                    key={pc.id}
                                    pc={pc}
                                    onStop={handleStop}
                                    scale={zoom}
                                />
                            ))}

                            {/* Instructions overlay */}
                            {activosEnPiso.length === 0 && pisoImage && (
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 glass px-4 py-2 rounded-lg text-sm text-gray-700">
                                    No hay equipos asignados a este piso
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}