'use client';

import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, Truck, ArrowDownToLine, ArrowUpFromLine, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CounterDashboard() {
    const [stats, setStats] = useState({
        receivedToday: 0,
        deliveredToday: 0,
        pendingPickup: 0,
        inTransit: 0
    });
    const [pendingPackages, setPendingPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, pendingRes] = await Promise.all([
                fetch('/api/counter/stats'),
                fetch('/api/counter/pending')
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }
            if (pendingRes.ok) {
                const data = await pendingRes.json();
                setPendingPackages(data.packages || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            {/* Welcome */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Panel de Mostrador</h1>
                    <p className="text-gray-500">Gestiona la recepción y entrega de paquetes</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                    title="Actualizar datos"
                >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link href="/counter/recepcion" className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 block">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <ArrowDownToLine className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Recepción de Paquetes</h2>
                            <p className="text-purple-200 text-sm">Registrar nuevo envío en agencia</p>
                        </div>
                    </div>
                </Link>

                <Link href="/counter/entrega" className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 block">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <ArrowUpFromLine className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Entrega de Paquetes</h2>
                            <p className="text-green-200 text-sm">Entregar paquete al destinatario</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.receivedToday}</p>
                            <p className="text-xs text-gray-500">Recibidos Hoy</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.deliveredToday}</p>
                            <p className="text-xs text-gray-500">Entregados Hoy</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingPickup}</p>
                            <p className="text-xs text-gray-500">Por Recoger</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Truck className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
                            <p className="text-xs text-gray-500">En Tránsito</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Pickups List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Paquetes Pendientes de Recojo</h3>
                </div>

                {pendingPackages.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500">Código</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500">Destinatario</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500">Llegada</th>
                                    <th className="px-6 py-3 text-center font-medium text-gray-500">Paquetes</th>
                                    <th className="px-6 py-3 text-right font-medium text-gray-500">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingPackages.map((pkg) => (
                                    <tr key={pkg.codigo_seguimiento} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-mono font-bold text-blue-600">
                                            {pkg.codigo_seguimiento}
                                        </td>
                                        <td className="px-6 py-3">
                                            <p className="font-medium text-gray-900">{pkg.destinatario}</p>
                                            <p className="text-xs text-gray-500">{pkg.telefono}</p>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {pkg.fecha_llegada
                                                ? format(new Date(pkg.fecha_llegada), 'dd MMM HH:mm', { locale: es })
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {pkg.paquetes_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <Link
                                                href={`/counter/entrega?code=${pkg.codigo_seguimiento}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                            >
                                                Entregar →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No hay paquetes pendientes de recojo en esta agencia.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
