import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { logoutAction } from '@/lib/actions';
import Link from 'next/link';
import { Truck, Package, MapPin, User, LogOut, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default async function CounterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Empleado') {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-purple-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Paquetería Perú</h1>
                                <p className="text-xs text-purple-200">Panel de Mostrador</p>
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/counter" className="text-sm hover:text-purple-200 transition">
                                Inicio
                            </Link>
                            <Link href="/counter/recepcion" className="text-sm hover:text-purple-200 transition">
                                Recepción
                            </Link>
                            <Link href="/counter/entrega" className="text-sm hover:text-purple-200 transition">
                                Entrega
                            </Link>
                            <Link href="/counter/consulta" className="text-sm hover:text-purple-200 transition">
                                Consultar Envío
                            </Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-purple-200">{user.agencyName || 'Sin Sede'}</p>
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
