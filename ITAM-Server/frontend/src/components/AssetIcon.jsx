import React from 'react';
import { Monitor, Laptop, Server } from 'lucide-react';

/**
 * AssetIcon Component
 * Renders a PC icon with online/offline status indicator
 * Supports different asset types: desktop, laptop, server
 */
export default function AssetIcon({
    tipo = 'desktop',
    isOnline = false,
    size = 24,
    className = '',
    showPulse = true
}) {
    const IconComponent = {
        desktop: Monitor,
        laptop: Laptop,
        server: Server
    }[tipo] || Monitor;

    return (
        <div className={`relative inline-flex ${className}`}>
            {/* Icon */}
            <div className={`
        p-2 rounded-full border-2 transition-all duration-300
        ${isOnline
                    ? 'bg-white border-green-500 shadow-lg'
                    : 'bg-gray-100 border-gray-400 opacity-75'
                }
      `}>
                <IconComponent
                    size={size}
                    className={isOnline ? 'text-gray-700' : 'text-gray-500'}
                />
            </div>

            {/* Status Indicator */}
            <div className={`
        absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
        ${isOnline ? 'bg-green-500' : 'bg-red-500'}
        ${isOnline && showPulse ? 'animate-pulse' : ''}
      `} />

            {/* Glow effect for online assets */}
            {isOnline && (
                <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 blur-md -z-10" />
            )}
        </div>
    );
}
