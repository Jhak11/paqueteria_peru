'use client';
import { useState, useEffect } from 'react';
import { Search, Truck, Calendar, MapPin, User, Package, Plus, X } from 'lucide-react';

export default function ViajesPage() {
    const [viajes, setViajes] = useState([]);
    const [rutas, setRutas] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [conductores, setConductores] = useState([]);
    const [envios, setEnvios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEstado, setSelectedEstado] = useState('all');

    // Modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEstadoModal, setShowEstadoModal] = useState(false);
    const [showEnviosModal, setShowEnviosModal] = useState(false);
    const [viajeSelected, setViajeSelected] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        id_ruta: '',
        id_vehiculo: '',
        id_conductor: '',
        fecha_salida: '',
        fecha_llegada_estimada: ''
    });

    const [estadoData, setEstadoData] = useState({
        estado: '',
        fecha_llegada_real: ''
    });

    const [enviosSeleccionados, setEnviosSeleccionados] = useState([]);

    useEffect(() => {
        fetchViajes();
        fetchRutas();
        fetchVehiculos();
        fetchConductores();
    }, []);

    const fetchViajes = async () => {
        try {
            const res = await fetch('/api/admin/viajes');
            const data = await res.json();
            if (Array.isArray(data)) {
                setViajes(data);
            }
        } catch (error) {
            console.error('Error cargando viajes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRutas = async () => {
        try {
            const res = await fetch('/api/admin/rutas');
            const data = await res.json();
            if (Array.isArray(data)) {
                setRutas(data);
            }
        } catch (error) {
            console.error('Error cargando rutas:', error);
        }
    };

    const fetchVehiculos = async () => {
        try {
            const res = await fetch('/api/admin/vehiculos');
            const data = await res.json();
            if (Array.isArray(data)) {
                setVehiculos(data);
            }
        } catch (error) {
            console.error('Error cargando vehículos:', error);
        }
    };

    const fetchConductores = async () => {
        try {
            console.log('[Viajes] Fetching conductores...');
            const res = await fetch('/api/admin/empleados?rol=Conductor');

            if (!res.ok) {
                console.error('[Viajes] API error:', res.status, res.statusText);
                return;
            }

            const data = await res.json();
            console.log('[Viajes] Conductores received:', data);

            if (Array.isArray(data)) {
                setConductores(data);
                console.log('[Viajes] Conductores set:', data.length);
            } else {
                console.error('[Viajes] Expected array but got:', typeof data);
            }
        } catch (error) {
            console.error('[Viajes] Error cargando conductores:', error);
        }
    };

    const fetchEnviosDisponibles = async () => {
        try {
            const res = await fetch('/api/admin/envios?estado=pendiente');
            const data = await res.json();
            if (Array.isArray(data)) {
                setEnvios(data);
            }
        } catch (error) {
            console.error('Error cargando envíos:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/viajes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                alert('Viaje programado exitosamente');
                setShowCreateModal(false);
                resetForm();
                fetchViajes();
            } else {
                alert(data.error || 'Error al programar el viaje');
            }
        } catch (error) {
            alert('Error al programar el viaje');
        }
    };

    const handleEstadoChange = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/viajes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_viaje: viajeSelected.id_viaje,
                    ...estadoData
                })
            });

            if (res.ok) {
                alert('Estado actualizado exitosamente');
                setShowEstadoModal(false);
                setViajeSelected(null);
                fetchViajes();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al actualizar el estado');
            }
        } catch (error) {
            alert('Error al actualizar el estado');
        }
    };

    const handleAsignarEnvios = async (e) => {
        e.preventDefault();
        if (enviosSeleccionados.length === 0) {
            alert('Selecciona al menos un envío');
            return;
        }

        try {
            const res = await fetch(`/api/admin/viajes/${viajeSelected.id_viaje}/envios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ envios: enviosSeleccionados })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`${data.assigned} envío(s) asignado(s) exitosamente`);
                setShowEnviosModal(false);
                setViajeSelected(null);
                setEnviosSeleccionados([]);
            } else {
                alert(data.error || 'Error al asignar envíos');
            }
        } catch (error) {
            alert('Error al asignar envíos');
        }
    };

    const openEstadoModal = (viaje) => {
        setViajeSelected(viaje);
        setEstadoData({
            estado: viaje.estado,
            fecha_llegada_real: viaje.fecha_llegada_real || ''
        });
        setShowEstadoModal(true);
    };

    const openEnviosModal = async (viaje) => {
        setViajeSelected(viaje);
        await fetchEnviosDisponibles();
        setShowEnviosModal(true);
    };

    const resetForm = () => {
        setFormData({
            id_ruta: '',
            id_vehiculo: '',
            id_conductor: '',
            fecha_salida: '',
            fecha_llegada_estimada: ''
        });
    };

    const toggleEnvio = (id) => {
        setEnviosSeleccionados(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const filteredViajes = viajes.filter(v => {
        const matchesSearch =
            v.agencia_origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.agencia_destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.placa_vehiculo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEstado = selectedEstado === 'all' || v.estado === selectedEstado;
        return matchesSearch && matchesEstado;
    });

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'programado': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'en_transito': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completado': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No definido';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Truck className="text-orange-600 w-8 h-8" />
                        </div>
                        Gestión de Viajes
                    </h1>
                    <p className="text-gray-600 mt-1">Programación y seguimiento de viajes logísticos</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" /> Programar Viaje
                </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Programados</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {viajes.filter(v => v.estado === 'programado').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Truck className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">En Tránsito</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {viajes.filter(v => v.estado === 'en_transito').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Completados</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {viajes.filter(v => v.estado === 'completado').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Truck className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Viajes</p>
                            <p className="text-2xl font-bold text-gray-900">{viajes.length}</p>
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
                            placeholder="Buscar por agencia o vehículo..."
                            className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none text-gray-900 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        value={selectedEstado}
                        onChange={(e) => setSelectedEstado(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none text-gray-900 transition"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="programado">Programado</option>
                        <option value="en_transito">En Tránsito</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
            </div>

            {/* Cards de viajes */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Cargando viajes...</p>
                </div>
            ) : filteredViajes.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No se encontraron viajes</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredViajes.map((viaje) => (
                        <div
                            key={viaje.id_viaje}
                            className="bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300 transition"
                        >
                            {/* Header con estado */}
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-orange-50 border-b-2 border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <button
                                        onClick={() => openEstadoModal(viaje)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getEstadoColor(viaje.estado)} border-2 hover:opacity-80 transition`}
                                    >
                                        {viaje.estado.replace('_', ' ')}
                                    </button>
                                    <span className="text-xs text-gray-500 font-mono">
                                        #{viaje.id_viaje}
                                    </span>
                                </div>

                                {/* Ruta */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <span className="text-sm font-medium text-gray-900 truncate">
                                            {viaje.agencia_origen}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="flex-1 border-t border-dashed border-gray-300"></div>
                                        <Truck className="w-4 h-4 text-gray-400 mx-2" />
                                        <div className="flex-1 border-t border-dashed border-gray-300"></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        <span className="text-sm font-medium text-gray-900 truncate">
                                            {viaje.agencia_destino}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles */}
                            <div className="p-4 space-y-3">
                                {/* Vehículo */}
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <Truck className="w-4 h-4 text-gray-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500">Vehículo</p>
                                        <p className="font-semibold text-sm text-gray-900 truncate">
                                            {viaje.placa_vehiculo || 'No asignado'}
                                        </p>
                                    </div>
                                </div>

                                {/* Conductor */}
                                {viaje.nombre_conductor && (
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <User className="w-4 h-4 text-gray-600" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500">Conductor</p>
                                            <p className="font-semibold text-sm text-gray-900 truncate">
                                                {viaje.nombre_conductor}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Fechas */}
                                <div className="space-y-2 pt-2 border-t border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-gray-600">Salida:</span>
                                        <span className="text-xs font-medium text-gray-900 text-right">
                                            {formatDate(viaje.fecha_salida)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-gray-600">Llegada est.:</span>
                                        <span className="text-xs font-medium text-gray-900 text-right">
                                            {formatDate(viaje.fecha_llegada_estimada)}
                                        </span>
                                    </div>
                                    {viaje.fecha_llegada_real && (
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs text-green-600">Llegada real:</span>
                                            <span className="text-xs font-bold text-green-900 text-right">
                                                {formatDate(viaje.fecha_llegada_real)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Botón asignar envíos */}
                                {viaje.estado === 'programado' && (
                                    <button
                                        onClick={() => openEnviosModal(viaje)}
                                        className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <Package className="w-4 h-4" />
                                        Asignar Envíos
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear Viaje */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Programar Nuevo Viaje</h2>
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
                                    Ruta *
                                </label>
                                <select
                                    required
                                    value={formData.id_ruta}
                                    onChange={(e) => setFormData({ ...formData, id_ruta: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                >
                                    <option value="">Seleccionar ruta</option>
                                    {rutas.map(r => (
                                        <option key={r.id_ruta} value={r.id_ruta}>
                                            {r.agencia_origen} → {r.agencia_destino}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vehículo *
                                </label>
                                <select
                                    required
                                    value={formData.id_vehiculo}
                                    onChange={(e) => setFormData({ ...formData, id_vehiculo: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                >
                                    <option value="">Seleccionar vehículo</option>
                                    {vehiculos.map(v => (
                                        <option key={v.id_vehiculo} value={v.id_vehiculo}>
                                            {v.placa} - {v.tipo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Conductor *
                                </label>
                                <select
                                    required
                                    value={formData.id_conductor}
                                    onChange={(e) => setFormData({ ...formData, id_conductor: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                >
                                    <option value="">Seleccionar conductor</option>
                                    {conductores.length === 0 && (
                                        <option value="" disabled>No hay conductores disponibles</option>
                                    )}
                                    {conductores.map(c => (
                                        <option key={c.id_usuario} value={c.id_usuario}>
                                            {c.nombres} {c.apellidos}
                                        </option>
                                    ))}
                                </select>
                                {conductores.length === 0 && (
                                    <p className="mt-1 text-sm text-red-600">
                                        No se encontraron conductores. Verifica la consola para más detalles.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Salida *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.fecha_salida}
                                    onChange={(e) => setFormData({ ...formData, fecha_salida: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Llegada Estimada *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.fecha_llegada_estimada}
                                    onChange={(e) => setFormData({ ...formData, fecha_llegada_estimada: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
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
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                                >
                                    Programar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Cambiar Estado */}
            {showEstadoModal && viajeSelected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Cambiar Estado del Viaje</h2>
                            <button
                                onClick={() => { setShowEstadoModal(false); setViajeSelected(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEstadoChange} className="p-6 space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-600">Viaje #{viajeSelected.id_viaje}</p>
                                <p className="font-bold text-gray-900">
                                    {viajeSelected.agencia_origen} → {viajeSelected.agencia_destino}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nuevo Estado *
                                </label>
                                <select
                                    required
                                    value={estadoData.estado}
                                    onChange={(e) => setEstadoData({ ...estadoData, estado: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                >
                                    <option value="">Seleccionar estado</option>
                                    <option value="programado">Programado</option>
                                    <option value="en_transito">En Tránsito</option>
                                    <option value="completado">Completado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>

                            {estadoData.estado === 'completado' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Llegada Real *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={estadoData.fecha_llegada_real}
                                        onChange={(e) => setEstadoData({ ...estadoData, fecha_llegada_real: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEstadoModal(false); setViajeSelected(null); }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                                >
                                    Actualizar Estado
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Asignar Envíos */}
            {showEnviosModal && viajeSelected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Asignar Envíos al Viaje</h2>
                            <button
                                onClick={() => { setShowEnviosModal(false); setViajeSelected(null); setEnviosSeleccionados([]); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAsignarEnvios} className="p-6">
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-600">Viaje #{viajeSelected.id_viaje}</p>
                                <p className="font-bold text-gray-900">
                                    {viajeSelected.agencia_origen} → {viajeSelected.agencia_destino}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-3">
                                    Selecciona los envíos a asignar ({enviosSeleccionados.length} seleccionados):
                                </p>

                                {envios.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No hay envíos pendientes disponibles
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {envios.map(envio => (
                                            <label
                                                key={envio.id_envio}
                                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={enviosSeleccionados.includes(envio.id_envio)}
                                                    onChange={() => toggleEnvio(envio.id_envio)}
                                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{envio.codigo_seguimiento}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {envio.agencia_origen} → {envio.agencia_destino}
                                                    </p>
                                                </div>
                                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                                    {envio.estado_actual}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => { setShowEnviosModal(false); setViajeSelected(null); setEnviosSeleccionados([]); }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={enviosSeleccionados.length === 0}
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Asignar {enviosSeleccionados.length > 0 && `(${enviosSeleccionados.length})`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
