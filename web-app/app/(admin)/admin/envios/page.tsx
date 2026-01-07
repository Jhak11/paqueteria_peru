import pool from '@/lib/db';

async function getEnvios() {
    try {
        const query = `
      SELECT 
        e.id_envio, e.codigo_seguimiento, e.fecha_registro, e.estado_actual,
        u_rem.nombres as remitente, u_dest.nombres as destinatario,
        est.nombre as estado_nombre,
        e.costo_envio_total
      FROM envios e
      LEFT JOIN usuarios u_rem ON e.id_usuario_remitente = u_rem.id_usuario
      LEFT JOIN usuarios u_dest ON e.id_usuario_destinatario = u_dest.id_usuario
      LEFT JOIN estados_envio est ON e.estado_actual = est.id_estado
      ORDER BY e.fecha_registro DESC
      LIMIT 50
    `;
        const [rows]: any = await pool.query(query);
        return rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default async function EnviosPage() {
    const envios = await getEnvios();

    return (
        <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Gestión de Envíos</h1>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Nuevo Envío
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Remitente / Destinatario
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Costo
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {envios.map((envio: any) => (
                            <tr key={envio.id_envio}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {envio.codigo_seguimiento}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-700">De: {envio.remitente}</span>
                                        <span>A: {envio.destinatario}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(envio.fecha_registro).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${envio.estado_actual === 6 ? 'bg-green-100 text-green-800' :
                                            envio.estado_actual === 1 ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {envio.estado_nombre || 'Desconocido'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    S/. {envio.costo_envio_total}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
