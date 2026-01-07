'use client';
import { LayoutDashboard, Package, Users, Building2, Truck, LogOut, UserPlus, MapPin, DollarSign, Route } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const sidebarItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Envíos', href: '/admin/envios', icon: Package },
    { name: 'Clientes', href: '/admin/clientes', icon: Users },
    { name: 'Empresas', href: '/admin/empresas', icon: Building2 },
    { name: 'Tarifas', href: '/admin/tarifas', icon: DollarSign },
    { name: 'Rutas', href: '/admin/rutas', icon: Route },
    { name: 'Viajes', href: '/admin/viajes', icon: Truck },
    { name: 'Empleados', href: '/admin/empleados', icon: UserPlus },
    { name: 'Agencias', href: '/admin/agencias', icon: MapPin },
    { name: 'Vehículos', href: '/admin/vehiculos', icon: Truck },
];

export default function Sidebar() {
    const pathname = usePathname();
    const handleLogout = async () => {
        // Eliminar cookie y redirigir
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.href = '/login';
    };
    return (<div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl">
        <div className="flex h-16 items-center justify-center border-b border-slate-800 bg-slate-950">
            <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                PAQUETERÍA PERÚ
            </h1>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
            {sidebarItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (<Link key={item.name} href={item.href} className={clsx('group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors', isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white')}>
                    <item.icon className={clsx('mr-3 h-6 w-6 flex-shrink-0', isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-500')} aria-hidden="true" suppressHydrationWarning />
                    {item.name}
                </Link>);
            })}
        </nav>

        <div className="border-t border-gray-800 p-4">
            <button onClick={handleLogout} className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white">
                <LogOut className="mr-3 h-6 w-6 text-gray-400 group-hover:text-red-500" />
                Cerrar Sesión
            </button>
        </div>
    </div>);
}
