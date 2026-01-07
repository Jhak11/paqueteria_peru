import Link from 'next/link';
import { Truck, User, Menu, Package, Phone, Mail } from 'lucide-react';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-900 bg-gray-50">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-700 transition">
                                <Truck className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                                Paquetería Perú
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
                                <Package className="h-4 w-4" /> Rastreo
                            </Link>
                        </div>

                        {/* Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/register" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
                                Registrarme
                            </Link>
                            <Link
                                href="/login"
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5"
                            >
                                Iniciar Sesión
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">

                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Truck className="h-6 w-6 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">Paquetería Perú</span>
                        </div>
                        <p className="text-gray-500 text-sm max-w-sm">
                            Líderes en logística y transporte a nivel nacional.
                            Conectamos el Perú con rapidez, seguridad y confianza.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Enlaces Rápidos</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/" className="hover:text-blue-600">Rastreo de envíos</Link></li>
                            <li><Link href="/login" className="hover:text-blue-600">Área de Clientes</Link></li>
                            <li><Link href="#" className="hover:text-blue-600">Trabaja con nosotros</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Contacto</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> (01) 555-0123</li>
                            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contacto@paqueteria.pe</li>
                            <li className="mt-4 text-xs text-gray-400">© 2024 Paquetería Perú. Todos los derechos reservados.</li>
                        </ul>
                    </div>

                </div>
            </footer>
        </div>
    );
}
