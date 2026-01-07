'use client';
import { useState, useEffect } from 'react';
import { Search, MapPin, Package, CreditCard, Printer, CheckCircle, Truck, UserPlus, X, AlertTriangle, DollarSign } from 'lucide-react';

export default function RecepcionPage() {
    // --- CLIENT/SENDER STATES ---
    const [dniSearch, setDniSearch] = useState('');
    const [cliente, setCliente] = useState(null);
    const [tempCliente, setTempCliente] = useState(null);
    const [searchingCliente, setSearchingCliente] = useState(false);
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [newClientForm, setNewClientForm] = useState({
        dni: '', nombre: '', apellido: '', telefono: '', email: '', direccion: ''
    });

    // --- RECIPIENT/DESTINATION STATES ---
    const [dniDestinatarioSearch, setDniDestinatarioSearch] = useState('');
    const [destinatarioRegistrado, setDestinatarioRegistrado] = useState(null);
    const [searchingDestinatario, setSearchingDestinatario] = useState(false);
    const [departamentos, setDepartamentos] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [destino, setDestino] = useState({
        departamento: '',
        provincia: '',
        distrito_id: '',
        direccion: '',
        referencia: '',
        nombre_destinatario: '',
        dni: '',
        telefono: ''
    });

    // --- PACKAGE STATES ---
    const [paquetesList, setPaquetesList] = useState([]);
    const [formPaquete, setFormPaquete] = useState({
        peso: '',
        largo: '',
        ancho: '',
        alto: '',
        fragil: false,
        tipo_paquete: 'caja_chica',
        valor_declarado: '',
        descripcion: ''
    });

    // --- BILLING/PAYMENT STATES ---
    const [tipoComprobante, setTipoComprobante] = useState('boleta');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [referenciaPago, setReferenciaPago] = useState('');

    // --- CALCULATION STATES ---
    const [cotizacionActual, setCotizacionActual] = useState(null);
    const [calculando, setCalculando] = useState(false);
    const [totalEnvio, setTotalEnvio] = useState(0);
    const [loadingEnvio, setLoadingEnvio] = useState(false);
    const [envioExitoso, setEnvioExitoso] = useState(null);

    // --- EFFECTS ---
    useEffect(() => {
        loadDepartamentos();
    }, []);

    useEffect(() => {
        const total = paquetesList.reduce((acc, p) => acc + parseFloat(p.costo), 0);
        setTotalEnvio(total);
    }, [paquetesList]);

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

    // --- FUNCTIONS ---
    const loadDepartamentos = async () => {
        try {
            const res = await fetch('/api/ubigeo?type=departamentos');
            setDepartamentos(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const handleDepChange = async (e) => {
        const dep = e.target.value;
        setDestino({ ...destino, departamento: dep, provincia: '', distrito_id: '' });
        setProvincias([]);
        setDistritos([]);
        if (dep) {
            const res = await fetch(`/api/ubigeo?type=provincias&departamento=${dep}`);
            setProvincias(await res.json());
        }
    };

    const handleProvChange = async (e) => {
        const prov = e.target.value;
        setDestino({ ...destino, provincia: prov, distrito_id: '' });
        setDistritos([]);
        if (prov) {
            const res = await fetch(`/api/ubigeo?type=distritos&departamento=${destino.departamento}&provincia=${prov}`);
            setDistritos(await res.json());
        }
    };

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

    const buscarDestinatario = async () => {
        if (dniDestinatarioSearch.length < 3) return;
        setSearchingDestinatario(true);
        try {
            const res = await fetch(`/api/clientes/buscar?q=${dniDestinatarioSearch}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const user = data[0];
                setDestinatarioRegistrado(user);
                // Autocomplete fields (editable)
                setDestino({
                    ...destino,
                    nombre_destinatario: user.nombre,
                    dni: user.documento,
                    telefono: user.telefono || ''
                });
            } else {
                alert('Destinatario no encontrado en el sistema. Puede llenar manualmente.');
                setDestinatarioRegistrado(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSearchingDestinatario(false);
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
                    tipo_envio: 'express'
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
            id: Date.now(),
            peso: formPaquete.peso,
            largo: formPaquete.largo,
            ancho: formPaquete.ancho,
            alto: formPaquete.alto,
            fragil: formPaquete.fragil,
            tipo_paquete: formPaquete.tipo_paquete,
            valor_declarado: formPaquete.valor_declarado || 0,
            descripcion: formPaquete.descripcion,
            costo: cotizacionActual.costo_total
        };
        setPaquetesList([...paquetesList, nuevoPaquete]);
        setFormPaquete({
            peso: '', largo: '', ancho: '', alto: '', fragil: false,
            tipo_paquete: 'caja_chica', valor_declarado: '', descripcion: ''
        });
        setCotizacionActual(null);
    };

    const eliminarPaquete = (id) => {
        setPaquetesList(paquetesList.filter(p => p.id !== id));
    };

    const registrarEnvio = async () => {
        if (!cliente || !destino.distrito_id || paquetesList.length === 0) {
            alert('Por favor complete cliente, destino y agregue al menos un paquete');
            return;
        }

        // Validate FACTURA requires RUC
        if (tipoComprobante === 'factura' && cliente.tipo_documento !== 'RUC') {
            alert('Para emitir FACTURA el cliente debe tener RUC');
            return;
        }

        setLoadingEnvio(true);
        try {
            const payload = {
                remitente: cliente,
                destino: {
                    ...destino,
                    ubigeo_id: destino.distrito_id,
                    id_usuario_destinatario: destinatarioRegistrado?.id || null
                },
                paquetes: paquetesList,
                pago: {
                    monto: totalEnvio,
                    metodo: metodoPago,
                    referencia: referenciaPago || null,
                    factura: {
                        tipo_comprobante: tipoComprobante,
                        ruc: cliente.tipo_documento === 'RUC' ? cliente.documento : null,
                        razon_social: cliente.tipo_documento === 'RUC' ? cliente.nombre : null
                    }
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
        } catch (error) {
            alert(error.message || 'Error al registrar envío');
        } finally {
            setLoadingEnvio(false);
        }
    };

    // Calculate IGV breakdown
    const subtotal = totalEnvio / 1.18;
    const igv = totalEnvio - subtotal;

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
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition">
                        Nuevo Envío
                    </button>
                    <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg transition flex items-center gap-2">
                        <Printer className="w-5 h-5" /> Imprimir Etiqueta
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto pb-20 px-4 sm:px-6">
            <header className="mb-6 mt-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Truck className="w-6 h-6" />
                    </div>
                    Recepción de Encomiendas
                </h1>
                <p className="text-gray-500 ml-12 mt-1">Registro completo: Cliente, Paquetes y Facturación</p>
            </header>

            {/* 3 COLUMN LAYOUT */}
            <div className="grid grid-cols-12 gap-6">
                {/* ==================== COLUMN 1: SHIPMENT DATA ==================== */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* REMITENTE */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 flex">
                            <button
                                onClick={() => { setCliente(null); setShowNewClientModal(false); }}
                                className={`flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition ${!cliente && !showNewClientModal ? 'text-blue-600 bg-white border-t-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Search className="w-4 h-4" /> Buscar
                            </button>
                            <button
                                onClick={() => { setCliente(null); setShowNewClientModal(true); }}
                                className={`flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition ${showNewClientModal ? 'text-green-600 bg-white border-t-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <UserPlus className="w-4 h-4" /> Nuevo
                            </button>
                        </div>

                        <div className="p-4">
                            <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">📤 Remitente</p>

                            {/* Search Mode */}
                            {!showNewClientModal && !cliente && (
                                <div>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            placeholder="DNI o RUC..."
                                            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                            value={dniSearch}
                                            onChange={e => setDniSearch(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && buscarCliente()}
                                        />
                                        <button onClick={buscarCliente} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                                            {searchingCliente ? '...' : 'Buscar'}
                                        </button>
                                    </div>

                                    {tempCliente && (
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-sm">{tempCliente.nombre}</p>
                                                <p className="text-xs text-gray-600">{tempCliente.tipo_documento}: {tempCliente.documento}</p>
                                            </div>
                                            <button onClick={confirmarCliente} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                                                Seleccionar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* New Client Mode */}
                            {showNewClientModal && !cliente && (
                                <div className="space-y-3">
                                    <input type="text" placeholder="DNI / RUC" className="w-full border p-2 rounded text-sm" value={newClientForm.dni} onChange={e => setNewClientForm({ ...newClientForm, dni: e.target.value })} />
                                    <input type="text" placeholder="Nombres" className="w-full border p-2 rounded text-sm" value={newClientForm.nombre} onChange={e => setNewClientForm({ ...newClientForm, nombre: e.target.value })} />
                                    <input type="text" placeholder="Apellidos (Opcional)" className="w-full border p-2 rounded text-sm" value={newClientForm.apellido} onChange={e => setNewClientForm({ ...newClientForm, apellido: e.target.value })} />
                                    <input type="text" placeholder="Teléfono" className="w-full border p-2 rounded text-sm" value={newClientForm.telefono} onChange={e => setNewClientForm({ ...newClientForm, telefono: e.target.value })} />
                                    <button onClick={crearNuevoCliente} className="w-full py-2 bg-green-600 text-white rounded font-medium text-sm hover:bg-green-700">
                                        Guardar Cliente
                                    </button>
                                </div>
                            )}

                            {/* Selected Client */}
                            {cliente && (
                                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-bold text-sm text-gray-900">{cliente.nombre}</p>
                                        <button onClick={() => setCliente(null)} className="text-xs text-red-600 hover:underline">Cambiar</button>
                                    </div>
                                    <p className="text-xs text-gray-600">{cliente.tipo_documento}: {cliente.documento}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DESTINATARIO */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <h2 className="font-semibold text-sm text-gray-900">📍 Destinatario</h2>
                        </div>
                        <div className="p-4 space-y-3">
                            {/* Recipient Search */}
                            <div className="pb-3 border-b">
                                <label className="text-xs font-bold text-gray-600 mb-2 block">Buscar Destinatario (Opcional)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="DNI del destinatario"
                                        className="flex-1 px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                                        value={dniDestinatarioSearch}
                                        onChange={e => setDniDestinatarioSearch(e.target.value)}
                                    />
                                    <button onClick={buscarDestinatario} className="px-3 py-1.5 bg-gray-700 text-white rounded text-xs font-medium">
                                        {searchingDestinatario ? '...' : 'Buscar'}
                                    </button>
                                </div>
                                {destinatarioRegistrado && (
                                    <p className="text-xs text-green-600 mt-1">✓ Usuario encontrado: {destinatarioRegistrado.nombre}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <input type="text" placeholder="Nombre destinatario *" className="w-full border p-2 rounded text-sm" value={destino.nombre_destinatario} onChange={e => setDestino({ ...destino, nombre_destinatario: e.target.value })} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="DNI" className="border p-2 rounded text-sm" value={destino.dni} onChange={e => setDestino({ ...destino, dni: e.target.value })} />
                                    <input type="text" placeholder="Teléfono" className="border p-2 rounded text-sm" value={destino.telefono} onChange={e => setDestino({ ...destino, telefono: e.target.value })} />
                                </div>
                                <select className="w-full border p-2 rounded text-sm" value={destino.departamento} onChange={handleDepChange}>
                                    <option value="">Departamento *</option>
                                    {departamentos.map(d => <option key={d.departamento} value={d.departamento}>{d.departamento}</option>)}
                                </select>
                                <select className="w-full border p-2 rounded text-sm" value={destino.provincia} onChange={handleProvChange} disabled={!destino.departamento}>
                                    <option value="">Provincia *</option>
                                    {provincias.map(p => <option key={p.provincia} value={p.provincia}>{p.provincia}</option>)}
                                </select>
                                <select className="w-full border p-2 rounded text-sm" value={destino.distrito_id} onChange={e => setDestino({ ...destino, distrito_id: e.target.value })} disabled={!destino.provincia}>
                                    <option value="">Distrito *</option>
                                    {distritos.map(d => <option key={d.id_ubigeo} value={d.id_ubigeo}>{d.distrito}</option>)}
                                </select>
                                <input type="text" placeholder="Dirección" className="w-full border p-2 rounded text-sm" value={destino.direccion} onChange={e => setDestino({ ...destino, direccion: e.target.value })} />
                                <input type="text" placeholder="Referencia" className="w-full border p-2 rounded text-sm" value={destino.referencia} onChange={e => setDestino({ ...destino, referencia: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== COLUMN 2: PACKAGES ==================== */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-500" />
                                <h2 className="font-semibold text-sm text-gray-900">📦 Paquetes</h2>
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                {paquetesList.length}
                            </span>
                        </div>

                        <div className="p-4">
                            {/* Add Package Form */}
                            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">Tipo *</label>
                                        <select className="w-full border p-1.5 rounded text-sm mt-1" value={formPaquete.tipo_paquete} onChange={e => setFormPaquete({ ...formPaquete, tipo_paquete: e.target.value })}>
                                            <option value="documento">📄 Documento</option>
                                            <option value="sobre">✉️ Sobre</option>
                                            <option value="caja_chica">📦 Caja Chica</option>
                                            <option value="caja_grande">📦 Caja Grande</option>
                                            <option value="pallet">🏗️ Pallet</option>
                                            <option value="otro">📋 Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">Peso (kg) *</label>
                                        <input type="number" className="w-full border p-1.5 rounded text-sm mt-1" placeholder="0.0" value={formPaquete.peso} onChange={e => setFormPaquete({ ...formPaquete, peso: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-600">Largo (cm)</label>
                                        <input type="number" className="w-full border p-1.5 rounded text-sm mt-1" value={formPaquete.largo} onChange={e => setFormPaquete({ ...formPaquete, largo: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Ancho (cm)</label>
                                        <input type="number" className="w-full border p-1.5 rounded text-sm mt-1" value={formPaquete.ancho} onChange={e => setFormPaquete({ ...formPaquete, ancho: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Alto (cm)</label>
                                        <input type="number" className="w-full border p-1.5 rounded text-sm mt-1" value={formPaquete.alto} onChange={e => setFormPaquete({ ...formPaquete, alto: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-600">Valor Declarado (S/.)</label>
                                    <input type="number" className="w-full border p-1.5 rounded text-sm mt-1" placeholder="0.00" value={formPaquete.valor_declarado} onChange={e => setFormPaquete({ ...formPaquete, valor_declarado: e.target.value })} />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4" checked={formPaquete.fragil} onChange={e => setFormPaquete({ ...formPaquete, fragil: e.target.checked })} />
                                    <span className="text-sm font-medium">⚠️ Frágil</span>
                                </label>

                                {cotizacionActual && (
                                    <div className="text-xs text-right text-gray-500 bg-green-50 p-2 rounded">
                                        Costo estimado: <span className="font-bold text-green-600 text-sm">S/. {cotizacionActual.costo_total}</span>
                                    </div>
                                )}

                                <button onClick={agregarPaquete} disabled={!cotizacionActual || !formPaquete.peso} className="w-full py-2 bg-gray-900 text-white rounded font-medium text-sm disabled:opacity-50 hover:bg-black transition">
                                    {calculando ? '...' : '+ Agregar Paquete'}
                                </button>
                            </div>

                            {/* Packages List */}
                            {paquetesList.length > 0 ? (
                                <div className="space-y-2">
                                    {paquetesList.map((p, idx) => (
                                        <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-bold text-sm">Paquete #{idx + 1}</p>
                                                <button onClick={() => eliminarPaquete(p.id)} className="text-red-500 hover:text-red-700 text-lg">×</button>
                                            </div>
                                            <p className="text-xs text-gray-600">{p.tipo_paquete} • {p.peso} kg</p>
                                            {p.fragil && <p className="text-xs text-orange-600 font-medium">⚠️ Frágil</p>}
                                            <p className="text-sm font-bold text-gray-900 mt-1">S/. {p.costo}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 py-6 text-sm italic">No hay paquetes</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ==================== COLUMN 3: PAYMENT & BILLING ==================== */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-6">
                        <div className="bg-gray-900 px-4 py-3 text-white flex items-center justify-between">
                            <h2 className="font-bold text-sm">💳 Pago y Facturación</h2>
                            <CreditCard className="w-4 h-4 opacity-70" />
                        </div>

                        <div className="p-4 space-y-4">
                            {/* 1. Invoice Type */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Comprobante</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTipoComprobante('boleta')}
                                        className={`flex-1 py-2 rounded font-medium text-sm transition ${tipoComprobante === 'boleta' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        BOLETA
                                    </button>
                                    <button
                                        onClick={() => setTipoComprobante('factura')}
                                        className={`flex-1 py-2 rounded font-medium text-sm transition ${tipoComprobante === 'factura' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        FACTURA
                                    </button>
                                </div>

                                {/* Client Info Display */}
                                <div className="mt-3 text-xs bg-gray-50 p-3 rounded">
                                    {cliente ? (
                                        tipoComprobante === 'factura' ? (
                                            cliente.tipo_documento === 'RUC' ? (
                                                <p>Razón Social: <span className="font-bold">{cliente.nombre}</span></p>
                                            ) : (
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-red-600">El cliente debe tener RUC para emitir FACTURA</p>
                                                </div>
                                            )
                                        ) : (
                                            <p>Cliente: <span className="font-bold">{cliente.nombre}</span> ({cliente.tipo_documento} {cliente.documento})</p>
                                        )
                                    ) : (
                                        <p className="text-gray-400 italic">Seleccione un cliente primero</p>
                                    )}
                                </div>
                            </div>

                            {/* 2. Price Breakdown */}
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Desglose de Montos</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">S/. {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>IGV (18%):</span>
                                        <span className="font-medium">S/. {igv.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-bold text-lg text-blue-600">
                                        <span>TOTAL A PAGAR:</span>
                                        <span>S/. {totalEnvio.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Payment Method */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Método de Pago</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setMetodoPago('efectivo')}
                                        className={`py-2 px-2 rounded text-xs font-medium transition ${metodoPago === 'efectivo' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        💵 Efectivo
                                    </button>
                                    <button
                                        onClick={() => setMetodoPago('yape')}
                                        className={`py-2 px-2 rounded text-xs font-medium transition ${metodoPago === 'yape' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        📱 Yape/Plin
                                    </button>
                                    <button
                                        onClick={() => setMetodoPago('tarjeta')}
                                        className={`py-2 px-2 rounded text-xs font-medium transition ${metodoPago === 'tarjeta' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        💳 Tarjeta
                                    </button>
                                    <button
                                        onClick={() => setMetodoPago('credito')}
                                        className={`py-2 px-2 rounded text-xs font-medium transition ${metodoPago === 'credito' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        🏢 Crédito
                                    </button>
                                </div>

                                {(metodoPago === 'yape' || metodoPago === 'plin') && (
                                    <input
                                        type="text"
                                        placeholder="Nro. de Operación"
                                        className="w-full border p-2 rounded text-sm mt-2"
                                        value={referenciaPago}
                                        onChange={e => setReferenciaPago(e.target.value)}
                                    />
                                )}
                            </div>

                            {/* 4. Final Button */}
                            <button
                                onClick={registrarEnvio}
                                disabled={loadingEnvio || paquetesList.length === 0 || !cliente}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingEnvio ? 'Procesando...' : (
                                    <>
                                        <DollarSign className="w-5 h-5" />
                                        <span>PROCESAR PAGO Y EMITIR</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
