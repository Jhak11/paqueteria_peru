'use client';
import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NuevaAgenciaPage() {
    const router = useRouter();
    const [ubigeos, setUbigeos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        id_ubigeo: '',
        tipo: 'mixta',
        telefono: '',
        estado: 'activa'
    });

    useEffect(() => {
        fetchUbigeos();
    }, []);

    const fetchUbigeos = async () => {
        try {
            const res = await fetch('/api/ubigeo');
            const data = await res.json();
            if (Array.isArray(data)) {
                setUbigeos(data);
            }
        } catch (error) {
            console.error('Error cargando ubigeos:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/agencias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Agencia creada exitosamente');
                router.push('/admin/agencias');
            } else {
                const data = await res.json();
                alert(data.error || 'Error al crear la agencia');
            }
        } catch (error) {
            alert('Error al crear la agencia');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin/agencias"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Agencias
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-7 h-7 text-blue-600" />
                    Nueva Agencia
                </h1>
                <p className="text-gray-600 mt-1">Registra una nueva sede o punto de distribución</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Agencia *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej: Sede Central Lima"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej: Av. Javier Prado Este 2501"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación (Ubigeo) *
                    </label>
                    <select
                        required
                        value={formData.id_ubigeo}
                        onChange={(e) => setFormData({ ...formData, id_ubigeo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Seleccionar ubicación</option>
                        {ubigeos.map(ub => (
                            <option key={ub.id_ubigeo} value={ub.id_ubigeo}>
                                {ub.distrito}, {ub.provincia}, {ub.departamento}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo *
                        </label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="mixta">Mixta</option>
                            <option value="origen">Origen</option>
                            <option value="destino">Destino</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado *
                        </label>
                        <select
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="activa">Activa</option>
                            <option value="cerrada">Cerrada</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                    </label>
                    <input
                        type="text"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej: 01-224-5555"
                    />
                </div>

                <div className="flex gap-4 pt-4 border-t">
                    <Link
                        href="/admin/agencias"
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? 'Creando...' : 'Crear Agencia'}
                    </button>
                </div>
            </form>
        </div>
    );
}
