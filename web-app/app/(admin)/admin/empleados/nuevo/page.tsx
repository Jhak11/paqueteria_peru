'use client'

import { useState, useEffect } from 'react';
import { UserPlus, User, Mail, Phone, MapPin, Shield, ArrowLeft, Check } from 'lucide-react';
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

// Roles internos disponibles
const ROLES_INTERNOS = [
    { id: 3, nombre: 'Empleado', descripcion: 'Personal de mostrador y almacén' },
    { id: 4, nombre: 'Conductor', descripcion: 'Chofer de ruta y reparto' },
];

export default function NuevoEmpleadoPage() {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        tipo_documento: 'DNI',
        numero_documento: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '150101',
        rol: '3', // Empleado por defecto
        agencia: ''
    });
    const [agencias, setAgencias] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/agencias/list')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAgencias(data);
            })
            .catch(err => console.error(err));
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/admin/empleados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al registrar empleado');
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
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Empleado Registrado!</h2>
                    <p className="text-gray-600 mb-6">La cuenta del empleado ha sido creada.</p>

                    <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Nombre:</strong> {formData.nombres} {formData.apellidos}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Rol:</strong> {ROLES_INTERNOS.find(r => r.id === parseInt(formData.rol))?.nombre}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Usuario:</strong> {success.email}
                        </p>
                        <p className="text-sm font-medium text-blue-700">
                            <strong>Contraseña temporal:</strong> {success.tempPassword}
                        </p>
                    </div>

                    <p className="text-xs text-gray-500 mb-6">
                        Entregue estas credenciales al empleado. Deberá cambiar su contraseña en el primer inicio.
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => {
                                setSuccess(null);
                                setFormData({
                                    nombres: '', apellidos: '', tipo_documento: 'DNI', numero_documento: '',
                                    email: '', telefono: '', direccion: '', ciudad: '150101', rol: '3'
                                });
                            }}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                        >
                            Registrar Otro
                        </button>
                        <Link href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Ir al Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/admin" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-blue-600" />
                        Registrar Empleado Interno
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Crear cuenta para personal de la empresa (conductores, counter, etc.)
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Datos Personales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombres *</label>
                            <div className="mt-1 relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.nombres}
                                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Apellidos *</label>
                            <input
                                type="text"
                                required
                                value={formData.apellidos}
                                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                            />
                        </div>
                    </div>

                    {/* Documento */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo Doc.</label>
                            <select
                                value={formData.tipo_documento}
                                onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                            >
                                <option value="DNI">DNI</option>
                                <option value="CE">CE</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Número *</label>
                            <input
                                type="text"
                                required
                                value={formData.numero_documento}
                                onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                            />
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo Electrónico *</label>
                            <div className="mt-1 relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                            <div className="mt-1 relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="tel"
                                    required
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="grid grid-cols-3 gap-4">
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
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Dirección</label>
                            <div className="mt-1 relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Agencia de Trabajo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="inline w-4 h-4 mr-1" /> Agencia Asignada *
                        </label>
                        <select
                            value={formData.agencia}
                            onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                            required
                        >
                            <option value="">Seleccione una sede...</option>
                            {agencias.map((a: any) => (
                                <option key={a.id_agencia} value={a.id_agencia}>{a.nombre}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Sede donde trabajará el empleado.</p>
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Shield className="inline w-4 h-4 mr-1" /> Rol del Empleado *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {ROLES_INTERNOS.map(rol => (
                                <label
                                    key={rol.id}
                                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${formData.rol === String(rol.id)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="rol"
                                        value={rol.id}
                                        checked={formData.rol === String(rol.id)}
                                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-800">{rol.nombre}</span>
                                        <p className="text-xs text-gray-500 mt-1">{rol.descripcion}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link href="/admin/empleados" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'Registrando...' : 'Registrar Empleado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
