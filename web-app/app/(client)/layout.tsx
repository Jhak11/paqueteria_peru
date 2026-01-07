import { Inter } from 'next/font/google';
import { Package, LogOut, User } from 'lucide-react';
import { logoutAction } from '@/lib/actions';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default async function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Cliente') {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-blue-600 mr-2" />
                            <span className="font-bold text-xl text-gray-800">Paquetería Perú <span className="text-gray-400 font-normal">| Cliente</span></span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-700">
                                <User className="h-5 w-5 mr-1 text-gray-400" />
                                Hola, {user.name}
                            </div>
                            <form action={logoutAction}>
                                <button type="submit" className="text-sm text-red-600 hover:text-red-800 flex items-center">
                                    <LogOut className="h-4 w-4 mr-1" />
                                    Salir
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
