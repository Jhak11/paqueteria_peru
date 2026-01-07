'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Package, AlertTriangle, CheckCircle, UserCheck } from 'lucide-react';

function EntregaForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchCode, setSearchCode] = useState(searchParams.get('code') || '');
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [documentVerify, setDocumentVerify] = useState('');
    const [processing, setProcessing] = useState(false);
    const [successData, setSuccessData] = useState(null);

    useEffect(() => {
        if (searchParams.get('code')) {
            handleSearch(searchParams.get('code'));
        }
    }, []);

    const handleSearch = async (codeToSearch) => {
        if (!codeToSearch) codeToSearch = searchCode;
        if (!codeToSearch) return;

        setLoading(true);
        setError(null);
        setShipment(null);
        setSuccessData(null);

        try {
            const res = await fetch(`/api/counter/shipments?code=${codeToSearch}`);
            const data = await res.json();

            if (res.ok) {
                setShipment(data.shipment);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Error de conexión');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelivery = async () => {
        if (!shipment || !documentVerify) return;

        if (documentVerify !== shipment.destinatario_documento) {
            alert('El número de documento no coincide con el destinatario');
            return;
        }

        if (!confirm('¿Confirma que está entregando el paquete al destinatario correcto?')) return;

        setProcessing(true);
        try {
            const res = await fetch('/api/counter/delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo_seguimiento: shipment.codigo_seguimiento,
                    documento_destinatario: documentVerify
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessData(data);
                setShipment(null);
                setDocumentVerify('');
                setSearchCode('');
                router.refresh();
            } else {
                alert(data.error || 'Error al procesar entrega');
            }
        } catch (err) {
            console.error(err);
            alert('Error al conectar con el servidor');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-8 mt-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="bg-green-600 p-2 rounded-lg text-white">
                        <CheckCircle className="w-6 h-6" />
                    </span>
                    Entrega de Paquetes
                </h1>
                <p className="text-gray-500 ml-12 mt-1">Verificación y entrega final al destinatario</p>
            </header>

            {/* BUSCADOR */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Ingrese Código de Seguimiento (Ej: PE-ABC-123)"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg uppercase font-mono"
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading}
                        className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition disabled:opacity-50"
                    >
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}
            </div>

            {/* DETALLES DEL ENVÍO */}
            {shipment && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header Envío */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Envío</p>
                            <p className="text-xl font-mono font-bold text-gray-900">{shipment.codigo_seguimiento}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${shipment.estado_nombre === 'En Almacén Destino'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {shipment.estado_nombre}
                        </div>
                    </div>

                    <div className="p-6 grid md:grid-cols-2 gap-8">
                        {/* Columna Izquierda: Datos */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Destinatario</h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p className="font-bold text-lg text-gray-900">{shipment.nombre_destinatario}</p>
                                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                                            DOC: {shipment.destinatario_documento || 'No registrado'}
                                        </span>
                                    </p>
                                    <p className="text-gray-600 mt-1">Tel: {shipment.destinatario_telefono}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Contenido</h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p className="text-gray-900 font-medium">{shipment.paquetes_cantidad} Paquete(s)</p>
                                    <p className="text-sm text-gray-600 mt-1">{shipment.paquetes_descripcion}</p>
                                </div>
                            </div>

                            {!shipment.is_at_correct_agency && (
                                <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
                                    <p className="font-bold flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> Error de Agencia
                                    </p>
                                    <p className="text-sm mt-1">
                                        Este paquete está destinado a: <strong>{shipment.agencia_destino}</strong>.
                                        No puede ser entregado aquí.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Columna Derecha: Acción */}
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                                <UserCheck className="w-5 h-5" /> Confirmar Entrega
                            </h3>

                            {shipment.estado_nombre !== 'En Almacén Destino' ? (
                                <div className="text-center py-6 text-gray-500">
                                    <p>El paquete no está listo para entrega.</p>
                                    <p className="text-sm">(Estado actual: {shipment.estado_nombre})</p>
                                </div>
                            ) : !shipment.is_at_correct_agency ? (
                                <div className="text-center py-6 text-red-500 font-medium">
                                    No se puede entregar en esta agencia.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-green-800 mb-1">
                                            Verificar Documento Destinatario
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ingrese DNI/CE del receptor"
                                            className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            value={documentVerify}
                                            onChange={(e) => setDocumentVerify(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={handleDelivery}
                                        disabled={!documentVerify || processing}
                                        className="w-full py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md transition disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {processing ? 'Procesando...' : 'Entregar Paquete'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS MESSAGE */}
            {successData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Entrega Exitosa!</h2>
                        <p className="text-gray-600 mb-6">
                            El paquete <span className="font-mono font-bold text-gray-900">{successData.codigo_seguimiento}</span> ha sido marcado como entregado.
                        </p>
                        <button
                            onClick={() => setSuccessData(null)}
                            className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition"
                        >
                            Cerrar y Continuar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EntregaPage() {
    return (
        <Suspense fallback={<div className="text-center py-20">Cargando...</div>}>
            <EntregaForm />
        </Suspense>
    );
}
