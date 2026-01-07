'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, Truck, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
export default function VehiculosPage() {
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    useEffect(() => {
        fetchVehiculos();
    }, []);
    const fetchVehiculos = async () => {
        try {
            const res = await fetch('/api/admin/vehiculos');
            const data = await res.json();
            if (Array.isArray(data)) {
                setVehiculos(data);
            }
        }
        catch (error) {
            console.error('Error cargando vehículos:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleEstadoChange = async (id, nuevoEstado) => {
        setOpenMenuId(null);
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/vehiculos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (!res.ok)
                throw new Error('Error al actualizar estado');
            // Actualización optimista
            setVehiculos(prev => prev.map(v => v.id_vehiculo === id ? { ...v, estado: nuevoEstado } : v));
        }
        catch (error) {
            console.error(error);
            alert('No se pudo actualizar el estado');
        }
        finally {
            setActionLoading(null);
        }
    };
    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este vehículo? Esta acción no se puede deshacer.'))
            return;
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/vehiculos/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al eliminar');
            }
            setVehiculos(prev => prev.filter(v => v.id_vehiculo !== id));
        }
        catch (error) {
            console.error(error);
            alert(error.message);
        }
        finally {
            setActionLoading(null);
        }
    };
    const filteredVehiculos = vehiculos.filter(v => v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modelo.toLowerCase().includes(searchTerm.toLowerCase()));
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'activo': return 'bg-green-100 text-green-800';
            case 'mantenimiento': return 'bg-yellow-100 text-yellow-800';
            case 'retirado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (<div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Truck className="text-blue-600"/>
                        Gestión de Flota
                    </h1>
                    <p className="text-gray-600">Administración de vehículos y transporte</p>
                </div>
                <Link href="/admin/vehiculos/nuevo" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    <Plus className="w-4 h-4"/> Nuevo Vehículo
                </Link>
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input type="text" placeholder="Buscar por placa, marca o modelo..." className="pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (<tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Cargando flota...
                                    </td>
                                </tr>) : filteredVehiculos.length === 0 ? (<tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron vehículos
                                    </td>
                                </tr>) : (filteredVehiculos.map((vehiculo) => (<tr key={vehiculo.id_vehiculo} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{vehiculo.marca} {vehiculo.modelo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800 text-sm border border-gray-300">
                                                {vehiculo.placa}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                            {vehiculo.tipo}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {vehiculo.capacidad_kg} kg
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(vehiculo.estado)} capitalize`}>
                                                {vehiculo.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="relative">
                                                    <button onClick={() => setOpenMenuId(openMenuId === vehiculo.id_vehiculo ? null : vehiculo.id_vehiculo)} disabled={actionLoading === vehiculo.id_vehiculo} className={`p-1 disabled:opacity-50 ${openMenuId === vehiculo.id_vehiculo ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`} title="Cambiar Estado">
                                                        <Settings className="w-5 h-5"/>
                                                    </button>

                                                    {openMenuId === vehiculo.id_vehiculo && (<>
                                                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-20">
                                                                <button onClick={() => handleEstadoChange(vehiculo.id_vehiculo, 'activo')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700">
                                                                    🟢 Marcar Activo
                                                                </button>
                                                                <button onClick={() => handleEstadoChange(vehiculo.id_vehiculo, 'mantenimiento')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700">
                                                                    🟡 Mantenimiento
                                                                </button>
                                                                <button onClick={() => handleEstadoChange(vehiculo.id_vehiculo, 'retirado')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700">
                                                                    🔴 Marcar Retirado
                                                                </button>
                                                            </div>
                                                        </>)}
                                                </div>

                                                <button onClick={() => handleDelete(vehiculo.id_vehiculo)} disabled={actionLoading === vehiculo.id_vehiculo} className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50" title="Eliminar Vehículo">
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>)))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>);
}
