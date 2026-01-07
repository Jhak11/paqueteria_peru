import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Package, Truck, Clock, DollarSign, TrendingUp, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

async function getClientDashboardData(userId) {
    try {
        // Get shipments summary
        const [envios] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado_actual = (SELECT id_estado FROM estados_envio WHERE nombre = 'Entregado') THEN 1 ELSE 0 END) as entregados,
                SUM(CASE WHEN estado_actual = (SELECT id_estado FROM estados_envio WHERE nombre = 'En Ruta') THEN 1 ELSE 0 END) as en_ruta,
                SUM(CASE WHEN estado_actual NOT IN (
                    SELECT id_estado FROM estados_envio WHERE nombre IN ('Entregado', 'Devuelto')
                ) THEN 1 ELSE 0 END) as pendientes,
                SUM(costo_envio_total) as total_gastado
            FROM envios 
            WHERE id_usuario_remitente = ?
        `, [userId]);

        // Get recent shipments
        const [recientes] = await pool.query(`
            SELECT 
                e.codigo_seguimiento, 
                e.fecha_registro, 
                es.nombre as estado, 
                e.costo_envio_total,
                a_dest.nombre as destino,
                dd.nombre_destinatario
            FROM envios e
            JOIN estados_envio es ON e.estado_actual = es.id_estado
            JOIN agencias a_dest ON e.id_agencia_destino = a_dest.id_agencia
            LEFT JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
            WHERE e.id_usuario_remitente = ?
            ORDER BY e.fecha_registro DESC
            LIMIT 5
        `, [userId]);

        // Get in-transit shipments
        const [enTransito] = await pool.query(`
            SELECT 
                e.codigo_seguimiento,
                e.fecha_estimada_entrega,
                es.nombre as estado,
                a_dest.nombre as destino
            FROM envios e
            JOIN estados_envio es ON e.estado_actual = es.id_estado
            JOIN agencias a_dest ON e.id_agencia_destino = a_dest.id_agencia
            WHERE e.id_usuario_remitente = ?
            AND es.nombre IN ('En Ruta', 'En Reparto', 'En Almacén Destino')
            ORDER BY e.fecha_estimada_entrega ASC
            LIMIT 3
        `, [userId]);

        return {
            resumen: envios[0],
            recientes,
            enTransito
        };
    } catch (error) {
        console.error(error);
        return {
            resumen: { total: 0, entregados: 0, en_ruta: 0, pendientes: 0, total_gastado: 0 },
            recientes: [],
            enTransito: []
        };
    }
}

function getStatusColor(estado) {
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
}

export default async function ClientDashboard() {
    const user = await getAuthUser();

    if (!user) {
        redirect('/login');
    }

    if (user.role !== 'Cliente') {
        redirect('/');
    }

    const data = await getClientDashboardData(user.userId);
    const { resumen, recientes, enTransito } = data;

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">¡Bienvenido, {user.name}!</h1>
                <p className="mt-2 text-gray-600">Aquí está el resumen de tu actividad de envíos</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Envíos</p>
                            <h3 className="text-3xl font-bold mt-2">{resumen.total}</h3>
                        </div>
                        <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                            <Package className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Entregados</p>
                            <h3 className="text-3xl font-bold mt-2">{resumen.entregados}</h3>
                        </div>
                        <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                            <TrendingUp className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">En Tránsito</p>
                            <h3 className="text-3xl font-bold mt-2">{resumen.en_ruta}</h3>
                        </div>
                        <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                            <Truck className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Total Gastado</p>
                            <h3 className="text-2xl font-bold mt-2">S/. {parseFloat(resumen.total_gastado || 0).toFixed(2)}</h3>
                        </div>
                        <div className="bg-orange-400 bg-opacity-30 p-3 rounded-lg">
                            <DollarSign className="h-8 w-8" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Shipments */}
                <div className="lg:col-span-2 bg-white shadow-sm rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Envíos Recientes</h2>
                        <Link href="/cliente/envios" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Ver todos →
                        </Link>
                    </div>

                    {recientes.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No tienes envíos registrados</p>
                    ) : (
                        <div className="space-y-3">
                            {recientes.map((envio) => (
                                <div key={envio.codigo_seguimiento} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="text-sm font-semibold text-blue-600">{envio.codigo_seguimiento}</p>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(envio.estado)}`}>
                                                    {envio.estado}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 gap-4">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {envio.destino}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(envio.fecha_registro).toLocaleDateString('es-PE')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">S/. {parseFloat(envio.costo_envio_total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* In Transit Shipments */}
                <div className="bg-white shadow-sm rounded-xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-purple-600" />
                        En Camino
                    </h2>

                    {enTransito.length === 0 ? (
                        <p className="text-center py-8 text-gray-500 text-sm">No hay envíos en tránsito</p>
                    ) : (
                        <div className="space-y-3">
                            {enTransito.map((envio) => (
                                <div key={envio.codigo_seguimiento} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-sm font-semibold text-gray-900 mb-1">{envio.codigo_seguimiento}</p>
                                    <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {envio.destino}
                                    </p>
                                    {envio.fecha_estimada_entrega && (
                                        <p className="text-xs text-purple-700 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Llegada: {new Date(envio.fecha_estimada_entrega).toLocaleDateString('es-PE')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/cliente/rastreo" className="bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg p-4 transition group">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Rastrear Envío</p>
                                <p className="text-xs text-gray-600">Busca por código</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/cliente/envios" className="bg-white hover:bg-purple-50 border-2 border-purple-200 rounded-lg p-4 transition group">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition">
                                <Truck className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Ver Historial</p>
                                <p className="text-xs text-gray-600">Todos tus envíos</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/cliente/perfil" className="bg-white hover:bg-green-50 border-2 border-green-200 rounded-lg p-4 transition group">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition">
                                <Package className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Mi Perfil</p>
                                <p className="text-xs text-gray-600">Editar datos</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
