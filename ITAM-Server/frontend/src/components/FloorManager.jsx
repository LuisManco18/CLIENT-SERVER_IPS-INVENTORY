import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Plus, Trash2, Edit } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

/**
 * FloorManager Component
 * Modal for managing floor plans - create, edit, delete floors and upload images
 */
export default function FloorManager({ isOpen, onClose, onFloorCreated }) {
    const [pisos, setPisos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingFloor, setEditingFloor] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        nivel: 1,
        edificio_id: 1,
        mapa_imagen: null,
        mapa_filename: null
    });

    const API_URL = 'http://localhost:8000/api/floors';

    // Load floors when modal opens
    React.useEffect(() => {
        if (isOpen) {
            loadFloors();
        }
    }, [isOpen]);

    const loadFloors = async () => {
        try {
            const response = await axios.get(API_URL);
            setPisos(response.data);
        } catch (error) {
            console.error('Error loading floors:', error);
        }
    };

    // Dropzone for image upload
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    setFormData(prev => ({
                        ...prev,
                        mapa_imagen: reader.result,
                        mapa_filename: file.name
                    }));
                };
                reader.readAsDataURL(file);
            }
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingFloor) {
                // Update existing floor
                await axios.put(`${API_URL}/${editingFloor.id}`, formData);
            } else {
                // Create new floor
                await axios.post(API_URL, formData);
            }

            loadFloors();
            resetForm();
            if (onFloorCreated) onFloorCreated();
        } catch (error) {
            console.error('Error saving floor:', error);
            alert('Error al guardar el piso: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (pisoId) => {
        if (!confirm('¿Estás seguro de eliminar este piso?')) return;

        try {
            await axios.delete(`${API_URL}/${pisoId}`);
            loadFloors();
            if (onFloorCreated) onFloorCreated();
        } catch (error) {
            alert('Error al eliminar: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleEdit = (piso) => {
        setEditingFloor(piso);
        setFormData({
            nombre: piso.nombre,
            nivel: piso.nivel,
            edificio_id: piso.edificio_id,
            mapa_imagen: null,
            mapa_filename: piso.mapa_filename
        });
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            nivel: 1,
            edificio_id: 1,
            mapa_imagen: null,
            mapa_filename: null
        });
        setEditingFloor(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="gradient-primary p-6 text-white flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Gestión de Pisos</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="mb-8 glass p-6 rounded-xl">
                            <h3 className="text-lg font-semibold mb-4">
                                {editingFloor ? 'Editar Piso' : 'Nuevo Piso'}
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                        placeholder="Ej: Piso 1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Nivel</label>
                                    <input
                                        type="number"
                                        value={formData.nivel}
                                        onChange={(e) => setFormData({ ...formData, nivel: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Plano del Piso</label>
                                <div
                                    {...getRootProps()}
                                    className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                    ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'}
                  `}
                                >
                                    <input {...getInputProps()} />
                                    {formData.mapa_imagen ? (
                                        <div className="space-y-2">
                                            <img
                                                src={formData.mapa_imagen}
                                                alt="Preview"
                                                className="max-h-40 mx-auto rounded-lg shadow-md"
                                            />
                                            <p className="text-sm text-gray-600">{formData.mapa_filename}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload className="mx-auto text-gray-400" size={48} />
                                            <p className="text-gray-600">
                                                {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic para seleccionar'}
                                            </p>
                                            <p className="text-sm text-gray-400">PNG, JPG, GIF hasta 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 btn-premium gradient-primary text-white disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : (editingFloor ? 'Actualizar' : 'Crear Piso')}
                                </button>

                                {editingFloor && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Floor List */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Pisos Existentes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pisos.map((piso) => (
                                    <motion.div
                                        key={piso.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass p-4 rounded-xl card-hover"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-lg">{piso.nombre}</h4>
                                                <p className="text-sm text-gray-600">Nivel {piso.nivel}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(piso)}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} className="text-red-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(piso.id)}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} className="text-red-600" />
                                                </button>
                                            </div>
                                        </div>

                                        {piso.mapa_filename && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <ImageIcon size={14} />
                                                <span>{piso.mapa_filename}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
