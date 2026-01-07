'use client'

import { useState } from 'react';
import { Building2, User, Mail, Phone, MapPin, CreditCard, FileText, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

// Ciudades principales
const CIUDADES = [
    { id: '150101', nombre: 'Lima' },
    { id: '040101', nombre: 'Arequipa' },
    { id: '130101', nombre: 'Trujillo' },
    { id: '140101', nombre: 'Chiclayo' },
    { id: '200101', nombre: 'Piura' },
    { id: '080101', nombre: 'Cusco' },
    { id: '120101', nombre: 'Huancayo' },
    { id: '160101', nombre: 'Iquitos' },
];

export default function NuevaEmpresaPage() {
    const [formData, setFormData] = useState({
        // Datos de la empresa
        razon_social: '',
        nombre_comercial: '',
        ruc: '',
        direccion_fiscal: '',
        ciudad: '150101',
        telefono_central: '',
        sitio_web: '',
        linea_credito: '0',
        dias_credito: '0',
        porcentaje_descuento: '0',
        // Datos del contacto principal
        contacto_nombres: '',
        contacto_apellidos: '',
        contacto_email: '',
        contacto_telefono: '',
        contacto_cargo: '',
        contacto_documento: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/admin/empresas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al registrar empresa');
            } else {
                setSuccess(data);
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Empresa Registrada!</h2>
                    <p className="text-gray-600 mb-6">La empresa y el usuario principal han sido creados.</p>

                    <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                        <p className="text-sm text-gray-600 mb-2"><strong>Empresa:</strong> {formData.razon_social}</p>
                        <p className="text-sm text-gray-600 mb-2"><strong>RUC:</strong> {formData.ruc}</p>
                        <p className="text-sm text-gray-600 mb-2"><strong>Usuario:</strong> {success.email}</p>
                        <p className="text-sm font-medium text-blue-700">
                            <strong>Contraseña temporal:</strong> {success.tempPassword}
                        </p>
                    </div>

                    <p className="text-xs text-gray-500 mb-6">
                        Envíe estas credenciales al contacto de la empresa para que pueda acceder al sistema.
                    </p>

                    <Link href="/admin/empresas" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Ver Empresas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/admin" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        Registrar Empresa Corporativa (B2B)
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Crear cuenta de empresa con línea de crédito y usuario principal
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* DATOS DE LA EMPRESA */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Datos Fiscales
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="ruc" className="block text-sm font-medium text-gray-700">RUC *</label>
                                <input
                                    id="ruc"
                                    type="text"
                                    required
                                    maxLength={11}
                                    value={formData.ruc}
                                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                    placeholder="20123456789"
                                />
                            </div>
                            <div>
                                <label htmlFor="razon_social" className="block text-sm font-medium text-gray-700">Razón Social *</label>
                                <input
                                    id="razon_social"
                                    type="text"
                                    required
                                    value={formData.razon_social}
                                    onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                    placeholder="Empresa SAC"
                                />
                            </div>
                            <div>
                                <label htmlFor="nombre_comercial" className="block text-sm font-medium text-gray-700">Nombre Comercial</label>
                                <input
                                    id="nombre_comercial"
                                    type="text"
                                    value={formData.nombre_comercial}
                                    onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                    placeholder="Mi Empresa"
                                />
                            </div>
                            <div>
                                <label htmlFor="telefono_central" className="block text-sm font-medium text-gray-700">Teléfono Central</label>
                                <input
                                    id="telefono_central"
                                    type="tel"
                                    value={formData.telefono_central}
                                    onChange={(e) => setFormData({ ...formData, telefono_central: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                    placeholder="01-2345678"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                                <select
                                    value={formData.ciudad}
                                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                >
                                    {CIUDADES.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dirección Fiscal *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.direccion_fiscal}
                                    onChange={(e) => setFormData({ ...formData, direccion_fiscal: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                    placeholder="Av. Industrial 123"
                                />
                            </div>
                        </div>
                    </section>

                    {/* CONDICIONES COMERCIALES */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Condiciones Comerciales
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Línea de Crédito (S/.)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.linea_credito}
                                    onChange={(e) => setFormData({ ...formData, linea_credito: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Días de Crédito</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="90"
                                    value={formData.dias_credito}
                                    onChange={(e) => setFormData({ ...formData, dias_credito: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descuento (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    value={formData.porcentaje_descuento}
                                    onChange={(e) => setFormData({ ...formData, porcentaje_descuento: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                        </div>
                    </section>

                    {/* CONTACTO PRINCIPAL */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" /> Contacto Principal (Acceso al Sistema)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombres *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.contacto_nombres}
                                    onChange={(e) => setFormData({ ...formData, contacto_nombres: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apellidos *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.contacto_apellidos}
                                    onChange={(e) => setFormData({ ...formData, contacto_apellidos: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">DNI *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={8}
                                    value={formData.contacto_documento}
                                    onChange={(e) => setFormData({ ...formData, contacto_documento: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cargo</label>
                                <input
                                    type="text"
                                    value={formData.contacto_cargo}
                                    onChange={(e) => setFormData({ ...formData, contacto_cargo: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                    placeholder="Gerente de Logística"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.contacto_email}
                                    onChange={(e) => setFormData({ ...formData, contacto_email: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.contacto_telefono}
                                    onChange={(e) => setFormData({ ...formData, contacto_telefono: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link href="/admin/empresas" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'Registrando...' : 'Registrar Empresa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
