'use client'

import { useState, useEffect } from 'react';
import { Search, User, MapPin, Package, CreditCard, Printer, CheckCircle, Truck, Info, Settings, UserPlus } from 'lucide-react';

export default function RecepcionPage() {
    // --- ESTADOS ---
    // Remitente
    const [dniSearch, setDniSearch] = useState('');
    const [cliente, setCliente] = useState<any>(null);
    const [tempCliente, setTempCliente] = useState<any>(null); // Resultado temporal de búsqueda
    const [searchingCliente, setSearchingCliente] = useState(false);

    // Nuevo Cliente Modal
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [newClientForm, setNewClientForm] = useState({
        dni: '', nombre: '', apellido: '', telefono: '', email: '', direccion: ''
    });

    // Destino
    const [departamentos, setDepartamentos] = useState<any[]>([]);
    const [provincias, setProvincias] = useState<any[]>([]);
    const [distritos, setDistritos] = useState<any[]>([]);

    const [destino, setDestino] = useState({
        departamento: '',
        provincia: '',
        distrito_id: '',
        direccion: '',
        referencia: '',
        nombre_destinatario: '',
        telefono: ''
    });

    // Paquetes (Carrito)
    const [paquetesList, setPaquetesList] = useState<any[]>([]);
    const [formPaquete, setFormPaquete] = useState({
        peso: '',
        largo: '',
        ancho: '',
        alto: '',
        fragil: false,
        tipo_servicio: 'express'
    });

    // Cotización
    const [cotizacionActual, setCotizacionActual] = useState<any>(null); // Cotización del form actual
    const [calculando, setCalculando] = useState(false);
    const [totalEnvio, setTotalEnvio] = useState(0);

    // General
    const [loadingEnvio, setLoadingEnvio] = useState(false);
    const [envioExitoso, setEnvioExitoso] = useState<any>(null);

    // --- EFECTOS ---
    useEffect(() => {
        loadDepartamentos();
    }, []);

    // Recalcular total cuando cambia la lista
    useEffect(() => {
        const total = paquetesList.reduce((acc, p) => acc + parseFloat(p.costo), 0);
        setTotalEnvio(total);
    }, [paquetesList]);

    // Autocotizar Formulario Actual (Visualización previa)
    useEffect(() => {
        if (destino.departamento && formPaquete.peso) {
            const timer = setTimeout(() => {
                cotizarPaqueteForm();
            }, 600);
            return () => clearTimeout(timer);
        } else {
            setCotizacionActual(null);
        }
    }, [destino.departamento, formPaquete.peso, formPaquete.largo, formPaquete.ancho, formPaquete.alto]);


    // --- FUNCIONES DE UBIGEO ---
    const loadDepartamentos = async () => {
        try {
            const res = await fetch('/api/ubigeo?type=departamentos');
            setDepartamentos(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const handleDepChange = async (e: any) => {
        const dep = e.target.value;
        setDestino({ ...destino, departamento: dep, provincia: '', distrito_id: '' });
        setProvincias([]); setDistritos([]);
        if (dep) {
            const res = await fetch(`/api/ubigeo?type=provincias&departamento=${dep}`);
            setProvincias(await res.json());
        }
    };

    const handleProvChange = async (e: any) => {
        const prov = e.target.value;
        setDestino({ ...destino, provincia: prov, distrito_id: '' });
        setDistritos([]);
        if (prov) {
            const res = await fetch(`/api/ubigeo?type=distritos&departamento=${destino.departamento}&provincia=${prov}`);
            setDistritos(await res.json());
        }
    };

    // --- FUNCIONES REMITENTE ---
    const buscarCliente = async () => {
        if (dniSearch.length < 3) return;
        setSearchingCliente(true);
        setTempCliente(null);
        try {
            const res = await fetch(`/api/clientes/buscar?q=${dniSearch}`);
            const data = await res.json();
            if (data && data.length > 0) {
                setTempCliente(data[0]);
            } else {
                alert('Cliente no encontrado. Puede crearlo ahora.');
                setShowNewClientModal(true);
                setNewClientForm({ ...newClientForm, dni: dniSearch });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSearchingCliente(false);
        }
    };

    const confirmarCliente = () => {
        setCliente(tempCliente);
        setTempCliente(null);
    };

    const crearNuevoCliente = async () => {
        try {
            const res = await fetch('/api/clientes/quick-create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombres: newClientForm.nombre,
                    apellidos: newClientForm.apellido,
                    tipo_documento: newClientForm.dni.length === 11 ? 'RUC' : 'DNI',
                    numero_documento: newClientForm.dni,
                    telefono: newClientForm.telefono,
                    direccion: newClientForm.direccion,
                    email: newClientForm.email
                })
            });
            const data = await res.json();
            if (res.ok) {
                setCliente(data.cliente);
                setShowNewClientModal(false);
                setNewClientForm({ dni: '', nombre: '', apellido: '', telefono: '', email: '', direccion: '' });
                alert('Cliente creado exitosamente');
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error al crear cliente');
        }
    };

    // --- FUNCIONES COTIZACIÓN Y CARRITO ---
    const cotizarPaqueteForm = async () => {
        setCalculando(true);
        try {
            const res = await fetch('/api/cotizacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    departamento_origen: 'LIMA',
                    departamento_destino: destino.departamento,
                    peso_kg: formPaquete.peso,
                    alto: formPaquete.alto,
                    ancho: formPaquete.ancho,
                    largo: formPaquete.largo,
                    tipo_envio: formPaquete.tipo_servicio
                })
            });
            const data = await res.json();
            if (res.ok) {
                setCotizacionActual(data);
            } else {
                setCotizacionActual(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCalculando(false);
        }
    };

    const agregarPaquete = () => {
        if (!cotizacionActual) return;

        const nuevoPaquete = {
            id: Date.now(), // ID temporal
            peso: formPaquete.peso,
            largo: formPaquete.largo,
            ancho: formPaquete.ancho,
            alto: formPaquete.alto,
            fragil: formPaquete.fragil,
            tipo_servicio: formPaquete.tipo_servicio,
            costo: cotizacionActual.costo_total,
            peso_volumetrico: cotizacionActual.peso_facturable,
            descripcion: `Paquete ${paquetesList.length + 1} (${formPaquete.peso}kg)`
        };

        setPaquetesList([...paquetesList, nuevoPaquete]);

        // Reset Form
        setFormPaquete({
            peso: '', largo: '', ancho: '', alto: '', fragil: false, tipo_servicio: 'express'
        });
        setCotizacionActual(null);
    };

    const eliminarPaquete = (id: number) => {
        setPaquetesList(paquetesList.filter(p => p.id !== id));
    };

    // --- FUNCIONES REGISTRO ---
    const registrarEnvio = async () => {
        if (!cliente || !destino.distrito_id || paquetesList.length === 0) {
            alert('Por favor complete cliente, destino y agregue al menos un paquete');
            return;
        }

        setLoadingEnvio(true);
        try {
            const payload = {
                remitente: cliente,
                destino: {
                    ...destino,
                    ubigeo_id: destino.distrito_id
                },
                paquetes: paquetesList, // Enviamos el array
                pago: {
                    monto: totalEnvio,
                    metodo: 'efectivo'
                }
            };

            const res = await fetch('/api/counter/envios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setEnvioExitoso(data);

        } catch (error: any) {
            alert(error.message || 'Error al registrar envío');
        } finally {
            setLoadingEnvio(false);
        }
    };

    if (envioExitoso) {
        return (
            <div className="max-w-3xl mx-auto p-12 bg-white rounded-xl shadow-2xl text-center space-y-8 mt-10">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">¡Envío Registrado con Éxito!</h2>
                    <p className="text-gray-500 mt-2">La transacción ha sido procesada correctamente.</p>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-white p-8 rounded-xl border border-gray-200 w-full max-w-sm mx-auto shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Código de Seguimiento</p>
                    <p className="text-4xl font-mono font-bold text-gray-900 mt-2 tracking-wider">{envioExitoso.codigo}</p>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition focus:ring-4 focus:ring-gray-100"
                    >
                        Nuevo Envío
                    </button>
                    <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition focus:ring-4 focus:ring-blue-100 flex items-center gap-2">
                        <Printer className="w-5 h-5" /> Imprimir Etiqueta
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6">
            <header className="mb-8 mt-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Truck className="w-6 h-6" />
                    </div>
                    Recepción de Encomiendas - MultiPaquete
                </h1>
                <p className="text-gray-500 ml-12 mt-1">Registro y cotización rápida para nuevos envíos</p>
            </header>

            <div className="grid grid-cols-12 gap-6">

                {/* COLUMNA IZQUIERDA - FORMULARIOS (8 columnas) */}
                <div className="col-span-12 lg:col-span-8 space-y-6">

                    {/* SECCIÓN 1: REMITENTE (Igual) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 flex">
                            <button
                                onClick={() => setCliente(null)}
                                className={`flex-1 px-6 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition ${!cliente && !newClientForm.dni ? 'text-blue-600 bg-white border-t-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Search className="w-4 h-4" /> Buscar Cliente
                            </button>
                            <button
                                onClick={() => { setCliente(null); setNewClientForm(f => ({ ...f, dni: '' })); }}
                                className={`flex-1 px-6 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition ${!cliente && newClientForm.dni !== undefined && showNewClientModal ? 'text-green-600 bg-white border-t-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <UserPlus className="w-4 h-4" /> Nuevo Cliente
                            </button>
                        </div>

                        <div className="p-6">
                            {/* MODO BUSQUEDA */}
                            {!showNewClientModal && !cliente && (
                                <div>
                                    <div className="flex gap-3 mb-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Buscar por DNI o RUC..."
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={dniSearch}
                                                onChange={e => setDniSearch(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && buscarCliente()}
                                            />
                                        </div>
                                        <button onClick={buscarCliente} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium">
                                            {searchingCliente ? '...' : 'Buscar'}
                                        </button>
                                    </div>

                                    <div className="text-center pt-2">
                                        <p className="text-sm text-gray-500">¿Cliente no encontrado?</p>
                                        <button
                                            onClick={() => setShowNewClientModal(true)}
                                            className="mt-2 text-blue-600 font-medium hover:underline text-sm"
                                        >
                                            → Registrar Nuevo Cliente Manualmente
                                        </button>
                                    </div>

                                    {/* Resultados Pendientes */}
                                    {tempCliente && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-gray-900">{tempCliente.nombre}</p>
                                                <p className="text-sm text-gray-600">{tempCliente.tipo_documento}: {tempCliente.documento}</p>
                                            </div>
                                            <button onClick={confirmarCliente} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium">
                                                Seleccionar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* MODO FORMULARIO NUEVO */}
                            {showNewClientModal && !cliente && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">DNI / RUC</label>
                                            <input type="text" className="w-full border p-2 rounded bg-gray-50"
                                                value={newClientForm.dni} onChange={e => setNewClientForm({ ...newClientForm, dni: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
                                            <input type="text" className="w-full border p-2 rounded"
                                                value={newClientForm.telefono} onChange={e => setNewClientForm({ ...newClientForm, telefono: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Nombres / Razón Social</label>
                                            <input type="text" className="w-full border p-2 rounded"
                                                value={newClientForm.nombre} onChange={e => setNewClientForm({ ...newClientForm, nombre: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Apellidos (Opcional)</label>
                                            <input type="text" className="w-full border p-2 rounded"
                                                value={newClientForm.apellido} onChange={e => setNewClientForm({ ...newClientForm, apellido: e.target.value })} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Dirección Completa</label>
                                            <input type="text" className="w-full border p-2 rounded"
                                                value={newClientForm.direccion} onChange={e => setNewClientForm({ ...newClientForm, direccion: e.target.value })} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Email (Opcional)</label>
                                            <input type="email" className="w-full border p-2 rounded"
                                                value={newClientForm.email} onChange={e => setNewClientForm({ ...newClientForm, email: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button onClick={() => setShowNewClientModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm">Cancelar</button>
                                        <button onClick={crearNuevoCliente} className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 shadow-sm">
                                            Guardar y Seleccionar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CLIENTE SELECCIONADO */}
                            {cliente && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{cliente.nombre}</p>
                                            <p className="text-xs text-gray-600 font-mono">{cliente.tipo_documento}: {cliente.documento}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setCliente(null); setShowNewClientModal(false); }} className="text-sm text-gray-500 hover:text-red-600 underline">
                                        Cambiar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN 2: DESTINO (Igual) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-500" />
                            <h2 className="font-semibold text-gray-900">Destino y Recepción</h2>
                        </div>
                        <div className="p-6 grid gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Departamento</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                                        value={destino.departamento}
                                        onChange={handleDepChange}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {departamentos.map((d: any) => <option key={d.departamento} value={d.departamento}>{d.departamento}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Provincia</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                                        value={destino.provincia}
                                        onChange={handleProvChange}
                                        disabled={!destino.departamento}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {provincias.map((p: any) => <option key={p.provincia} value={p.provincia}>{p.provincia}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Distrito</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                                        value={destino.distrito_id}
                                        onChange={e => setDestino({ ...destino, distrito_id: e.target.value })}
                                        disabled={!destino.provincia}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {distritos.map((d: any) => <option key={d.id_ubigeo} value={d.id_ubigeo}>{d.distrito}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Dirección" className="border p-2 rounded" value={destino.direccion} onChange={e => setDestino({ ...destino, direccion: e.target.value })} />
                                <input type="text" placeholder="Referencia" className="border p-2 rounded" value={destino.referencia} onChange={e => setDestino({ ...destino, referencia: e.target.value })} />
                                <input type="text" placeholder="Destinatario" className="border p-2 rounded" value={destino.nombre_destinatario} onChange={e => setDestino({ ...destino, nombre_destinatario: e.target.value })} />
                                <input type="text" placeholder="Teléfono" className="border p-2 rounded" value={destino.telefono} onChange={e => setDestino({ ...destino, telefono: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: CARRITO DE PAQUETES */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-gray-500" />
                                <h2 className="font-semibold text-gray-900">Paquetes del Envío</h2>
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {paquetesList.length} Item(s)
                            </span>
                        </div>

                        <div className="p-6">
                            {/* Formulario Agregar */}
                            <div className="grid grid-cols-12 gap-4 items-end mb-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <div className="col-span-3">
                                    <label className="text-xs font-bold text-gray-700">Peso (kg)</label>
                                    <input type="number" className="w-full mt-1 p-2 border rounded" placeholder="0.0"
                                        value={formPaquete.peso} onChange={e => setFormPaquete({ ...formPaquete, peso: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-600">Largo</label>
                                    <input type="number" className="w-full mt-1 p-2 border rounded" placeholder="cm"
                                        value={formPaquete.largo} onChange={e => setFormPaquete({ ...formPaquete, largo: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-600">Ancho</label>
                                    <input type="number" className="w-full mt-1 p-2 border rounded" placeholder="cm"
                                        value={formPaquete.ancho} onChange={e => setFormPaquete({ ...formPaquete, ancho: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-600">Alto</label>
                                    <input type="number" className="w-full mt-1 p-2 border rounded" placeholder="cm"
                                        value={formPaquete.alto} onChange={e => setFormPaquete({ ...formPaquete, alto: e.target.value })} />
                                </div>
                                <div className="col-span-3">
                                    <button
                                        onClick={agregarPaquete}
                                        disabled={!cotizacionActual || !formPaquete.peso}
                                        className="w-full py-2 bg-gray-900 text-white rounded font-medium disabled:opacity-50 hover:bg-black transition"
                                    >
                                        {calculando ? '...' : '+ Agregar'}
                                    </button>
                                </div>
                                {cotizacionActual && (
                                    <div className="col-span-12 text-right text-xs text-gray-500">
                                        Costo estimado: <span className="font-bold text-green-600">S/. {cotizacionActual.costo_total}</span>
                                    </div>
                                )}
                            </div>

                            {/* Lista de Paquetes */}
                            {paquetesList.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-500">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Descripción</th>
                                                <th className="px-4 py-2 text-center">Peso</th>
                                                <th className="px-4 py-2 text-center">Dimensiones</th>
                                                <th className="px-4 py-2 text-right">Subtotal</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paquetesList.map((p, idx) => (
                                                <tr key={p.id}>
                                                    <td className="px-4 py-3 font-medium text-gray-900">Caja #{idx + 1}</td>
                                                    <td className="px-4 py-3 text-center">{p.peso} kg</td>
                                                    <td className="px-4 py-3 text-center text-gray-500">
                                                        {p.largo && p.ancho && p.alto ? `${p.largo}x${p.ancho}x${p.alto}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">S/. {p.costo}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button onClick={() => eliminarPaquete(p.id)} className="text-red-500 hover:text-red-700">×</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-bold">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 text-right">TOTAL</td>
                                                <td className="px-4 py-3 text-right text-blue-600 text-lg">S/. {totalEnvio.toFixed(2)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 py-8 italic">No hay paquetes agregados</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA - RESUMEN */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-6">
                        <div className="bg-gray-900 px-6 py-4 text-white flex items-center justify-between">
                            <h2 className="font-bold text-lg">Resumen de Pago</h2>
                            <CreditCard className="w-5 h-5 opacity-70" />
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Monto Total a Pagar</p>
                                <p className="text-4xl font-extrabold text-blue-600">S/. {totalEnvio.toFixed(2)}</p>
                                <p className="text-xs text-gray-400 mt-2">{paquetesList.length} paquetes</p>
                            </div>

                            <button
                                onClick={registrarEnvio}
                                disabled={loadingEnvio || paquetesList.length === 0 || !cliente}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loadingEnvio ? 'Procesando...' : (
                                    <><span>Cobrar y Emitir</span><Printer className="w-5 h-5 opacity-80" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL NUEVO CLIENTE (Igual) */}
            {showNewClientModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
                        {/* ... contenido modal ... */}
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowNewClientModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                            <button onClick={crearNuevoCliente} className="px-4 py-2 bg-blue-600 text-white rounded">Registrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
