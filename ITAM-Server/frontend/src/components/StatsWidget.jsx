import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Activity, AlertCircle, Monitor, Server, Wifi, WifiOff } from 'lucide-react';

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
            title: 'Total Assets',
            value: stats.total,
            icon: Monitor,
            iconBgColor: 'var(--icon-bg-blue)',
            iconColor: 'var(--icon-blue)',
            subtitle: '+12 this week',
            subtitleColor: 'var(--status-online)'
        },
        {
            title: 'Online',
            value: stats.online,
            icon: Wifi,
            iconBgColor: 'var(--icon-bg-green)',
            iconColor: 'var(--icon-green)',
            subtitle: '92% Availability',
            subtitleColor: 'var(--text-secondary)'
        },
        {
            title: 'Offline',
            value: stats.offline,
            icon: WifiOff,
            iconBgColor: 'var(--icon-bg-gray)',
            iconColor: 'var(--icon-gray)',
            subtitle: 'Last check: 2 mins ago',
            subtitleColor: 'var(--text-secondary)'
        },
        {
            title: 'Critical Alerts',
            value: stats.alertas,
            icon: AlertCircle,
            iconBgColor: 'var(--icon-bg-red)',
            iconColor: 'var(--icon-red)',
            subtitle: 'Requires attention',
            subtitleColor: 'var(--status-offline)'
        }
    ];

    if (loading) {
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} style={{
                        height: '140px',
                        background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                        borderRadius: '0.75rem'
                    }} />
                ))}
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
        }}>
            {statCards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                        background: 'var(--bg-card)',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow-md)',
                        border: '1px solid var(--border-light)',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {/* Icon */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            backgroundColor: card.iconBgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <card.icon size={24} style={{ color: card.iconColor }} />
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: 'var(--text-secondary)'
                        }}>
                            {card.title}
                        </div>
                        <motion.div
                            key={card.value}
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)',
                                lineHeight: '1'
                            }}
                        >
                            {card.value.toLocaleString()}
                        </motion.div>
                        {card.subtitle && (
                            <div style={{
                                fontSize: '0.75rem',
                                color: card.subtitleColor,
                                fontWeight: card.title === 'Critical Alerts' && card.value > 0 ? '600' : '400'
                            }}>
                                {card.subtitle}
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}