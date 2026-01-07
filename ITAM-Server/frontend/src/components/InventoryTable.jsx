import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import AssetIcon from './AssetIcon';
import Pagination from './Pagination';
import useRealTimeAssets from '../hooks/useRealTimeAssets';
import { format } from 'date-fns';

export default function InventoryTable() {
    const { activos, loading, lastUpdate } = useRealTimeAssets();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'hostname', direction: 'asc' });
    const [filterStatus, setFilterStatus] = useState('all'); // all, online, offline
    const [filterLocation, setFilterLocation] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Get unique locations
    const locations = ['all', ...new Set(activos.map(a => a.piso_id).filter(Boolean))];

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

            const matchesLocation =
                filterLocation === 'all' ? true :
                    pc.piso_id === parseInt(filterLocation);

            return matchesSearch && matchesStatus && matchesLocation;
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

    // Pagination calculations
    const totalPages = Math.ceil(filteredActivos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredActivos.length);
    const paginatedActivos = filteredActivos.slice(startIndex, endIndex);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const exportToCSV = () => {
        const headers = ['Status', 'Hostname', 'User/Dept', 'IP Address', 'MAC Address', 'Hardware', 'OS'];
        const rows = filteredActivos.map(pc => [
            pc.is_online ? 'Online' : 'Offline',
            pc.hostname,
            pc.usuario_detectado,
            pc.ip_address,
            pc.mac_address,
            `${pc.marca || ''} ${pc.memoria_ram || ''} - ${pc.procesador || ''}`,
            pc.sistema_operativo
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
            <ChevronUp size={16} className="inline ml-1" /> :
            <ChevronDown size={16} className="inline ml-1" />;
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
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by hostname, user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all font-medium bg-white"
                        >
                            <option value="all">All Statuses</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>

                        <select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all font-medium bg-white"
                        >
                            <option value="all">All Locations</option>
                            {locations.filter(l => l !== 'all').map(loc => (
                                <option key={loc} value={loc}>Floor {loc}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Status
                            </th>
                            <th
                                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('hostname')}
                            >
                                Hostname <SortIcon column="hostname" />
                            </th>
                            <th
                                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('usuario_detectado')}
                            >
                                User / Dept <SortIcon column="usuario_detectado" />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Network Info
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Hardware
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                OS
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedActivos.map((pc, index) => (
                            <motion.tr
                                key={pc.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                {/* Status */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {pc.is_online ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                Online
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                Offline
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Hostname */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <AssetIcon
                                            tipo={pc.icono_tipo}
                                            isOnline={pc.is_online}
                                            size={20}
                                        />
                                        <div>
                                            <div className="font-semibold text-gray-900">{pc.hostname}</div>
                                            <div className="text-sm text-gray-500">IT Dept</div>
                                        </div>
                                    </div>
                                </td>

                                {/* User / Dept */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center text-xs font-semibold">
                                            {pc.usuario_detectado?.substring(0, 2).toUpperCase() || 'JD'}
                                        </div>
                                        <div className="text-gray-900 font-medium">{pc.usuario_detectado || 'Unknown'}</div>
                                    </div>
                                </td>

                                {/* Network Info */}
                                <td className="px-6 py-4">
                                    <div className="text-sm space-y-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500 text-xs">IP:</span>
                                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{pc.ip_address}</code>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500 text-xs">MAC:</span>
                                            <code className="text-xs text-gray-600">{pc.mac_address || '00:11:44:11:3A:B7'}</code>
                                        </div>
                                    </div>
                                </td>

                                {/* Hardware */}
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">
                                            {pc.marca || 'Dell'} {pc.memoria_ram ? `/ ${pc.memoria_ram}` : '/ 16GB RAM'}
                                        </div>
                                        <div className="text-gray-500 truncate max-w-[200px]">
                                            {pc.procesador ? pc.procesador.substring(0, 30) + '...' : 'Intel Core i7'}
                                        </div>
                                    </div>
                                </td>

                                {/* OS */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5B5FED">
                                                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                                            </svg>
                                        </div>
                                        <div className="text-sm text-gray-900">
                                            {pc.sistema_operativo || 'Windows 11 Pro'}
                                        </div>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                                        <MoreVertical size={18} className="text-gray-500" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filteredActivos.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No assets found matching your filters
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredActivos.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={filteredActivos.length}
                    itemsPerPage={itemsPerPage}
                    startItem={startIndex + 1}
                    endItem={endIndex}
                />
            )}
        </motion.div>
    );
}