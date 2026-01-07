import { Truck, Package, MapPin, Navigation, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ConductorDashboard() {
    return (
        <div>
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Mi Ruta de Hoy</h1>
                <p className="text-gray-500">Gestiona tus entregas y recogidas asignadas</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                            <p className="text-xs text-gray-500">Asignados</p>
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
                            <p className="text-xs text-gray-500">Entregados</p>
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
                            <p className="text-xs text-gray-500">Pendientes</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                            <p className="text-xs text-gray-500">No Entregados</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link
                    href="/conductor/entregas"
                    className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <Navigation className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Ver Mis Entregas</h2>
                            <p className="text-blue-200 text-sm">Lista de paquetes a entregar hoy</p>
                        </div>
                    </div>
                </Link>

                <div className="bg-gradient-to-br from-gray-600 to-gray-700 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <MapPin className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Ver Mapa de Ruta</h2>
                            <p className="text-gray-300 text-sm">Próximamente</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Deliveries */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Entregas del Día
                </h3>
                <div className="text-center py-8 text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tienes entregas asignadas para hoy</p>
                    <p className="text-sm mt-2">Las entregas se asignan desde el panel administrativo</p>
                </div>
            </div>
        </div>
    );
}
