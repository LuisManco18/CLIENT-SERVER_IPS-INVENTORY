import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    Printer, RefreshCw, Search, Calendar, BarChart3,
    FileText, User, Laptop, MapPin, Hash, Trophy, Download
} from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from '../config';

const API_URL = API_ENDPOINTS.PRINT_STATS;

const PrinterPanel = () => {
    const [ranking, setRanking] = useState([]);
    const [dailyReport, setDailyReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("ranking"); // "ranking" or "daily"

    // Date range state
    const today = new Date().toISOString().split('T')[0];
    const [fechaInicio, setFechaInicio] = useState(today);
    const [fechaFin, setFechaFin] = useState(today);
    const [activePreset, setActivePreset] = useState("today");

    const printRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [fechaInicio, fechaFin]);

    const applyPreset = (preset) => {
        setActivePreset(preset);
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (preset === "today") {
            setFechaInicio(todayStr);
            setFechaFin(todayStr);
        } else if (preset === "week") {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            setFechaInicio(weekAgo.toISOString().split('T')[0]);
            setFechaFin(todayStr);
        } else if (preset === "month") {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            setFechaInicio(firstDay.toISOString().split('T')[0]);
            setFechaFin(todayStr);
        } else if (preset === "all") {
            setFechaInicio("");
            setFechaFin("");
        }
    };

    const handleDateChange = (field, value) => {
        setActivePreset("custom");
        if (field === "inicio") setFechaInicio(value);
        else setFechaFin(value);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            let queryParams = "";
            if (fechaInicio && fechaFin) {
                queryParams = `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
            }

            const requests = [
                axios.get(`${API_URL}/ranking${queryParams}`)
            ];

            // Only fetch daily report if we have a date range
            if (fechaInicio && fechaFin) {
                requests.push(
                    axios.get(`${API_URL}/daily-report?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`)
                );
            }

            const results = await Promise.all(requests);
            setRanking(results[0].data);
            if (results[1]) {
                setDailyReport(results[1].data);
            } else {
                setDailyReport([]);
            }
        } catch (error) {
            console.error("Error fetching print data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRanking = ranking.filter(item => {
        if (item.total_pages === 0 && item.total_jobs === 0) return false;
        const term = searchTerm.toLowerCase();
        return (
            (item.hostname && item.hostname.toLowerCase().includes(term)) ||
            (item.ip_address && item.ip_address.includes(term)) ||
            (item.area && item.area.toLowerCase().includes(term)) ||
            (item.usuario_detectado && item.usuario_detectado.toLowerCase().includes(term)) ||
            (item.usuario_nombre_completo && item.usuario_nombre_completo.toLowerCase().includes(term))
        );
    });

    const filteredDaily = dailyReport.filter(item => {
        const term = searchTerm.toLowerCase();
        return (
            (item.hostname && item.hostname.toLowerCase().includes(term)) ||
            (item.area && item.area.toLowerCase().includes(term)) ||
            (item.usuario_detectado && item.usuario_detectado.toLowerCase().includes(term)) ||
            (item.usuario_nombre_completo && item.usuario_nombre_completo.toLowerCase().includes(term))
        );
    });

    const handlePrint = () => {
        const data = viewMode === "daily" ? filteredDaily : filteredRanking;
        const rangeLabel = fechaInicio && fechaFin
            ? (fechaInicio === fechaFin ? fechaInicio : `${fechaInicio} al ${fechaFin}`)
            : "Histórico";

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Reporte de Impresiones - ${rangeLabel}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    h1 { font-size: 18px; color: #8B0000; margin-bottom: 4px; }
                    .subtitle { font-size: 12px; color: #666; margin-bottom: 16px; }
                    table { width: 100%; border-collapse: collapse; font-size: 11px; }
                    th { background: #8B0000; color: white; padding: 8px 6px; text-align: left; font-weight: 600; }
                    td { padding: 6px; border-bottom: 1px solid #ddd; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .text-right { text-align: right; }
                    .bold { font-weight: bold; }
                    .footer { margin-top: 20px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
                    .totals { margin-top: 12px; font-size: 12px; font-weight: bold; }
                    @media print { body { margin: 10px; } }
                </style>
            </head>
            <body>
                <h1>📊 Reporte de Impresiones por Computadora</h1>
                <div class="subtitle">Período: ${rangeLabel} | Generado: ${new Date().toLocaleString()}</div>
                <table>
                    <thead>
                        <tr>
                            ${viewMode === "daily" ? '<th>Fecha</th>' : '<th>#</th>'}
                            <th>Hostname</th>
                            <th>Usuario</th>
                            <th>Área</th>
                            <th>Sede / Piso</th>
                            <th class="text-right">Trabajos</th>
                            <th class="text-right">Páginas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((item, i) => `
                            <tr>
                                <td>${viewMode === "daily" ? item.fecha : (i + 1)}</td>
                                <td class="bold">${item.hostname || '-'}</td>
                                <td>${item.usuario_nombre_completo || item.usuario_detectado || '-'}</td>
                                <td>${item.area || '-'}</td>
                                <td>${item.edificio_nombre ? `${item.edificio_nombre} - ${item.piso_nombre || ''}` : (item.piso_nombre || '-')}</td>
                                <td class="text-right">${item.total_jobs.toLocaleString()}</td>
                                <td class="text-right bold">${item.total_pages.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totals">
                    Total: ${data.reduce((a, c) => a + c.total_pages, 0).toLocaleString()} páginas | 
                    ${data.reduce((a, c) => a + c.total_jobs, 0).toLocaleString()} trabajos |
                    ${data.length} registros
                </div>
                <div class="footer">Sistema ITAM - Inventario Tecnológico</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    const getDateLabel = () => {
        if (!fechaInicio && !fechaFin) return "Histórico completo";
        if (fechaInicio === fechaFin) return `Día: ${fechaInicio}`;
        return `Del ${fechaInicio} al ${fechaFin}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg">
                                <BarChart3 className="text-white" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Impresiones por Computadora</h2>
                                <p className="text-sm text-gray-500">{getDateLabel()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrint}
                                disabled={loading || (viewMode === "daily" ? filteredDaily.length === 0 : filteredRanking.length === 0)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-700 to-red-800 text-white rounded-lg hover:shadow-lg transition-all shadow-sm font-medium disabled:opacity-50"
                            >
                                <Download size={18} />
                                Imprimir Reporte
                            </button>
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <RefreshCw size={18} className={loading ? "animate-spin text-red-600" : "text-gray-500"} />
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50/50">
                    <StatCard
                        icon={<FileText size={24} />}
                        label="Total Páginas"
                        value={ranking.reduce((acc, curr) => acc + curr.total_pages, 0).toLocaleString()}
                        color="blue"
                    />
                    <StatCard
                        icon={<Printer size={24} />}
                        label="Trabajos Enviados"
                        value={ranking.reduce((acc, curr) => acc + curr.total_jobs, 0).toLocaleString()}
                        color="purple"
                    />
                    <StatCard
                        icon={<Laptop size={24} />}
                        label="PCs Activas (Imprimiendo)"
                        value={ranking.filter(r => r.total_pages > 0).length.toString()}
                        color="orange"
                    />
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[250px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por hostname, IP, área o usuario..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        {[
                            { key: "today", label: "Hoy" },
                            { key: "week", label: "Semana" },
                            { key: "month", label: "Mes" },
                            { key: "all", label: "Todo" }
                        ].map(p => (
                            <button
                                key={p.key}
                                onClick={() => applyPreset(p.key)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activePreset === p.key ? "bg-white text-red-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Range Pickers */}
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => handleDateChange("inicio", e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <span className="text-gray-400 text-sm">→</span>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => handleDateChange("fin", e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("ranking")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "ranking" ? "bg-white text-red-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            Ranking
                        </button>
                        <button
                            onClick={() => setViewMode("daily")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "daily" ? "bg-white text-red-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            Por Día
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden" ref={printRef}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            <tr>
                                {viewMode === "daily" ? (
                                    <th className="px-6 py-4">Fecha</th>
                                ) : (
                                    <th className="px-6 py-4 w-16 text-center">Rank</th>
                                )}
                                <th className="px-6 py-4">Hostname</th>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Área</th>
                                <th className="px-6 py-4">Sede / Piso</th>
                                <th className="px-6 py-4 text-right">Trabajos</th>
                                <th className="px-6 py-4 text-right">Páginas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && ranking.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <RefreshCw className="animate-spin h-8 w-8 text-red-600 mx-auto mb-4" />
                                        Cargando estadísticas...
                                    </td>
                                </tr>
                            ) : (viewMode === "daily" ? filteredDaily : filteredRanking).length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="font-medium text-gray-600">No hay registros de impresión</p>
                                        <p className="text-sm">Intenta cambiar los filtros de búsqueda o fecha.</p>
                                    </td>
                                </tr>
                            ) : viewMode === "daily" ? (
                                filteredDaily.map((item, index) => (
                                    <motion.tr
                                        key={`${item.fecha}-${item.activo_id}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-red-50/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                                <Calendar size={12} />
                                                {item.fecha}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center text-red-700">
                                                    <Laptop size={16} />
                                                </div>
                                                <span className="font-bold text-gray-800">{item.hostname}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-800">{item.usuario_detectado || '-'}</span>
                                                {item.usuario_nombre_completo && item.usuario_nombre_completo !== item.usuario_detectado && (
                                                    <span className="text-xs text-gray-500">{item.usuario_nombre_completo}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <MapPin size={14} className="text-gray-400" />
                                                {item.area || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.edificio_nombre ? `${item.edificio_nombre} - ${item.piso_nombre || ''}` : (item.piso_nombre || '-')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-600">
                                            {item.total_jobs.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="inline-flex px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold text-sm">
                                                {item.total_pages.toLocaleString()} pág
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                filteredRanking.map((item, index) => (
                                    <motion.tr
                                        key={item.activo_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-red-50/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {index === 0 ? (
                                                <Trophy className="inline text-yellow-500" size={20} />
                                            ) : index === 1 ? (
                                                <Trophy className="inline text-gray-400" size={20} />
                                            ) : index === 2 ? (
                                                <Trophy className="inline text-amber-600" size={20} />
                                            ) : (
                                                <span className="font-bold text-gray-400">#{index + 1}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center text-red-700">
                                                    <Laptop size={16} />
                                                </div>
                                                <span className="font-bold text-gray-800">{item.hostname}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-800">{item.usuario_detectado || '-'}</span>
                                                {item.usuario_nombre_completo && item.usuario_nombre_completo !== item.usuario_detectado && (
                                                    <span className="text-xs text-gray-500">{item.usuario_nombre_completo}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <MapPin size={14} className="text-gray-400" />
                                                {item.area || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.edificio_nombre ? `${item.edificio_nombre} - ${item.piso_nombre || ''}` : (item.piso_nombre || '-')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-600">
                                            {item.total_jobs.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="inline-flex px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold text-sm">
                                                {item.total_pages.toLocaleString()} pág
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer totals */}
                {(viewMode === "daily" ? filteredDaily : filteredRanking).length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            {(viewMode === "daily" ? filteredDaily : filteredRanking).length} registros
                        </span>
                        <div className="flex items-center gap-6 text-sm">
                            <span className="text-gray-600">
                                Total Trabajos: <strong>{(viewMode === "daily" ? filteredDaily : filteredRanking).reduce((a, c) => a + c.total_jobs, 0).toLocaleString()}</strong>
                            </span>
                            <span className="text-red-700 font-bold">
                                Total Páginas: {(viewMode === "daily" ? filteredDaily : filteredRanking).reduce((a, c) => a + c.total_pages, 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Subcomponente
const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        purple: "from-purple-500 to-purple-600",
        orange: "from-orange-500 to-orange-600",
        red: "from-red-500 to-red-600"
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <div className={`p-2 bg-gradient-to-br ${colorClasses[color]} rounded-lg text-white`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                </div>
            </div>
        </div>
    );
};

export default PrinterPanel;
