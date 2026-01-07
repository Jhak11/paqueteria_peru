import pool from '@/lib/db';
import Link from 'next/link';
import { Building2, Plus, CreditCard } from 'lucide-react';
async function getEmpresas() {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.id_empresa,
                e.razon_social,
                e.nombre_comercial,
                e.ruc,
                e.telefono_central,
                e.linea_credito,
                e.dias_credito,
                e.estado,
                u.distrito as ciudad,
                (SELECT COUNT(*) FROM empresa_contactos WHERE id_empresa = e.id_empresa) as contactos
            FROM empresas_cliente e
            LEFT JOIN ubigeo u ON e.id_ubigeo = u.id_ubigeo
            ORDER BY e.fecha_registro DESC
            LIMIT 50
        `);
        return rows;
    }
    catch (error) {
        console.error('Error fetching empresas:', error);
        return [];
    }
}
export default async function EmpresasPage() {
    const empresas = await getEmpresas();
    return (<div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-7 h-7 text-blue-600"/>
                        Empresas Corporativas
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Clientes B2B con línea de crédito</p>
                </div>
                <Link href="/admin/empresas/nuevo" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus className="w-5 h-5"/>
                    Nueva Empresa
                </Link>
            </div>

            {empresas.length === 0 ? (<div className="bg-white rounded-lg shadow p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay empresas registradas</h3>
                    <p className="text-gray-500 mb-6">Comienza agregando tu primera empresa corporativa</p>
                    <Link href="/empresas/nuevo" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-5 h-5"/>
                        Registrar Empresa
                    </Link>
                </div>) : (<div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empresa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    RUC
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Teléfono
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Crédito
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {empresas.map((empresa) => (<tr key={empresa.id_empresa} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-blue-600"/>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {empresa.nombre_comercial || empresa.razon_social}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {empresa.ciudad || 'Sin ubicación'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {empresa.ruc}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {empresa.telefono_central || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm">
                                            <CreditCard className="w-4 h-4 text-green-500 mr-1"/>
                                            <span className="text-gray-900">S/. {parseFloat(empresa.linea_credito || 0).toLocaleString()}</span>
                                            <span className="text-gray-400 ml-1">({empresa.dias_credito || 0}d)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${empresa.estado === 'activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'}`}>
                                            {empresa.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900">Ver</button>
                                    </td>
                                </tr>))}
                        </tbody>
                    </table>
                </div>)}
        </div>);
}
