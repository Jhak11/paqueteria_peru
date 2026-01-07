'use client';
import { useState } from 'react';
import { Search, Package, MapPin, User, Calendar, DollarSign, Edit, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ConsultaPage() {
    const [codigoSearch, setCodigoSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [envio, setEnvio] = useState(null);
    const [paquetes, setPaquetes] = useState([]);
    const [error, setError] = useState(null);

    // Edit modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPaquete, setEditingPaquete] = useState(null);
    const [nuevaDescripcion, setNuevaDescripcion] = useState('');

    const buscarEnvio = async () => {
        if (!codigoSearch.trim()) {
            setError('Ingrese un código de seguimiento');
            return;
        }

        setLoading(true);
        setError(null);
        setEnvio(null);
        setPaquetes([]);

        try {
            const res = await fetch(`/api/counter/envios/${codigoSearch.trim()}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al buscar envío');
                return;
            }

            setEnvio(data.envio);
            setPaquetes(data.paquetes || []);
        } catch (err) {
            console.error(err);
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const abrirEditModal = (paquete) => {
        setEditingPaquete(paquete);
        setNuevaDescripcion(paquete.descripcion_contenido || '');
        setShowEditModal(true);
    };

    const guardarDescripcion = async () => {
        if (!nuevaDescripcion.trim()) {
            alert('La descripción no puede estar vacía');
            return;
        }

        try {
            const res = await fetch(`/api/counter/paquetes/${editingPaquete.id_paquete}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descripcion_contenido: nuevaDescripcion })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Error al actualizar');
                return;
            }

            // Update local state
            setPaquetes(paquetes.map(p =>
                p.id_paquete === editingPaquete.id_paquete
                    ? { ...p, descripcion_contenido: nuevaDescripcion }
                    : p
            ));

            setShowEditModal(false);
            alert('Descripción actualizada correctamente');
        } catch (err) {
            console.error(err);
            alert('Error al actualizar descripción');
        }
    };

    const eliminarPaquete = async (paquete) => {
        if (!confirm(`¿Está seguro de eliminar el paquete #${paquete.id_paquete}?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/counter/paquetes/${paquete.id_paquete}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Error al eliminar');
                return;
            }

            // Update local state
            setPaquetes(paquetes.filter(p => p.id_paquete !== paquete.id_paquete));
            alert('Paquete eliminado correctamente');
        } catch (err) {
            console.error(err);
            alert('Error al eliminar paquete');
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 1: return 'bg-blue-100 text-blue-800 border-blue-200';
            case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 3: return 'bg-orange-100 text-orange-800 border-orange-200';
            case 4: return 'bg-purple-100 text-purple-800 border-purple-200';
            case 5: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 6: return 'bg-green-100 text-green-800 border-green-200';
            case 7: return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTipoPaqueteIcon = (tipo) => {
        switch (tipo) {
            case 'documento': return '📄';
            case 'sobre': return '✉️';
            case 'caja_chica': return '📦';
            case 'caja_grande': return '📦';
            case 'pallet': return '🏗️';
            default: return '📋';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Search className="w-6 h-6" />
                    </div>
                    Consultar Envío
                </h1>
                <p className="text-gray-500 ml-12 mt-1">Busca y gestiona paquetes por código de seguimiento</p>
            </header>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Ingrese código de seguimiento (ej: PE-ABC1-XYZ2)"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                            value={codigoSearch}
                            onChange={e => setCodigoSearch(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && buscarEnvio()}
                        />
                    </div>
                    <button
                        onClick={buscarEnvio}
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            {/* Shipment Info Bar (Horizontal) */}
            {envio && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Package className="w-8 h-8 text-blue-600" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{envio.codigo_seguimiento}</h2>
                                <p className="text-sm text-gray-600">Envío registrado</p>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase border-2 ${getEstadoColor(envio.estado_actual)}`}>
                            {envio.estado_nombre}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-gray-500" />
                                <p className="text-xs text-gray-500 font-medium">Remitente</p>
                            </div>
                            <p className="font-bold text-gray-900">{envio.remitente}</p>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <p className="text-xs text-gray-500 font-medium">Destinatario</p>
                            </div>
                            <p className="font-bold text-gray-900">{envio.destinatario}</p>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <p className="text-xs text-gray-500 font-medium">Fecha Registro</p>
                            </div>
                            <p className="font-bold text-gray-900">
                                {new Date(envio.fecha_registro).toLocaleDateString('es-PE')}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <p className="text-xs text-gray-500 font-medium">Costo Total</p>
                            </div>
                            <p className="font-bold text-green-600 text-lg">
                                S/. {parseFloat(envio.costo_envio_total).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex gap-4 text-sm text-gray-600">
                        <span>Origen: <strong>{envio.agencia_origen}</strong></span>
                        <span>→</span>
                        <span>Destino: <strong>{envio.agencia_destino}</strong></span>
                    </div>
                </div>
            )}

            {/* Package Cards */}
            {paquetes.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Paquetes ({paquetes.length})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paquetes.map((paquete, idx) => (
                            <div key={paquete.id_paquete} className="bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-blue-300 transition overflow-hidden">
                                {/* Card Header */}
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getTipoPaqueteIcon(paquete.tipo_paquete)}</span>
                                        <h4 className="font-bold text-gray-900">Paquete #{idx + 1}</h4>
                                    </div>
                                    {paquete.fragil && (
                                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded">
                                            ⚠️ FRÁGIL
                                        </span>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Tipo</p>
                                        <p className="text-sm font-semibold text-gray-900 capitalize">{paquete.tipo_paquete.replace('_', ' ')}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Peso</p>
                                            <p className="text-sm font-bold text-gray-900">{paquete.peso_kg} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Valor</p>
                                            <p className="text-sm font-bold text-green-600">S/. {parseFloat(paquete.valor_declarado || 0).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {(paquete.largo_cm || paquete.ancho_cm || paquete.alto_cm) && (
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Dimensiones</p>
                                            <p className="text-sm text-gray-700">
                                                {paquete.largo_cm || 0} × {paquete.ancho_cm || 0} × {paquete.alto_cm || 0} cm
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Descripción</p>
                                        <p className="text-sm text-gray-700 italic">
                                            {paquete.descripcion_contenido || 'Sin descripción'}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2 border-t">
                                        <button
                                            onClick={() => abrirEditModal(paquete)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => eliminarPaquete(paquete)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                        <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between rounded-t-xl">
                            <h3 className="text-lg font-bold">Editar Descripción</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-white hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción del Contenido
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="4"
                                    value={nuevaDescripcion}
                                    onChange={e => setNuevaDescripcion(e.target.value)}
                                    placeholder="Ej: Libros educativos, material de oficina..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardarDescripcion}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
