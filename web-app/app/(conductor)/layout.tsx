import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { logoutAction } from '@/lib/actions';
import Link from 'next/link';
import { Truck, Package, MapPin, User, LogOut, Navigation } from 'lucide-react';

export default async function ConductorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Conductor') {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-blue-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Paquetería Perú</h1>
                                <p className="text-xs text-blue-200">Panel del Conductor</p>
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/conductor" className="text-sm hover:text-blue-200 transition">
                                Mi Ruta
                            </Link>
                            <Link href="/conductor/entregas" className="text-sm hover:text-blue-200 transition">
                                Entregas
                            </Link>
                            <Link href="/conductor/historial" className="text-sm hover:text-blue-200 transition">
                                Historial
                            </Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-blue-200">Conductor</p>
                            </div>
                            <form action={logoutAction}>
                                <button type="submit" className="p-2 hover:bg-white/10 rounded-lg transition">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto py-6 px-4">
                {children}
            </main>
        </div>
    );
}
