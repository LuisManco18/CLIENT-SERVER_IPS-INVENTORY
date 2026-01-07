import React from 'react';
import { GripVertical } from 'lucide-react';
import AssetIcon from './AssetIcon';

export default function UnassignedAssetsList({ assets, onDragStart }) {
    return (
        <div className="mt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Sin Asignar
                </h3>
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                    {assets.length}
                </span>
            </div>

            {/* Subtitle */}
            <p className="text-xs text-gray-500 mb-3">Arrastrar para ubicar</p>

            {/* Assets list */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {assets.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        <p>Todos los equipos están asignados</p>
                    </div>
                ) : (
                    assets.map((asset) => (
                        <div
                            key={asset.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, asset)}
                            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-blue hover:shadow-md transition-all cursor-move group"
                        >
                            {/* Drag handle */}
                            <GripVertical
                                size={16}
                                className="text-gray-400 group-hover:text-primary-blue transition-colors"
                            />

                            {/* Asset icon */}
                            <div className="flex-shrink-0">
                                <AssetIcon
                                    tipo={asset.icono_tipo}
                                    isOnline={asset.is_online}
                                    size={20}
                                />
                            </div>

                            {/* Asset info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-gray-900 truncate">
                                    {asset.hostname || asset.serial_number}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {asset.marca || 'Unknown'} {asset.memoria_ram || ''}
                                </div>
                            </div>

                            {/* Status indicator */}
                            <div className={`w-2 h-2 rounded-full ${asset.is_online ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
