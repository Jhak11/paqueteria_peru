import StatsCards from '../../components/StatsCards';
import pool from '@/lib/db';
import { AlertTriangle, Clock, Building2, UserPlus } from 'lucide-react';
import Link from 'next/link';

async function getDashboardData() {
    try {
        // Get recent shipments
        const [recentEnvios]: any = await pool.query(`
            SELECT 
                e.codigo_seguimiento, 
                e.fecha_registro, 
                es.nombre as estado,
                u.nombres as remitente
            FROM envios e
            JOIN estados_envio es ON e.estado_actual = es.id_estado
            JOIN usuarios u ON e.id_usuario_remitente = u.id_usuario
            ORDER BY e.fecha_registro DESC
            LIMIT 5
        `);

        // Get delayed shipments (simulated logic: registered more than 3 days ago and not delivered)
        const [delayedEnvios]: any = await pool.query(`
            SELECT 
                e.codigo_seguimiento, 
                es.nombre as estado
            FROM envios e
            JOIN estados_envio es ON e.estado_actual = es.id_estado
            WHERE e.fecha_registro < DATE_SUB(NOW(), INTERVAL 3 DAY)
            AND e.estado_actual != 6 -- Not Delivered
            LIMIT 3
        `);

        return { recent: recentEnvios, delayed: delayedEnvios };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return { recent: [], delayed: [] };
    }
}

export default async function Home() {
    const data = await getDashboardData();

    return (
        <div className="mx-auto max-w-7xl">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Resumen General</h3>
            <StatsCards />

            {/* Acciones Rápidas */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                    href="/admin/agencias"
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition border border-transparent hover:border-orange-200"
                >
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Gestión de Agencias</p>
                        <p className="text-xs text-gray-500">Sedes y Almacenes</p>
                    </div>
                </Link>

                <Link
                    href="/admin/empresas/nuevo"
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition border border-transparent hover:border-blue-200"
                >
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Nueva Empresa</p>
                        <p className="text-xs text-gray-500">Cliente Corporativo B2B</p>
                    </div>
                </Link>
                <Link
                    href="/admin/empleados/nuevo"
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition border border-transparent hover:border-green-200"
                >
                    <div className="p-2 bg-green-100 rounded-lg">
                        <UserPlus className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Nuevo Empleado</p>
                        <p className="text-xs text-gray-500">Conductor o Counter</p>
                    </div>
                </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Activity */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Actividad Reciente</h4>
                    <div className="flow-root">
                        <ul role="list" className="-my-5 divide-y divide-gray-200">
                            {data.recent.length === 0 ? (
                                <p className="py-4 text-sm text-gray-500">No hay actividad reciente.</p>
                            ) : (
                                data.recent.map((envio: any) => (
                                    <li key={envio.codigo_seguimiento} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <Clock className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    Envío {envio.codigo_seguimiento}
                                                </p>
                                                <p className="truncate text-sm text-gray-500">
                                                    {envio.remitente} &bull; {envio.estado}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                    {new Date(envio.fecha_registro).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

                {/* Operational Alerts */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Alertas Operativas</h4>
                    <div className="mt-4 space-y-2">
                        {data.delayed.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay alertas activas.</p>
                        ) : (
                            data.delayed.map((envio: any) => (
                                <div key={envio.codigo_seguimiento} className="w-full bg-red-50 rounded border border-red-100 flex items-center p-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                                    <span className="text-red-700 text-sm">
                                        Envío <strong>{envio.codigo_seguimiento}</strong> retrasado ({envio.estado})
                                    </span>
                                </div>
                            ))
                        )}
                        {/* Static maintenance alert example kept for demo if needed, or removed. I will keep one static for vehicle just in case DB is empty of alerts */}
                        <div className="w-full bg-yellow-50 rounded border border-yellow-100 flex items-center p-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                            <span className="text-yellow-700 text-sm">
                                Recordatorio: Mantenimiento preventivo de flota fin de mes.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}