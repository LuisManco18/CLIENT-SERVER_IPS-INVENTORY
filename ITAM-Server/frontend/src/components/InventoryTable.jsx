import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import AssetIcon from './AssetIcon';
import useRealTimeAssets from '../hooks/useRealTimeAssets';
import { format } from 'date-fns';

export default function InventoryTable() {
    const { activos, loading, lastUpdate } = useRealTimeAssets();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'hostname', direction: 'asc' });
    const [filterStatus, setFilterStatus] = useState('all'); // all, online, offline

    // Filter and sort assets
    const filteredActivos = activos
        .filter(pc => {
            const matchesSearch =
                pc.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pc.usuario_detectado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pc.ip_address?.includes(searchTerm);

            const matchesStatus =
                filterStatus === 'all' ? true :
                    filterStatus === 'online' ? pc.is_online :
                        !pc.is_online;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const aVal = a[sortConfig.key] || '';
            const bVal = b[sortConfig.key] || '';

            if (sortConfig.direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const exportToCSV = () => {
        const headers = ['Hostname', 'Usuario', 'IP', 'Hardware', 'Estado', 'Dominio'];
        const rows = filteredActivos.map(pc => [
            pc.hostname,
            pc.usuario_detectado,
            pc.ip_address,
            `${pc.memoria_ram} - ${pc.procesador}`,
            pc.is_online ? 'Online' : 'Offline',
            pc.es_dominio ? 'Sí' : 'No'
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return null;
        return sortConfig.direction === 'asc' ?
            <ChevronUp size={16} className="inline" /> :
            <ChevronDown size={16} className="inline" />;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton h-16 rounded-lg" />
                    ))}
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
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por hostname, usuario o IP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Todos</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>

                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download size={18} />
                            Exportar CSV
                        </button>
                    </div>
                </div>

                {/* Last update indicator */}
                {lastUpdate && (
                    <div className="mt-3 text-sm text-gray-500">
                        Última actualización: {format(lastUpdate, 'HH:mm:ss')}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Estado
                            </th>
                            <th
                                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('hostname')}
                            >
                                Hostname <SortIcon column="hostname" />
                            </th>
                            <th
                                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('usuario_detectado')}
                            >
                                Usuario <SortIcon column="usuario_detectado" />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Hardware
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                IP
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Dominio
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredActivos.map((pc, index) => (
                            <motion.tr
                                key={pc.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <AssetIcon
                                            tipo={pc.icono_tipo}
                                            isOnline={pc.is_online}
                                            size={20}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-900">{pc.hostname}</div>
                                    <div className="text-sm text-gray-500">{pc.serial_number}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-900">{pc.usuario_detectado}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">{pc.memoria_ram}</div>
                                        <div className="text-gray-500 truncate max-w-xs">{pc.procesador}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{pc.ip_address}</code>
                                </td>
                                <td className="px-6 py-4">
                                    {pc.es_dominio ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            Dominio
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Local
                                        </span>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filteredActivos.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No se encontraron equipos que coincidan con los filtros
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                    Mostrando <span className="font-semibold">{filteredActivos.length}</span> de{' '}
                    <span className="font-semibold">{activos.length}</span> equipos
                </div>
            </div>
        </motion.div>
    );
}