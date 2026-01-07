'use client'

import { useState } from 'react';
import { Search, MapPin, Calendar, Package, ArrowRight, Circle, Clock } from 'lucide-react';

async function getTrackingInfo(code: string) {
    const response = await fetch(`/api/tracking/${encodeURIComponent(code)}`);
    if (!response.ok) return null;
    return response.json();
}


export default function TrackingPage() {
    const [code, setCode] = useState('');
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setData(null);

        try {
            const result = await getTrackingInfo(code.trim());
            if (result) {
                setData(result);
            } else {
                setError('No encontramos ningún envío con ese código. Verifícalo e intenta nuevamente.');
            }
        } catch (err) {
            setError('Hubo un problema al consultar el servicio. Por favor intenta más tarde.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center">

            {/* Hero Section */}
            <section className="w-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-20 px-4 relative overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-700/50 border border-blue-500/30 text-blue-100 text-sm font-medium mb-6">
                        Rastreo en Tiempo Real
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                        Sigue tu envío paso a paso
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
                        Ingresa tu código de seguimiento y conoce la ubicación exacta de tu paquete al instante.
                    </p>

                    {/* Search Card */}
                    <div className="bg-white p-2 rounded-2xl shadow-xl max-w-2xl mx-auto transform transition-all hover:scale-[1.01]">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-11 pr-4 py-4 rounded-xl border border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-lg"
                                    placeholder="Número de seguimiento (Ej: PE-675-630)"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Rastrear <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 max-w-lg mx-auto backdrop-blur-sm animate-fade-in-up">
                            <p className="text-red-200 font-medium flex items-center justify-center gap-2">
                                <Circle className="h-4 w-4 fill-current" /> {error}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Results Section */}
            {data && (
                <section className="w-full max-w-5xl mx-auto px-4 -mt-10 relative z-20 pb-20 animate-fade-in-up">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Status Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                                <div className="relative z-10">
                                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Estado Actual</h2>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                            <Package className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <span className="block text-2xl font-bold text-gray-900">{data.info.estado_actual}</span>
                                            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                En tiempo
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium">Origen</p>
                                            <p className="text-gray-900 font-semibold flex items-center gap-2 mt-1">
                                                <MapPin className="h-4 w-4 text-gray-400" /> {data.info.origen}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium">Destino</p>
                                            <p className="text-gray-900 font-semibold flex items-center gap-2 mt-1">
                                                <MapPin className="h-4 w-4 text-gray-400" /> {data.info.destino}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium">Entrega Estimada</p>
                                            <p className="text-gray-900 font-semibold flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {data.info.fecha_estimada_entrega
                                                    ? new Date(data.info.fecha_estimada_entrega).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
                                                    : 'Por confirmar'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Update Timeline */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 min-h-[400px]">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-gray-400" /> Historial de Movimientos
                                </h3>

                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">

                                    {data.historial.map((evento: any, index: number) => (
                                        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Icon/Dot */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                {index === 0 ? (
                                                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                                                ) : (
                                                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                                )}
                                            </div>

                                            {/* Card Content */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className={`font-bold text-base ${index === 0 ? 'text-blue-700' : 'text-gray-700'}`}>
                                                            {evento.estado}
                                                        </span>
                                                        <time className="text-xs font-medium text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                                                            {new Date(evento.fecha_hora).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </time>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{evento.descripcion_evento}</p>
                                                    {evento.ubicacion && (
                                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
                                                            <MapPin className="h-3 w-3" /> {evento.ubicacion}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {data.historial.length === 0 && (
                                        <div className="text-center py-10 text-gray-400">
                                            No hay historial disponible para este envío.
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>
                </section>
            )}
        </div>
    );
}
