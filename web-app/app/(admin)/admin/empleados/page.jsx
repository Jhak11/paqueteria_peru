import pool from '@/lib/db';
import Link from 'next/link';
import { UserPlus, Plus, Truck, User } from 'lucide-react';
async function getEmpleados() {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.id_usuario,
                u.nombres,
                u.apellidos,
                u.telefono,
                c.correo,
                c.estado,
                r.nombre as rol,
                ub.distrito as ciudad
            FROM usuarios u
            JOIN credenciales c ON u.id_usuario = c.id_usuario
            JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
            JOIN roles r ON ur.id_rol = r.id_rol
            LEFT JOIN ubigeo ub ON u.id_ubigeo = ub.id_ubigeo
            WHERE ur.id_rol IN (3, 4)
            ORDER BY u.fecha_registro DESC
            LIMIT 50
        `);
        return rows;
    }
    catch (error) {
        console.error('Error fetching empleados:', error);
        return [];
    }
}
export default async function EmpleadosPage() {
    const empleados = await getEmpleados();
    return (<div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UserPlus className="w-7 h-7 text-green-600"/>
                        Empleados
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Personal interno: conductores y counter</p>
                </div>
                <Link href="/empleados/nuevo" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    <Plus className="w-5 h-5"/>
                    Nuevo Empleado
                </Link>
            </div>

            {empleados.length === 0 ? (<div className="bg-white rounded-lg shadow p-12 text-center">
                    <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay empleados registrados</h3>
                    <p className="text-gray-500 mb-6">Comienza agregando tu primer empleado</p>
                    <Link href="/admin/empleados/nuevo" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Plus className="w-5 h-5"/>
                        Registrar Empleado
                    </Link>
                </div>) : (<div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empleado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ciudad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {empleados.map((emp) => (<tr key={emp.id_usuario} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${emp.rol === 'Conductor' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                                {emp.rol === 'Conductor'
                    ? <Truck className="h-5 w-5 text-blue-600"/>
                    : <User className="h-5 w-5 text-purple-600"/>}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {emp.nombres} {emp.apellidos}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {emp.correo}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${emp.rol === 'Conductor'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'}`}>
                                            {emp.rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {emp.telefono || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {emp.ciudad || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.estado === 'activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'}`}>
                                            {emp.estado}
                                        </span>
                                    </td>
                                </tr>))}
                        </tbody>
                    </table>
                </div>)}
        </div>);
}
