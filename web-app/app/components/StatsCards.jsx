import pool from '@/lib/db';
import { Package, Truck, CheckCircle, Users } from 'lucide-react';
async function getStats() {
    try {
        const [totalEnvios] = await pool.query('SELECT COUNT(*) as count FROM envios');
        const [enTransito] = await pool.query('SELECT COUNT(*) as count FROM envios WHERE estado_actual IN (2, 3, 4, 5)');
        const [entregados] = await pool.query('SELECT COUNT(*) as count FROM envios WHERE estado_actual = 6');
        const [totalClientes] = await pool.query('SELECT COUNT(*) as count FROM usuarios');
        return {
            total: totalEnvios[0].count,
            transit: enTransito[0].count,
            delivered: entregados[0].count,
            clients: totalClientes[0].count,
        };
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        return { total: 0, transit: 0, delivered: 0, clients: 0 };
    }
}
export default async function StatsCards() {
    const stats = await getStats();
    const cards = [
        { name: 'Total Envíos', value: stats.total, icon: Package, color: 'text-blue-500', bg: 'bg-blue-100' },
        { name: 'En Tránsito', value: stats.transit, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-100' },
        { name: 'Entregados', value: stats.delivered, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
        { name: 'Clientes', value: stats.clients, icon: Users, color: 'text-purple-500', bg: 'bg-purple-100' },
    ];
    return (<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (<div key={card.name} className="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-md">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-md ${card.bg}`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} aria-hidden="true"/>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">{card.name}</dt>
                                    <dd>
                                        <div className="text-lg font-bold text-gray-900">{card.value}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>))}
        </div>);
}
