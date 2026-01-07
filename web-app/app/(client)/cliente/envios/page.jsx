import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Package, MapPin, Calendar, DollarSign } from 'lucide-react';

async function getClientShipments(userId) {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.codigo_seguimiento, 
                e.fecha_registro, 
                e.fecha_estimada_entrega,
                e.fecha_entrega,
                es.nombre as estado, 
                e.costo_envio_total,
                a_orig.nombre as origen,
                a_dest.nombre as destino,
                dd.nombre_destinatario,
                dd.direccion as direccion_destino
            FROM envios e
            JOIN estados_envio es ON e.estado_actual = es.id_estado
            JOIN agencias a_orig ON e.id_agencia_origen = a_orig.id_agencia
            JOIN agencias a_dest ON e.id_agencia_destino = a_dest.id_agencia
            LEFT JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
            WHERE e.id_usuario_remitente = ?
            ORDER BY e.fecha_registro DESC
        `, [userId]);
        return rows;
    } catch (error) {
        console.error(error);
        return [];
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

export default async function MisEnviosPage() {
    const user = await getAuthUser();

    if (!user) {
        redirect('/login');
    }

    if (user.role !== 'Cliente') {
        redirect('/');
    }

    const envios = await getClientShipments(user.userId);

    return (
        <div className="max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis Envíos</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <Package className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Total Envíos</p>
                            <p className="text-2xl font-bold text-gray-800">{envios.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <Package className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Entregados</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {envios.filter(e => e.estado === 'Entregado').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <Package className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">En Tránsito</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {envios.filter(e => e.estado === 'En Ruta').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <Package className="h-8 w-8 text-yellow-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Pendientes</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {envios.filter(e => !['Entregado', 'Devuelto'].includes(e.estado)).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipments List */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Código
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Destino
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Registro
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Costo
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {envios.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No tienes envíos registrados
                                    </td>
                                </tr>
                            ) : (
                                envios.map((envio) => (
                                    <tr key={envio.codigo_seguimiento} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-blue-600">
                                                {envio.codigo_seguimiento}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{envio.destino}</div>
                                            <div className="text-xs text-gray-500 flex items-center mt-1">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {envio.direccion_destino}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(envio.estado)}`}>
                                                {envio.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                {new Date(envio.fecha_registro).toLocaleDateString()}
                                            </div>
                                            {envio.fecha_estimada_entrega && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Est: {new Date(envio.fecha_estimada_entrega).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                                                S/. {parseFloat(envio.costo_envio_total).toFixed(2)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
