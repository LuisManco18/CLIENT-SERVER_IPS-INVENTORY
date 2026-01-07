import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InventoryTable from './components/InventoryTable';
import MapView from './components/MapView';
import StatsWidget from './components/StatsWidget';
import FloorManager from './components/FloorManager';
import { LayoutDashboard, Map, Bell, Moon, Download, Plus } from 'lucide-react';

function App() {
  const [vista, setVista] = useState('logica');
  const [showFloorManager, setShowFloorManager] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{
          background: 'var(--gradient-header)',
          borderRadius: '1rem',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Logo and Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                backdropFilter: 'blur(10px)'
              }}>
                <LayoutDashboard size={28} color="white" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: 'white' }}>
                  ITAM System
                </h1>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  IT Asset Management Platform
                </p>
              </div>
            </div>

            {/* Navigation and Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Navigation Pills */}
              <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.375rem',
                borderRadius: '0.75rem',
                gap: '0.5rem'
              }}>
                <button
                  onClick={() => setVista('logica')}
                  style={{
                    padding: '0.625rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: vista === 'logica' ? 'white' : 'transparent',
                    color: vista === 'logica' ? 'var(--primary-blue)' : 'white'
                  }}
                >
                  📋 Inventory
                </button>
                <button
                  onClick={() => setVista('fisica')}
                  style={{
                    padding: '0.625rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: vista === 'fisica' ? 'white' : 'transparent',
                    color: vista === 'fisica' ? 'var(--primary-blue)' : 'white'
                  }}
                >
                  🗺️ Physical Map
                </button>
              </div>

              {/* Right Icons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.625rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bell size={20} color="white" />
                </button>
                <button style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.625rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Moon size={20} color="white" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Overview Section - Only show in Inventory view */}
        {vista === 'logica' && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Dashboard Overview
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Real-time monitoring and asset tracking.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{
                  padding: '0.625rem 1.25rem',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '0.5rem',
                  background: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  <Download size={16} />
                  Export Report
                </button>
                <button style={{
                  padding: '0.625rem 1.25rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: 'var(--primary-blue)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white'
                }}>
                  <Plus size={16} />
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Widget */}
        {vista === 'logica' && <StatsWidget />}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {vista === 'logica' ? (
            <motion.div
              key="logica"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <InventoryTable />
            </motion.div>
          ) : (
            <motion.div
              key="fisica"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <MapView onOpenFloorManager={() => setShowFloorManager(true)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floor Manager Modal */}
        <FloorManager
          isOpen={showFloorManager}
          onClose={() => setShowFloorManager(false)}
          onFloorCreated={() => {
            // Refresh map view if needed
          }}
        />
      </div>
    </div>
  );
}

export default App;