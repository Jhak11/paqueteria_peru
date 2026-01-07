import pool from '@/lib/db';
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ClientFilters from './ClientFilters';

async function getClientes(search = '', page = 1, limit = 15, estado = '', rol = '') {
    try {
        const offset = (page - 1) * limit;
        const params = [];

        let query = `
            SELECT 
                u.id_usuario,
                u.nombres,
                u.apellidos,
                u.telefono,
                u.tipo_documento,
                u.numero_documento,
                u.fecha_registro,
                c.correo,
                c.estado,
                r.nombre as rol,
                ub.distrito,
                ub.provincia,
                ub.departamento
            FROM usuarios u
            LEFT JOIN credenciales c ON u.id_usuario = c.id_usuario
            LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN roles r ON ur.id_rol = r.id_rol
            LEFT JOIN ubigeo ub ON u.id_ubigeo = ub.id_ubigeo
            WHERE (ur.id_rol NOT IN (3, 4) OR ur.id_rol IS NULL) 
        `;

        // Search logic
        if (search) {
            query += ` AND (
                u.nombres LIKE ? OR 
                u.apellidos LIKE ? OR 
                u.numero_documento LIKE ? OR 
                c.correo LIKE ?
            )`;
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        // Filter by state
        if (estado && estado !== 'all') {
            query += ` AND c.estado = ?`;
            params.push(estado);
        }

        // Filter by role
        if (rol && rol !== 'all') {
            query += ` AND r.nombre = ?`;
            params.push(rol);
        }

        // Count query
        const countQuery = `
            SELECT COUNT(*) as total
            FROM usuarios u
            LEFT JOIN credenciales c ON u.id_usuario = c.id_usuario
            LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN roles r ON ur.id_rol = r.id_rol
            WHERE (ur.id_rol NOT IN (3, 4) OR ur.id_rol IS NULL)
            ${search ? ` AND (u.nombres LIKE ? OR u.apellidos LIKE ? OR u.numero_documento LIKE ? OR c.correo LIKE ?)` : ''}
            ${(estado && estado !== 'all') ? ` AND c.estado = ?` : ''}
            ${(rol && rol !== 'all') ? ` AND r.nombre = ?` : ''}
        `;

        const [countResult] = await pool.query(countQuery, params);

        // Main query ordering and pagination
        query += ` ORDER BY u.fecha_registro DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);

        return {
            clientes: rows,
            total: countResult[0].total,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    }
    catch (error) {
        console.error('Error fetching clientes:', error);
        return {
            clientes: [],
            total: 0,
            totalPages: 0
        };
    }
}

export default async function ClientesPage({ searchParams }) {
    const page = Number(searchParams?.page) || 1;
    const search = searchParams?.q || '';
    const estado = searchParams?.estado || 'all';

    // Server fetch
    const { clientes, total, totalPages } = await getClientes(search, page, 15, estado);

    return (
        <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-8 h-8 text-blue-600" />
                        Gestión de Clientes
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Base de datos de usuarios registrados y clientes frecuentes
                    </p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100">
                    Total Registros: {total}
                </div>
            </div>

            {/* Client Components for Filters */}
            <ClientFilters totalResults={total} />

            {/* Table */}
            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Documento
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Ubicación
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Registro
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clientes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium text-gray-900">No se encontraron resultados</p>
                                            <p className="text-sm text-gray-500 mt-1">Intenta ajustar tu búsqueda o filtros</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                clientes.map((cliente) => (
                                    <tr key={cliente.id_usuario} className="hover:bg-gray-50/50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                        {cliente.nombres?.charAt(0)}{cliente.apellidos?.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {cliente.nombres} {cliente.apellidos}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        {cliente.correo || 'Sin correo'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                {cliente.tipo_documento}: {cliente.numero_documento}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {cliente.departamento ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{cliente.distrito}</span>
                                                    <span className="text-xs text-gray-500">{cliente.provincia}, {cliente.departamento}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">No especificada</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cliente.telefono || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(cliente.fecha_registro).toLocaleDateString('es-PE', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${cliente.estado === 'activo'
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : cliente.estado === 'suspendido'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                {cliente.estado || 'Sin estado'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="flex items-center">
                        <p className="text-sm text-gray-700">
                            Mostrando página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={{
                                pathname: '/admin/clientes',
                                query: { ...searchParams, page: page > 1 ? page - 1 : 1 }
                            }}
                            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border transition
                                ${page <= 1
                                    ? 'border-gray-200 text-gray-400 pointer-events-none'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <ChevronLeft className="w-4 h-4" /> Anterior
                        </Link>
                        <Link
                            href={{
                                pathname: '/admin/clientes',
                                query: { ...searchParams, page: page < totalPages ? page + 1 : totalPages }
                            }}
                            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border transition
                                ${page >= totalPages
                                    ? 'border-gray-200 text-gray-400 pointer-events-none'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            Siguiente <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
