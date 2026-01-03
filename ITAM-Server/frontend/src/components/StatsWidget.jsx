import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity, AlertCircle, Monitor, Server } from 'lucide-react';

export default function StatsWidget() {
    const [stats, setStats] = useState({
        total: 0,
        online: 0,
        offline: 0,
        en_dominio: 0,
        alertas: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        // Actualizar cada 30 segundos
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/assets/stats');
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Equipos',
            value: stats.total,
            icon: Monitor,
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Online',
            value: stats.online,
            icon: Activity,
            gradient: 'from-green-500 to-emerald-500',
            bgGradient: 'from-green-50 to-emerald-50',
            iconColor: 'text-green-600',
            trend: stats.online > stats.offline ? 'up' : 'down'
        },
        {
            title: 'Offline',
            value: stats.offline,
            icon: AlertCircle,
            gradient: 'from-red-500 to-orange-500',
            bgGradient: 'from-red-50 to-orange-50',
            iconColor: 'text-red-600'
        },
        {
            title: 'En Dominio',
            value: stats.en_dominio,
            icon: Server,
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50 to-pink-50',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Alertas',
            value: stats.alertas,
            icon: AlertCircle,
            gradient: 'from-yellow-500 to-amber-500',
            bgGradient: 'from-yellow-50 to-amber-50',
            iconColor: 'text-yellow-600',
            pulse: stats.alertas > 0
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton h-32 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {statCards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
            relative overflow-hidden rounded-xl shadow-lg
            bg-gradient-to-br ${card.bgGradient}
            border border-white/50
            card-hover
            ${card.pulse ? 'animate-pulse' : ''}
          `}
                >
                    {/* Gradient overlay */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full -mr-16 -mt-16`} />

                    <div className="relative p-6">
                        {/* Icon */}
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-white/80 shadow-md ${card.iconColor}`}>
                                <card.icon size={24} />
                            </div>

                            {/* Trend indicator */}
                            {card.trend && (
                                <div className={`flex items-center gap-1 text-sm font-semibold ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {card.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                </div>
                            )}
                        </div>

                        {/* Value */}
                        <div className="space-y-1">
                            <motion.div
                                key={card.value}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-bold text-gray-800"
                            >
                                {card.value}
                            </motion.div>
                            <div className="text-sm font-medium text-gray-600">
                                {card.title}
                            </div>
                        </div>
                    </div>

                    {/* Bottom accent */}
                    <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
                </motion.div>
            ))}
        </div>
    );
}