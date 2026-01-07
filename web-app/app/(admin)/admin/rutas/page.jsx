'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Clock, Gauge, Route, Edit2, Trash2, X } from 'lucide-react';

export default function RutasPage() {
    const [rutas, setRutas] = useState([]);
    const [agencias, setAgencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    // Modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [rutaToEdit, setRutaToEdit] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        id_agencia_origen: '',
        id_agencia_destino: '',
        distancia_km: '',
        tiempo_estimado_min: '',
        tipo: 'principal'
    });

    useEffect(() => {
        fetchRutas();
        fetchAgencias();
    }, []);

    const fetchRutas = async () => {
        try {
            const res = await fetch('/api/admin/rutas');
            const data = await res.json();
            if (Array.isArray(data)) {
                setRutas(data);
            }
        } catch (error) {
            console.error('Error cargando rutas:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgencias = async () => {
        try {
            const res = await fetch('/api/admin/agencias');
            const data = await res.json();
            if (Array.isArray(data)) {
                setAgencias(data);
            }
        } catch (error) {
            console.error('Error cargando agencias:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/rutas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                alert('Ruta creada exitosamente');
                setShowCreateModal(false);
                resetForm();
                fetchRutas();
            } else {
                alert(data.error || 'Error al crear la ruta');
            }
        } catch (error) {
            alert('Error al crear la ruta');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/rutas', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_ruta: rutaToEdit.id_ruta,
                    distancia_km: formData.distancia_km,
                    tiempo_estimado_min: formData.tiempo_estimado_min,
                    tipo: formData.tipo
                })
            });

            if (res.ok) {
                alert('Ruta actualizada exitosamente');
                setShowEditModal(false);
                setRutaToEdit(null);
                resetForm();
                fetchRutas();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al actualizar la ruta');
            }
        } catch (error) {
            alert('Error al actualizar la ruta');
        }
    };

    const handleDelete = async (ruta) => {
        if (!confirm(`¿Eliminar la ruta ${ruta.agencia_origen} → ${ruta.agencia_destino}?\n\nEsto también eliminará las tarifas asociadas.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/rutas?id=${ruta.id_ruta}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message || 'Ruta eliminada exitosamente');
                fetchRutas();
            } else {
                alert(data.error || 'Error al eliminar la ruta');
            }
        } catch (error) {
            alert('Error al eliminar la ruta');
        }
    };

    const openEditModal = (ruta) => {
        setRutaToEdit(ruta);
        setFormData({
            distancia_km: ruta.distancia_km,
            tiempo_estimado_min: ruta.tiempo_estimado_min,
            tipo: ruta.tipo
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            id_agencia_origen: '',
            id_agencia_destino: '',
            distancia_km: '',
            tiempo_estimado_min: '',
            tipo: 'principal'
        });
    };

    const filteredRutas = rutas.filter(r => {
        const matchesSearch =
            r.agencia_origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.agencia_destino?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || r.tipo === selectedType;
        return matchesSearch && matchesType;
    });

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${mins}m`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Route className="text-blue-600 w-8 h-8" />
                        </div>
                        Gestión de Rutas
                    </h1>
                    <p className="text-gray-600 mt-1">Red logística de conexiones entre agencias</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" /> Nueva Ruta
                </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Route className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Rutas</p>
                            <p className="text-2xl font-bold text-gray-900">{rutas.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Principales</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {rutas.filter(r => r.tipo === 'principal').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Gauge className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Secundarias</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {rutas.filter(r => r.tipo === 'secundaria').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por agencia..."
                            className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-gray-900 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-gray-900 transition"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="principal">Principal</option>
                        <option value="secundaria">Secundaria</option>
                    </select>
                </div>
            </div>

            {/* Cards de rutas */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Cargando rutas...</p>
                </div>
            ) : filteredRutas.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No se encontraron rutas</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRutas.map((ruta) => (
                        <div
                            key={ruta.id_ruta}
                            className="bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition group"
                        >
                            {/* Header */}
                            <div className={`p-4 border-b-2 ${ruta.tipo === 'principal'
                                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                                    : 'bg-gradient-to-r from-green-50 to-teal-50 border-green-200'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${ruta.tipo === 'principal'
                                            ? 'bg-purple-200 text-purple-800'
                                            : 'bg-green-200 text-green-800'
                                        }`}>
                                        {ruta.tipo}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(ruta)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ruta)}
                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate text-sm">
                                            {ruta.agencia_origen}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center my-2">
                                    <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                                    <span className="px-2 text-gray-400">→</span>
                                    <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate text-sm">
                                            {ruta.agencia_destino}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Gauge className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-medium">Distancia</span>
                                    </div>
                                    <span className="font-bold text-gray-900">
                                        {parseFloat(ruta.distancia_km).toFixed(0)} km
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-5 h-5 text-green-600" />
                                        <span className="text-sm font-medium">Tiempo est.</span>
                                    </div>
                                    <span className="font-bold text-gray-900">
                                        {formatTime(ruta.tiempo_estimado_min)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear Ruta */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Nueva Ruta</h2>
                            <button
                                onClick={() => { setShowCreateModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Agencia Origen *
                                </label>
                                <select
                                    required
                                    value={formData.id_agencia_origen}
                                    onChange={(e) => setFormData({ ...formData, id_agencia_origen: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Seleccionar agencia</option>
                                    {agencias.map(ag => (
                                        <option key={ag.id_agencia} value={ag.id_agencia}>
                                            {ag.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Agencia Destino *
                                </label>
                                <select
                                    required
                                    value={formData.id_agencia_destino}
                                    onChange={(e) => setFormData({ ...formData, id_agencia_destino: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Seleccionar agencia</option>
                                    {agencias.map(ag => (
                                        <option key={ag.id_agencia} value={ag.id_agencia}>
                                            {ag.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Distancia (km) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    value={formData.distancia_km}
                                    onChange={(e) => setFormData({ ...formData, distancia_km: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="1000.50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiempo Estimado (minutos) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.tiempo_estimado_min}
                                    onChange={(e) => setFormData({ ...formData, tiempo_estimado_min: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="960"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Ruta *
                                </label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="principal">Principal</option>
                                    <option value="secundaria">Secundaria</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Crear Ruta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Ruta */}
            {showEditModal && rutaToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Editar Ruta</h2>
                            <button
                                onClick={() => { setShowEditModal(false); setRutaToEdit(null); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-600">Editando ruta:</p>
                                <p className="font-bold text-gray-900">
                                    {rutaToEdit.agencia_origen} → {rutaToEdit.agencia_destino}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Distancia (km) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    value={formData.distancia_km}
                                    onChange={(e) => setFormData({ ...formData, distancia_km: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiempo Estimado (minutos) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.tiempo_estimado_min}
                                    onChange={(e) => setFormData({ ...formData, tiempo_estimado_min: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Ruta *
                                </label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="principal">Principal</option>
                                    <option value="secundaria">Secundaria</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setRutaToEdit(null); resetForm(); }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
