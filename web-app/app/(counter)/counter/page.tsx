import { Package, CheckCircle, Clock, Truck, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Link from 'next/link';

export default function CounterDashboard() {
    return (
        <div>
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Panel de Mostrador</h1>
                <p className="text-gray-500">Gestiona la recepción y entrega de paquetes</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link
                    href="/counter/recepcion"
                    className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
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

                <Link
                    href="/counter/entrega"
                    className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
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
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                            <p className="text-xs text-gray-500">Recibidos Hoy</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                            <p className="text-xs text-gray-500">Entregados Hoy</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                            <p className="text-xs text-gray-500">Por Recoger</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Truck className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                            <p className="text-xs text-gray-500">En Tránsito</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Pickups */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Paquetes Pendientes de Recojo</h3>
                <div className="text-center py-8 text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay paquetes pendientes de recojo en esta agencia</p>
                </div>
            </div>
        </div>
    );
}
