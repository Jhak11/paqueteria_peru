'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Package, MapPin, CheckCircle, Clock } from 'lucide-react';

export default function ConductorDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [viajeAsignado, setViajeAsignado] = useState(null);
    const [viajeActual, setViajeActual] = useState(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        setLoading(true);
        try {
            // Check for trip in transit first
            const resActual = await fetch('/api/conductor/viaje-actual');
            const dataActual = await resActual.json();

            if (dataActual.viaje) {
                setViajeActual(dataActual);
                setLoading(false);
                return;
            }

            // If no trip in transit, check for assigned trip
            const resAsignado = await fetch('/api/conductor/viaje-asignado');
            const dataAsignado = await resAsignado.json();

            if (dataAsignado.viaje) {
                setViajeAsignado(dataAsignado.viaje);
            }
        } catch (error) {
            console.error('Error checking status:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    // If trip in transit, show completion interface
    if (viajeActual) {
        return <TripInTransit data={viajeActual} onComplete={() => checkStatus()} />;
    }

    // If assigned trip, show loading interface
    if (viajeAsignado) {
        return <LoadTrip viaje={viajeAsignado} onStart={() => checkStatus()} />;
    }

    // No trips
    return (
        <div className="max-w-2xl mx-auto p-6 mt-20">
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin Viajes Asignados</h2>
                <p className="text-gray-600 mb-6">
                    Actualmente no tienes viajes programados. Contacta con el administrador para más información.
                </p>
                <button
                    onClick={() => checkStatus()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Actualizar
                </button>
            </div>
        </div>
    );
}

// Component for loading trip
function LoadTrip({ viaje, onStart }) {
    const [enviosDisponibles, setEnviosDisponibles] = useState([]);
    const [selectedEnvios, setSelectedEnvios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [iniciando, setIniciando] = useState(false);

    useEffect(() => {
        loadAvailableShipments();
    }, [viaje.id_viaje]);

    const loadAvailableShipments = async () => {
        try {
            const res = await fetch(`/api/conductor/envios-disponibles/${viaje.id_viaje}`);
            const data = await res.json();
            setEnviosDisponibles(data.envios || []);
        } catch (error) {
            console.error('Error loading shipments:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleEnvio = (id_envio) => {
        if (selectedEnvios.includes(id_envio)) {
            setSelectedEnvios(selectedEnvios.filter(id => id !== id_envio));
        } else {
            setSelectedEnvios([...selectedEnvios, id_envio]);
        }
    };

    const iniciarViaje = async () => {
        if (selectedEnvios.length === 0) {
            alert('Debes seleccionar al menos un envío');
            return;
        }

        if (!confirm(`¿Iniciar viaje con ${selectedEnvios.length} envío(s)?`)) {
            return;
        }

        setIniciando(true);
        try {
            const res = await fetch('/api/conductor/iniciar-viaje', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_viaje: viaje.id_viaje,
                    id_envios: selectedEnvios
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Error al iniciar viaje');
                return;
            }

            alert('¡Viaje iniciado exitosamente!');
            onStart();
        } catch (error) {
            console.error('Error starting trip:', error);
            alert('Error al iniciar viaje');
        } finally {
            setIniciando(false);
        }
    };

    const totalPeso = enviosDisponibles
        .filter(e => selectedEnvios.includes(e.id_envio))
        .reduce((sum, e) => sum + parseFloat(e.peso_total || 0), 0);

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Truck className="w-6 h-6" />
                    </div>
                    Cargar Viaje
                </h1>
                <p className="text-gray-500 ml-12 mt-1">Selecciona los envíos para tu ruta</p>
            </header>

            {/* Trip Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border-2 border-blue-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Truck className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Viaje #{viaje.id_viaje}</h2>
                        <p className="text-sm text-gray-600">{viaje.ruta}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Vehículo</p>
                        <p className="font-bold text-gray-900">{viaje.vehiculo_placa}</p>
                        <p className="text-xs text-gray-600">{viaje.vehiculo_marca} {viaje.vehiculo_modelo}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Salida Programada</p>
                        <p className="font-bold text-gray-900">
                            {new Date(viaje.fecha_salida).toLocaleString('es-PE')}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Seleccionados</p>
                        <p className="font-bold text-blue-600 text-2xl">{selectedEnvios.length}</p>
                        <p className="text-xs text-gray-600">{totalPeso.toFixed(2)} kg</p>
                    </div>
                </div>
            </div>

            {/* Available Shipments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Envíos Disponibles ({enviosDisponibles.length})
                    </h3>
                </div>

                <div className="p-6">
                    {loading ? (
                        <p className="text-center text-gray-500 py-8">Cargando envíos...</p>
                    ) : enviosDisponibles.length === 0 ? (
                        <p className="text-center text-gray-400 py-8 italic">No hay envíos disponibles para esta ruta</p>
                    ) : (
                        <div className="space-y-3">
                            {enviosDisponibles.map((envio) => (
                                <label
                                    key={envio.id_envio}
                                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${selectedEnvios.includes(envio.id_envio)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5"
                                        checked={selectedEnvios.includes(envio.id_envio)}
                                        onChange={() => toggleEnvio(envio.id_envio)}
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{envio.codigo_seguimiento}</p>
                                        <p className="text-sm text-gray-600">
                                            <MapPin className="w-3 h-3 inline mr-1" />
                                            {envio.destinatario} • {envio.destino_direccion}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{parseFloat(envio.peso_total || 0).toFixed(2)} kg</p>
                                        <p className="text-xs text-gray-500">{envio.num_paquetes} paquete(s)</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={iniciarViaje}
                disabled={iniciando || selectedEnvios.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
                {iniciando ? (
                    'Iniciando...'
                ) : (
                    <>
                        <Truck className="w-6 h-6" />
                        <span>🚪 CERRAR PUERTAS E INICIAR VIAJE</span>
                    </>
                )}
            </button>
        </div>
    );
}

// Component for trip in transit
function TripInTransit({ data, onComplete }) {
    const [finalizando, setFinalizando] = useState(false);
    const { viaje, envios } = data;

    const finalizarViaje = async () => {
        // Check if trip has shipments
        if (!envios || envios.length === 0) {
            alert('Este viaje no tiene envíos asignados. No se puede finalizar un viaje vacío.');
            return;
        }

        if (!confirm(`¿Finalizar viaje en ${viaje.destino} con ${envios.length} envío(s)?`)) {
            return;
        }

        setFinalizando(true);
        try {
            const res = await fetch('/api/conductor/finalizar-viaje', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_viaje: viaje.id_viaje })
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error || 'Error al finalizar viaje');
                return;
            }

            alert('¡Viaje finalizado exitosamente!');
            onComplete();
        } catch (error) {
            console.error('Error completing trip:', error);
            alert('Error al finalizar viaje');
        } finally {
            setFinalizando(false);
        }
    };

    const totalPeso = envios.reduce((sum, e) => sum + parseFloat(e.peso_total || 0), 0);

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-orange-600 p-2 rounded-lg text-white">
                        <Truck className="w-6 h-6" />
                    </div>
                    Viaje en Curso
                </h1>
                <p className="text-gray-500 ml-12 mt-1">Finaliza tu entrega en la agencia destino</p>
            </header>

            {/* Trip Status Card */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl shadow-md border-2 border-orange-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Truck className="w-8 h-8 text-orange-600" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Viaje #{viaje.id_viaje}</h2>
                            <p className="text-sm text-gray-600">{viaje.ruta}</p>
                        </div>
                    </div>
                    <span className="px-4 py-2 rounded-full text-sm font-bold uppercase bg-orange-100 text-orange-800 border-2 border-orange-300">
                        🟢 EN TRÁNSITO
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Vehículo</p>
                        <p className="font-bold text-gray-900">{viaje.vehiculo_placa}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Salida</p>
                        <p className="font-bold text-gray-900">
                            {new Date(viaje.fecha_salida).toLocaleString('es-PE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Carga</p>
                        <p className="font-bold text-blue-600 text-2xl">{envios.length}</p>
                        <p className="text-xs text-gray-600">{totalPeso.toFixed(2)} kg</p>
                    </div>
                </div>
            </div>

            {/* Loaded Shipments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Carga ({envios.length} envíos)
                    </h3>
                </div>

                <div className="p-6 space-y-3">
                    {envios.length === 0 ? (
                        <div className="text-center py-8 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                            <p className="text-yellow-800 font-medium">⚠️ Este viaje no tiene envíos asignados</p>
                            <p className="text-sm text-yellow-600 mt-2">
                                No se puede finalizar un viaje sin carga. Contacta con el administrador.
                            </p>
                        </div>
                    ) : (
                        envios.map((envio) => (
                            <div
                                key={envio.id_envio}
                                className="flex items-center gap-4 p-4 rounded-lg border-2 border-green-200 bg-green-50"
                            >
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{envio.codigo_seguimiento}</p>
                                    <p className="text-sm text-gray-600">
                                        <MapPin className="w-3 h-3 inline mr-1" />
                                        {envio.destinatario} • {envio.destino_direccion}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{parseFloat(envio.peso_total || 0).toFixed(2)} kg</p>
                                    <p className="text-xs text-gray-500">{envio.num_paquetes} paquete(s)</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Finalize Button */}
            <button
                onClick={finalizarViaje}
                disabled={finalizando || envios.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
                {finalizando ? (
                    'Finalizando...'
                ) : envios.length === 0 ? (
                    <>
                        <span>⚠️ No se puede finalizar (sin carga)</span>
                    </>
                ) : (
                    <>
                        <MapPin className="w-6 h-6" />
                        <span>📍 FINALIZAR VIAJE EN AGENCIA DESTINO</span>
                    </>
                )}
            </button>
        </div>
    );
}
