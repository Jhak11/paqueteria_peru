import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';

async function getClientShipments(userId: number) {
    try {
        const [rows]: any = await pool.query(`
      SELECT e.codigo_seguimiento, e.fecha_registro, es.nombre as estado, e.costo_envio_total,
             a_dest.nombre as destino
      FROM envios e
      JOIN estados_envio es ON e.estado_actual = es.id_estado
      JOIN agencias a_dest ON e.id_agencia_destino = a_dest.id_agencia
      WHERE e.id_usuario_remitente = ?
      ORDER BY e.fecha_registro DESC
      LIMIT 20
    `, [userId]);
        return rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default async function ClientDashboard() {
    const user = await getAuthUser();

    // Validar autenticación y rol
    if (!user) {
        redirect('/login');
    }

    if (user.role !== 'Cliente') {
        redirect('/'); // Redirigir a admin si no es cliente
    }

    const envios = await getClientShipments(user.userId);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">¡Bienvenido, {user.name}!</h1>
                <p className="mt-2 text-gray-600">Aquí puedes ver el estado de todos tus envíos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Envíos</p>
                        <h3 className="text-2xl font-bold text-gray-800">{envios.length}</h3>
                    </div>
                </div>
                {/* Add more metrics if needed */}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Envíos Recientes</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul role="list" className="divide-y divide-gray-200">
                    {envios.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500">No tienes envíos registrados.</li>
                    ) : (
                        envios.map((envio: any) => (
                            <li key={envio.codigo_seguimiento} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-blue-600 truncate">
                                            {envio.codigo_seguimiento}
                                        </p>
                                        <p className="flex items-center text-sm text-gray-500 mt-1">
                                            <Truck className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            Destino: {envio.destino}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {envio.estado}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {new Date(envio.fecha_registro).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
