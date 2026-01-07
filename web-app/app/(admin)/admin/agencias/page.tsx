
'use client'

import { useState, useEffect } from 'react';
import { MapPin, Phone, Building2, Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface Agency {
    id_agencia: number;
    nombre: string;
    direccion: string;
    tipo: 'origen' | 'destino' | 'mixta';
    telefono: string;
    estado: 'activa' | 'cerrada';
    departamento: string;
    provincia: string;
    distrito: string;
}

export default function AgenciasPage() {
    const [agencias, setAgencias] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('/api/admin/agencias')
            .then(res => res.json())
            .then(data => {
                // Ensure data is array (handle potential errors)
                if (Array.isArray(data)) {
                    setAgencias(data);
                } else {
                    console.error("API did not return an array:", data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredAgencias = agencias.filter(a =>
        a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="text-blue-600" />
                        Gestión de Agencias
                    </h1>
                    <p className="text-gray-600">Administra las sedes y puntos de distribución</p>
                </div>
                <Link
                    href="/admin/agencias/nuevo" // This page will need to be created if not exists
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" /> Nueva Agencia
                </Link>
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar agencia por nombre o ciudad..."
                    className="pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agencia</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Cargando agencias...
                                    </td>
                                </tr>
                            ) : filteredAgencias.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron agencias
                                    </td>
                                </tr>
                            ) : (
                                filteredAgencias.map((agencia) => (
                                    <tr key={agencia.id_agencia} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded text-blue-600">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{agencia.nombre}</div>
                                                    <div className="text-xs text-gray-500">ID: {agencia.id_agencia}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm">
                                                <span className="text-gray-900 font-medium">{agencia.provincia}, {agencia.departamento}</span>
                                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {agencia.direccion}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${agencia.tipo === 'mixta' ? 'bg-purple-100 text-purple-800' :
                                                    agencia.tipo === 'origen' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-cyan-100 text-cyan-800'
                                                }`}>
                                                {agencia.tipo.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {agencia.telefono || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agencia.estado === 'activa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {agencia.estado === 'activa' ? 'Activa' : 'Cerrada'}
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
