'use client';

import { useState } from 'react';
import { Search, Package, MapPin, Calendar, Truck, Clock, DollarSign, Box } from 'lucide-react';

export default function RastreoPage() {
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [trackingData, setTrackingData] = useState(null);

    const buscarEnvio = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setTrackingData(null);

        try {
            const res = await fetch('/api/cliente/rastreo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo: codigo.trim().toUpperCase() })
            });

            const data = await res.json();

            if (res.ok) {
                setTrackingData(data);
            } else {
                setError(data.error || 'Error al buscar envío');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (estado) => {
        const colors = {
            'Registrado': 'bg-blue-100 text-blue-800',
            'En Almacén Origen': 'bg-yellow-100 text-yellow-800',
            'En Ruta': 'bg-purple-100 text-purple-800',
            'En Almacén Destino': 'bg-indigo-100 text-indigo-800',
            'En Reparto': 'bg-orange-100 text-orange-800',
            'Entregado': 'bg-green-100 text-green-800',
            'Devuelto': 'bg-red-100 text-red-800'
        };
        return colors[estado] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Rastrear Envío</h1>

            {/* Search Form */}
            <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                <form onSubmit={buscarEnvio} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            placeholder="Ingresa el código de seguimiento (ej: PE-AQP-001)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Search className="h-5 w-5" />
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Tracking Results */}
            {trackingData && (
                <div className="space-y-6">
                    {/* Shipment Information */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="h-6 w-6 text-blue-600" />
                            Información del Envío
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Código de Seguimiento</p>
                                <p className="text-lg font-semibold text-blue-600">{trackingData.envio.codigo_seguimiento}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">Estado Actual</p>
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(trackingData.envio.estado_actual)}`}>
                                    {trackingData.envio.estado_actual}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Origen
                                </p>
                                <p className="font-medium text-gray-900">{trackingData.envio.agencia_origen}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Destino
                                </p>
                                <p className="font-medium text-gray-900">{trackingData.envio.agencia_destino}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Fecha de Registro
                                </p>
                                <p className="font-medium text-gray-900">
                                    {new Date(trackingData.envio.fecha_registro).toLocaleDateString('es-PE')}
                                </p>
                            </div>

                            {trackingData.envio.fecha_estimada_entrega && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        Entrega Estimada
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(trackingData.envio.fecha_estimada_entrega).toLocaleDateString('es-PE')}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    Costo Total
                                </p>
                                <p className="font-medium text-gray-900">
                                    S/. {parseFloat(trackingData.envio.costo_envio_total).toFixed(2)}
                                </p>
                            </div>

                            {trackingData.envio.fecha_entrega && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Fecha de Entrega
                                    </p>
                                    <p className="font-medium text-green-600">
                                        {new Date(trackingData.envio.fecha_entrega).toLocaleDateString('es-PE')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Destination Details */}
                        {trackingData.envio.nombre_destinatario && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-3">Datos del Destinatario</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Nombre</p>
                                        <p className="font-medium text-gray-900">{trackingData.envio.nombre_destinatario}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Teléfono</p>
                                        <p className="font-medium text-gray-900">{trackingData.envio.telefono_destino}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-500">Dirección</p>
                                        <p className="font-medium text-gray-900">{trackingData.envio.direccion_destino}</p>
                                        <p className="text-sm text-gray-600 mt-1">{trackingData.envio.ubigeo_destino}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Packages */}
                    {trackingData.paquetes && trackingData.paquetes.length > 0 && (
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Box className="h-6 w-6 text-blue-600" />
                                Paquetes ({trackingData.paquetes.length})
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensiones</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frágil</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {trackingData.paquetes.map((paquete, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{paquete.tipo_paquete}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{paquete.descripcion_contenido}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{paquete.peso_kg} kg</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{paquete.dimensiones}</td>
                                                <td className="px-4 py-3">
                                                    {paquete.fragil ? (
                                                        <span className="text-red-600 font-semibold">Sí</span>
                                                    ) : (
                                                        <span className="text-gray-400">No</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tracking History */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Truck className="h-6 w-6 text-blue-600" />
                            Historial de Seguimiento
                        </h2>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                            <div className="space-y-6">
                                {trackingData.historial.map((evento, idx) => (
                                    <div key={idx} className="relative flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center z-10">
                                            <div className="w-3 h-3 rounded-full bg-white" />
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(evento.estado)}`}>
                                                        {evento.estado}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(evento.fecha_hora).toLocaleString('es-PE')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900 mb-1">{evento.descripcion_evento}</p>
                                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {evento.ubicacion}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
