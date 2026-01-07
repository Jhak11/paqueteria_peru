'use client';
import { useState, useEffect } from 'react';
import { Search, DollarSign, TrendingUp, Package, Zap, Edit2, X, ToggleLeft, ToggleRight } from 'lucide-react';

export default function TarifasPage() {
    const [tarifas, setTarifas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedService, setSelectedService] = useState('all');

    // Modal edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [tarifaToEdit, setTarifaToEdit] = useState(null);
    const [formData, setFormData] = useState({
        precio_base: '',
        peso_base_kg: '',
        precio_kg_extra: '',
        tiempo_min_dias: '',
        tiempo_max_dias: ''
    });

    useEffect(() => {
        fetchTarifas();
    }, []);

    const fetchTarifas = async () => {
        try {
            const res = await fetch('/api/admin/tarifas');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTarifas(data);
            }
        } catch (error) {
            console.error('Error cargando tarifas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/tarifas', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_tarifa: tarifaToEdit.id_tarifa,
                    ...formData
                })
            });

            if (res.ok) {
                alert('Tarifa actualizada exitosamente');
                setShowEditModal(false);
                setTarifaToEdit(null);
                fetchTarifas();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al actualizar la tarifa');
            }
        } catch (error) {
            alert('Error al actualizar la tarifa');
        }
    };

    const toggleEstado = async (tarifa) => {
        const nuevoEstado = tarifa.estado === 'vigente' ? 'inactivo' : 'vigente';

        try {
            const res = await fetch('/api/admin/tarifas', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_tarifa: tarifa.id_tarifa,
                    estado: nuevoEstado
                })
            });

            if (res.ok) {
                fetchTarifas();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al cambiar el estado');
            }
        } catch (error) {
            alert('Error al cambiar el estado');
        }
    };

    const openEditModal = (tarifa) => {
        setTarifaToEdit(tarifa);
        setFormData({
            precio_base: tarifa.precio_base,
            peso_base_kg: tarifa.peso_base_kg,
            precio_kg_extra: tarifa.precio_kg_extra,
            tiempo_min_dias: tarifa.tiempo_min_dias,
            tiempo_max_dias: tarifa.tiempo_max_dias
        });
        setShowEditModal(true);
    };

    const filteredTarifas = tarifas.filter(t => {
        const matchesSearch = t.departamento_origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.departamento_destino.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = selectedService === 'all' || t.tipo_servicio === selectedService;
        return matchesSearch && matchesService;
    });

    // Agrupar por ruta
    const tarifasPorRuta = filteredTarifas.reduce((acc, tarifa) => {
        const key = `${tarifa.departamento_origen}_${tarifa.departamento_destino}`;
        if (!acc[key]) {
            acc[key] = {
                origen: tarifa.departamento_origen,
                destino: tarifa.departamento_destino,
                servicios: []
            };
        }
        acc[key].servicios.push(tarifa);
        return acc;
    }, {});

    const getServiceIcon = (tipo) => {
        switch (tipo) {
            case 'express': return <Zap className="w-4 h-4" />;
            case 'carga_pesada': return <Package className="w-4 h-4" />;
            default: return <TrendingUp className="w-4 h-4" />;
        }
    };

    const getServiceColor = (tipo) => {
        switch (tipo) {
            case 'express': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'carga_pesada': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="text-green-600 w-8 h-8" />
                        </div>
                        Gestión de Tarifas
                    </h1>
                    <p className="text-gray-600 mt-1">Configuración de precios por zonas y servicios</p>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Estándar</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {tarifas.filter(t => t.tipo_servicio === 'estandar').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Express</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {tarifas.filter(t => t.tipo_servicio === 'express').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Package className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Carga Pesada</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {tarifas.filter(t => t.tipo_servicio === 'carga_pesada').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Rutas</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {Object.keys(tarifasPorRuta).length}
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
                            placeholder="Buscar por departamento..."
                            className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white outline-none text-gray-900 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white outline-none text-gray-900 transition"
                    >
                        <option value="all">Todos los servicios</option>
                        <option value="estandar">Estándar</option>
                        <option value="express">Express</option>
                        <option value="carga_pesada">Carga Pesada</option>
                    </select>
                </div>
            </div>

            {/* Cards de rutas */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Cargando tarifas...</p>
                </div>
            ) : Object.keys(tarifasPorRuta).length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No se encontraron tarifas</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(tarifasPorRuta).map((rutaData, idx) => (
                        <div key={idx} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
                            {/* Header de la ruta */}
                            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-bold text-gray-900 text-sm">
                                        {rutaData.origen}
                                    </h3>
                                    <div className="text-gray-400">→</div>
                                    <h3 className="font-bold text-gray-900 text-sm">
                                        {rutaData.destino}
                                    </h3>
                                </div>
                            </div>

                            {/* Servicios disponibles */}
                            <div className="p-4 space-y-3">
                                {rutaData.servicios.map((tarifa) => (
                                    <div
                                        key={tarifa.id_tarifa}
                                        className={`p-3 rounded-lg border-2 ${getServiceColor(tarifa.tipo_servicio)} ${tarifa.estado === 'inactivo' ? 'opacity-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getServiceIcon(tarifa.tipo_servicio)}
                                                <span className="font-semibold text-sm uppercase">
                                                    {tarifa.tipo_servicio.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(tarifa)}
                                                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleEstado(tarifa)}
                                                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition"
                                                    title={tarifa.estado === 'vigente' ? 'Desactivar' : 'Activar'}
                                                >
                                                    {tarifa.estado === 'vigente' ? (
                                                        <ToggleRight className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Precio base:</span>
                                                <span className="font-bold">S/. {parseFloat(tarifa.precio_base).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Por kg extra:</span>
                                                <span className="font-bold">+ S/. {parseFloat(tarifa.precio_kg_extra).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between pt-1 border-t border-gray-200/50">
                                                <span className="text-gray-700">Tiempo:</span>
                                                <span className="font-medium">
                                                    {tarifa.tiempo_min_dias === tarifa.tiempo_max_dias
                                                        ? `${tarifa.tiempo_min_dias} día(s)`
                                                        : `${tarifa.tiempo_min_dias}-${tarifa.tiempo_max_dias} días`}
                                                </span>
                                            </div>
                                            {tarifa.estado === 'inactivo' && (
                                                <div className="pt-1">
                                                    <span className="text-xs text-gray-600 italic">Tarifa inactiva</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Editar Tarifa */}
            {showEditModal && tarifaToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Editar Tarifa</h2>
                            <button
                                onClick={() => { setShowEditModal(false); setTarifaToEdit(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-600">Editando tarifa:</p>
                                <p className="font-bold text-gray-900">
                                    {tarifaToEdit.departamento_origen} → {tarifaToEdit.departamento_destino}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Servicio: <span className="font-semibold">{tarifaToEdit.tipo_servicio}</span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio Base (S/.) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={formData.precio_base}
                                    onChange={(e) => setFormData({ ...formData, precio_base: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Peso Base (kg) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0.1"
                                    step="0.1"
                                    value={formData.peso_base_kg}
                                    onChange={(e) => setFormData({ ...formData, peso_base_kg: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio por Kg Extra (S/.) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={formData.precio_kg_extra}
                                    onChange={(e) => setFormData({ ...formData, precio_kg_extra: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tiempo Mín (días) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.tiempo_min_dias}
                                        onChange={(e) => setFormData({ ...formData, tiempo_min_dias: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tiempo Máx (días) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.tiempo_max_dias}
                                        onChange={(e) => setFormData({ ...formData, tiempo_max_dias: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setTarifaToEdit(null); }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
