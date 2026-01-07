'use client';
import { useState } from 'react';
import { Truck, User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
// Ciudades principales del Perú con sus códigos UBIGEO
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
export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        confirmPassword: '',
        telefono: '',
        direccion: '',
        ciudad: '150101', // Lima por defecto
        tipo_documento: 'DNI',
        numero_documento: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // Validaciones básicas
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Error al registrar');
            }
            else {
                setSuccess(true);
            }
        }
        catch (err) {
            setError('Error de conexión. Intente nuevamente.');
        }
        finally {
            setLoading(false);
        }
    };
    if (success) {
        return (<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-6 shadow rounded-lg text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
                        <p className="text-gray-600 mb-6">Tu cuenta ha sido creada correctamente.</p>
                        <Link href="/login" className="inline-block w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </div>);
    }
    return (<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
            <div className="sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="flex justify-center">
                    <Truck className="h-12 w-12 text-blue-600"/>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Crear Cuenta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Regístrate como cliente de Paquetería Perú
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-8 px-6 shadow rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombres</label>
                                <div className="mt-1 relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                    <input type="text" required value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Juan"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                                <input type="text" required value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Pérez"/>
                            </div>
                        </div>

                        {/* Documento */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo Doc.</label>
                                <select value={formData.tipo_documento} onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                    <option value="DNI">DNI</option>
                                    <option value="RUC">RUC</option>
                                    <option value="CE">CE</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Número</label>
                                <input type="text" required value={formData.numero_documento} onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="12345678"/>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                            <div className="mt-1 relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="juan@ejemplo.com"/>
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <div className="mt-1 relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                <input type="tel" required value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="987654321"/>
                            </div>
                        </div>

                        {/* Ciudad y Dirección */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                                <select value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                    {CIUDADES.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                <div className="mt-1 relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                    <input type="text" required value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Av. Principal 123"/>
                                </div>
                            </div>
                        </div>

                        {/* Contraseñas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                <div className="mt-1 relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                    <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="••••••"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirmar</label>
                                <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="••••••"/>
                            </div>
                        </div>

                        {error && (<div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                                {error}
                            </div>)}

                        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 transition">
                            {loading ? 'Registrando...' : 'Crear Cuenta'}
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                                Inicia Sesión
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>);
}
