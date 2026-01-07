'use client'

import { useState, useEffect } from 'react';
import { Search, Plus, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Tarifa {
    id_tarifa: number;
    departamento_origen: string;
    departamento_destino: string;
    tipo_servicio: string;
    precio_base: string;
    peso_base_kg: string;
    precio_kg_extra: string;
    tiempo_min_dias: number;
    tiempo_max_dias: number;
    estado: string;
}

export default function TarifasPage() {
    const [tarifas, setTarifas] = useState<Tarifa[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTarifas();
    }, []);

    const fetchTarifas = async () => {
        try {
            const res = await fetch('/api/admin/tarifas');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTarifas(data);
            }
        } catch (error) {
            console.error('Error cargando tarifas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTarifas = tarifas.filter(t =>
        t.departamento_origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.departamento_destino.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="text-green-600" />
                        Gestión de Tarifas
                    </h1>
                    <p className="text-gray-600">Configuración de precios por zonas y servicios</p>
                </div>
                <Link
                    href="/admin/tarifas/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                    <Plus className="w-4 h-4" /> Nueva Tarifa
                </Link>
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar por departamento origen o destino..."
                    className="pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Base</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kg Extra</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Cargando tarifas...
                                    </td>
                                </tr>
                            ) : filteredTarifas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron tarifas
                                    </td>
                                </tr>
                            ) : (
                                filteredTarifas.map((tarifa) => (
                                    <tr key={tarifa.id_tarifa} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                                {tarifa.departamento_origen}
                                                <span className="text-gray-400">→</span>
                                                {tarifa.departamento_destino}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${tarifa.tipo_servicio === 'express' ? 'bg-purple-100 text-purple-800' :
                                                    tarifa.tipo_servicio === 'carga_pesada' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {tarifa.tipo_servicio.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            S/. {parseFloat(tarifa.precio_base).toFixed(2)}
                                            <span className="text-xs text-gray-500 block">
                                                (Hasta {parseFloat(tarifa.peso_base_kg).toFixed(1)} kg)
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            + S/. {parseFloat(tarifa.precio_kg_extra).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {tarifa.tiempo_min_dias === tarifa.tiempo_max_dias
                                                    ? `${tarifa.tiempo_min_dias} día(s)`
                                                    : `${tarifa.tiempo_min_dias} - ${tarifa.tiempo_max_dias} días`
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tarifa.estado === 'vigente' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {tarifa.estado}
                                            </span>
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
