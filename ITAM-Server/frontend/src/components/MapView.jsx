import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Draggable from 'react-draggable';
import { ZoomIn, ZoomOut, Maximize2, Grid3x3, RefreshCw, Layers } from 'lucide-react';
import AssetIcon from './AssetIcon';
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

export default function MapView() {
    const { activos, loading } = useRealTimeAssets();
    const [pisos, setPisos] = useState([]);
    const [selectedPiso, setSelectedPiso] = useState(null);
    const [pisoImage, setPisoImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [showGrid, setShowGrid] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);

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

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleResetZoom = () => setZoom(1);

    // Filter assets for current floor
    const activosEnPiso = activos.filter(pc => pc.piso_id === selectedPiso);

    if (loading) {
        return (
            <div className="h-[600px] bg-white rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando mapa...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    {/* Floor Selector */}
                    <div className="flex items-center gap-3">
                        <Layers className="text-gray-600" size={20} />
                        <select
                            value={selectedPiso || ''}
                            onChange={(e) => setSelectedPiso(parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Seleccionar piso...</option>
                            {pisos.map(piso => (
                                <option key={piso.id} value={piso.id}>
                                    {piso.nombre} (Nivel {piso.nivel})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowGrid(!showGrid)}
                            className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            title="Toggle Grid"
                        >
                            <Grid3x3 size={20} />
                        </button>

                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={handleZoomOut}
                                className="p-2 hover:bg-white rounded transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <span className="px-3 text-sm font-medium">{Math.round(zoom * 100)}%</span>
                            <button
                                onClick={handleZoomIn}
                                className="p-2 hover:bg-white rounded transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn size={18} />
                            </button>
                            <button
                                onClick={handleResetZoom}
                                className="p-2 hover:bg-white rounded transition-colors"
                                title="Reset Zoom"
                            >
                                <Maximize2 size={18} />
                            </button>
                        </div>

                        <button
                            onClick={loadFloors}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-3 flex gap-4 text-sm">
                    <span className="text-gray-600">
                        Equipos en este piso: <span className="font-semibold">{activosEnPiso.length}</span>
                    </span>
                    <span className="text-green-600">
                        Online: <span className="font-semibold">{activosEnPiso.filter(a => a.is_online).length}</span>
                    </span>
                    <span className="text-red-600">
                        Offline: <span className="font-semibold">{activosEnPiso.filter(a => !a.is_online).length}</span>
                    </span>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative h-[600px] bg-gray-100 overflow-auto">
                {loadingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
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
                                    <p>No hay plano para este piso</p>
                                    <p className="text-sm">Sube una imagen desde la gestión de pisos</p>
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

            {/* Help Text */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                💡 <strong>Tip:</strong> Arrastra los iconos de los equipos para ubicarlos en el mapa. Las posiciones se guardan automáticamente.
            </div>
        </motion.div>
    );
}