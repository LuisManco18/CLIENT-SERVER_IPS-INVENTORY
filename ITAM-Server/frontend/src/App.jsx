import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InventoryTable from './components/InventoryTable';
import MapView from './components/MapView';
import StatsWidget from './components/StatsWidget';
import FloorManager from './components/FloorManager';
import { LayoutDashboard, Map, Settings, Building2 } from 'lucide-react';

function App() {
  const [vista, setVista] = useState('logica');
  const [showFloorManager, setShowFloorManager] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 glass rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="gradient-primary p-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Logo and Title */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <LayoutDashboard size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">ITAM System</h1>
                  <p className="text-blue-100 text-sm">IT Asset Management Platform</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-3">
                <div className="flex bg-white/10 backdrop-blur-sm p-1.5 rounded-xl">
                  <button
                    onClick={() => setVista('logica')}
                    className={`
                      px-6 py-2.5 rounded-lg flex gap-2 items-center text-sm font-semibold
                      transition-all duration-300
                      ${vista === 'logica'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <LayoutDashboard size={18} />
                    Inventario
                  </button>
                  <button
                    onClick={() => setVista('fisica')}
                    className={`
                      px-6 py-2.5 rounded-lg flex gap-2 items-center text-sm font-semibold
                      transition-all duration-300
                      ${vista === 'fisica'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Map size={18} />
                    Mapa Físico
                  </button>
                </div>

                {/* Settings Button */}
                <button
                  onClick={() => setShowFloorManager(true)}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
                  title="Gestionar Pisos"
                >
                  <Building2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Stats Widget - Only in Inventory View */}
        <AnimatePresence mode="wait">
          {vista === 'logica' && <StatsWidget key="stats" />}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={vista}
            initial={{ opacity: 0, x: vista === 'logica' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: vista === 'logica' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {vista === 'logica' ? <InventoryTable /> : <MapView />}
          </motion.main>
        </AnimatePresence>

        {/* Floor Manager Modal */}
        <FloorManager
          isOpen={showFloorManager}
          onClose={() => setShowFloorManager(false)}
          onFloorCreated={() => {
            // Refresh data if needed
          }}
        />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-600"
        >
          <div className="glass px-6 py-4 rounded-xl inline-block">
            <p>
              ITAM System v1.0 - Plataforma de Gestión de Activos TI
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Monitoreo en tiempo real • Mapas interactivos • Inventario automatizado
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;