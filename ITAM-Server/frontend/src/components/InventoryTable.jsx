import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Monitor } from 'lucide-react';

export default function InventoryTable() {
    const [activos, setActivos] = useState([]);

    useEffect(() => {
        // Conexión directa al backend
        axios.get("http://localhost:8000/api/assets")
            .then(res => setActivos(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="bg-gray-50 uppercase text-xs text-gray-700">
                    <tr>
                        <th className="px-6 py-3">Hostname</th>
                        <th className="px-6 py-3">Usuario</th>
                        <th className="px-6 py-3">Hardware</th>
                        <th className="px-6 py-3">IP</th>
                    </tr>
                </thead>
                <tbody>
                    {activos.map(pc => (
                        <tr key={pc.id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-bold flex gap-2 items-center">
                                <Monitor size={16} className="text-blue-500" />
                                {pc.hostname}
                            </td>
                            <td className="px-6 py-4">{pc.usuario_detectado}</td>
                            <td className="px-6 py-4">{pc.memoria_ram} - {pc.procesador}</td>
                            <td className="px-6 py-4 font-mono text-xs">{pc.ip_address}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}