import React, { useState, useEffect } from 'react';
import { 
    Bell, Activity, Search, RefreshCw, AlertCircle, 
    CheckCircle2, Power, RotateCcw, XCircle, Calendar,
    User, Monitor, Wifi
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationsPanel() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterTipo, setFilterTipo] = useState('ALL');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const limit = 20;

    const getAuthHeaders = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });

    const loadNotifications = async (isNewPage = false) => {
        try {
            if (!isNewPage) setLoading(true);
            
            const skip = isNewPage ? page * limit : 0;
            const params = new URLSearchParams({ skip, limit });
            if (filterTipo && filterTipo !== 'ALL') {
                params.append('tipo', filterTipo);
            }

            const [notifsRes, countRes] = await Promise.all([
                axios.get(`${API_ENDPOINTS.BASE_URL}/api/notificaciones?${params.toString()}`, getAuthHeaders()),
                axios.get(`${API_ENDPOINTS.BASE_URL}/api/notificaciones/count${filterTipo !== 'ALL' ? `?tipo=${filterTipo}` : ''}`, getAuthHeaders())
            ]);

            if (isNewPage) {
                setNotifications(prev => [...prev, ...notifsRes.data.items]);
            } else {
                setNotifications(notifsRes.data.items || []);
                setPage(1);
            }

            setTotalCount(countRes.data.count);
            setHasMore((notifsRes.data.items || []).length === limit);
            setError('');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al cargar las notificaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications(false);
    }, [filterTipo]);

    const handleLoadMore = () => {
        setPage(p => p + 1);
        loadNotifications(true);
    };

    const getActionIcon = (tipo) => {
        switch (tipo) {
            case 'SHUTDOWN': return <Power size={18} className="text-red-500" />;
            case 'RESTART': return <RotateCcw size={18} className="text-amber-500" />;
            case 'CANCEL': return <XCircle size={18} className="text-blue-500" />;
            default: return <Activity size={18} className="text-gray-500" />;
        }
    };

    const getActionLabel = (tipo) => {
        switch (tipo) {
            case 'SHUTDOWN': return 'Apagado';
            case 'RESTART': return 'Reinicio';
            case 'CANCEL': return 'Cancelación';
            default: return tipo;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Bell className="text-red-400" />
                            Registro de Eventos y Notificaciones
                        </h2>
                        <p className="text-gray-300 mt-1">
                            Historial de acciones remotas ejecutadas por los usuarios.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <select
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-red-500 mr-2"
                    >
                        <option value="ALL" className="text-gray-800">Todos los Eventos</option>
                        <option value="SHUTDOWN" className="text-gray-800">Apagados</option>
                        <option value="RESTART" className="text-gray-800">Reinicios</option>
                        <option value="CANCEL" className="text-gray-800">Cancelaciones</option>
                    </select>

                    <button
                        onClick={() => loadNotifications(false)}
                        className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors flex items-center justify-center"
                        title="Actualizar"
                    >
                        <RefreshCw size={20} className={loading && !page > 1 ? "animate-spin" : ""} />
                    </button>
                    
                    <div className="ml-auto flex items-center bg-white/10 px-4 py-2 rounded-xl text-sm font-medium">
                        <span className="text-red-300 mr-2">{totalCount}</span> eventos encontrados
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <AnimatePresence>
                    {notifications.length === 0 && !loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg text-gray-500 font-medium">No hay eventos registrados</p>
                            <p className="text-gray-400 text-sm mt-1">Los comandos remotos aparecerán aquí.</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notif, index) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-white rounded-xl p-5 border-l-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 ${
                                        notif.tipo === 'SHUTDOWN' ? 'border-l-red-500' :
                                        notif.tipo === 'RESTART' ? 'border-l-amber-500' :
                                        'border-l-blue-500'
                                    }`}
                                >
                                    <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                                        {getActionIcon(notif.tipo)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-800 uppercase tracking-wide text-sm">
                                                    {getActionLabel(notif.tipo)}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    notif.exitoso 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {notif.exitoso ? 'Exitoso' : 'Fallido'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 gap-1 font-medium bg-gray-50 px-2 py-1 rounded-md">
                                                <Calendar size={14} />
                                                {format(new Date(notif.fecha), "dd MMM yyyy, HH:mm:ss", { locale: es })}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <User size={16} className="text-gray-400 shrink-0" />
                                                <span className="font-semibold text-gray-800">Usuario:</span>
                                                <span className="truncate">{notif.usuario_username}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <Monitor size={16} className="text-gray-400 shrink-0" />
                                                    <span className="font-semibold text-gray-800">PC:</span>
                                                    <span className="truncate">{notif.activo_hostname || `ID: ${notif.activo_id}`}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-gray-200">
                                                    <Wifi size={14} className="text-gray-400" />
                                                    <span>{notif.activo_ip}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono text-xs">
                                            <span className="font-semibold text-gray-800 block mb-1 font-sans text-sm">Mensaje del sistema:</span>
                                            {notif.mensaje}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {loading && page > 1 && (
                    <div className="flex justify-center p-6">
                        <RefreshCw className="animate-spin text-gray-400" size={24} />
                    </div>
                )}

                {!loading && hasMore && notifications.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={handleLoadMore}
                            className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-colors font-medium shadow-sm"
                        >
                            Cargar más eventos
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
