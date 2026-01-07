'use client'

import { useState } from 'react';
import { Truck, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NuevoVehiculoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        capacidad_kg: '',
        tipo: 'furgoneta',
        estado: 'activo'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/vehiculos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al guardar vehículo');
            }

            router.push('/admin/vehiculos');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/vehiculos" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Volver a Flota
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Truck className="w-6 h-6 text-blue-600" />
                        Registrar Nuevo Vehículo
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Placa</label>
                            <input
                                type="text" required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white placeholder-gray-400"
                                value={formData.placa}
                                onChange={e => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                                placeholder="ABC-123"
                                maxLength={10}
                            />
                            <p className="mt-1 text-xs text-gray-500">Identificador único del vehículo.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Marca</label>
                            <input
                                type="text" required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white placeholder-gray-400"
                                value={formData.marca}
                                onChange={e => setFormData({ ...formData, marca: e.target.value })}
                                placeholder="Ej: Toyota"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Modelo</label>
                            <input
                                type="text" required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white placeholder-gray-400"
                                value={formData.modelo}
                                onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                                placeholder="Ej: Hilux"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Capacidad (Kg)</label>
                            <input
                                type="number" required min="1"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white placeholder-gray-400"
                                value={formData.capacidad_kg}
                                onChange={e => setFormData({ ...formData, capacidad_kg: e.target.value })}
                                placeholder="1000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Vehículo</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white"
                                value={formData.tipo}
                                onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                            >
                                <option value="moto">Moto</option>
                                <option value="furgoneta">Furgoneta</option>
                                <option value="camioneta">Camioneta</option>
                                <option value="camion">Camión</option>
                                <option value="bus">Bus</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado Inicial</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white"
                                value={formData.estado}
                                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                            >
                                <option value="activo">Activo</option>
                                <option value="mantenimiento">En Mantenimiento</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link
                            href="/admin/vehiculos"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {loading ? 'Guardando...' : 'Guardar Vehículo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
