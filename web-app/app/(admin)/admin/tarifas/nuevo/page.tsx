'use client'

import { useState } from 'react';
import { DollarSign, Map, Clock, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DEPARTAMENTOS = [
    'AMAZONAS', 'ANCASH', 'APURIMAC', 'AREQUIPA', 'AYACUCHO', 'CAJAMARCA',
    'CALLAO', 'CUSCO', 'HUANCAVELICA', 'HUANUCO', 'ICA', 'JUNIN',
    'LA LIBERTAD', 'LAMBAYEQUE', 'LIMA', 'LORETO', 'MADRE DE DIOS',
    'MOQUEGUA', 'PASCO', 'PIURA', 'PUNO', 'SAN MARTIN', 'TACNA',
    'TUMBES', 'UCAYALI'
];

export default function NuevaTarifaPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        departamento_origen: 'LIMA',
        departamento_destino: '',
        tipo_servicio: 'estandar',
        precio_base: '',
        peso_base_kg: '1.00',
        precio_kg_extra: '',
        tiempo_min_dias: '1',
        tiempo_max_dias: '3'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/tarifas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al guardar tarifa');
            }

            router.push('/admin/tarifas');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/tarifas" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Volver al Tarifario
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        Nueva Tarifa de Envío
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Configura precios por ruta y nivel de servicio</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Ruta */}
                    <section>
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Map className="w-4 h-4" /> Configuración de Ruta
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Departamento Origen</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-2 px-3 border"
                                    value={formData.departamento_origen}
                                    onChange={e => setFormData({ ...formData, departamento_origen: e.target.value })}
                                >
                                    {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Departamento Destino</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white"
                                    value={formData.departamento_destino}
                                    onChange={e => setFormData({ ...formData, departamento_destino: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-gray-200"></div>

                    {/* Precios y Tiempos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section>
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Esquema de Precios
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo de Servicio</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white"
                                        value={formData.tipo_servicio}
                                        onChange={e => setFormData({ ...formData, tipo_servicio: e.target.value })}
                                    >
                                        <option value="estandar">Estándar</option>
                                        <option value="express">Express (Prioritario)</option>
                                        <option value="carga_pesada">Carga Pesada</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Precio Base (S/.)</label>
                                        <input
                                            type="number" step="0.01" required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white"
                                            value={formData.precio_base}
                                            onChange={e => setFormData({ ...formData, precio_base: e.target.value })}
                                            placeholder="15.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Peso Base (Kg)</label>
                                        <input
                                            type="number" step="0.1" required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white"
                                            value={formData.peso_base_kg}
                                            onChange={e => setFormData({ ...formData, peso_base_kg: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Precio por Kg Extra (S/.)</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white"
                                        value={formData.precio_kg_extra}
                                        onChange={e => setFormData({ ...formData, precio_kg_extra: e.target.value })}
                                        placeholder="3.50"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Tiempos de Entrega
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mínimo (Días)</label>
                                    <input
                                        type="number" min="0" required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white"
                                        value={formData.tiempo_min_dias}
                                        onChange={e => setFormData({ ...formData, tiempo_min_dias: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Máximo (Días)</label>
                                    <input
                                        type="number" min="0" required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-2 px-3 border text-gray-900 bg-white"
                                        value={formData.tiempo_max_dias}
                                        onChange={e => setFormData({ ...formData, tiempo_max_dias: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-100 text-sm text-yellow-800">
                                <p><strong>Nota:</strong> Los tiempos Express suelen ser de 0 a 1 día para destinos principales.</p>
                            </div>
                        </section>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link
                            href="/admin/tarifas"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                        >
                            {loading ? 'Guardando...' : 'Guardar Tarifa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
