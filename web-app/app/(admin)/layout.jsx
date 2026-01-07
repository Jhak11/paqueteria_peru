import { Inter } from 'next/font/google';
import Sidebar from '../components/Sidebar';
const inter = Inter({ subsets: ['latin'] });
export const metadata = {
    title: 'Paquetería Perú Dashboard',
    description: 'Panel de administración',
};
import { getAuthUser } from '@/lib/auth';
export default async function RootLayout({ children, }) {
    const user = await getAuthUser();
    return (<div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-lg z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Panel de Control</h2>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="block text-sm font-medium text-white">{user?.name || 'Usuario'}</span>
                <span className="block text-xs text-blue-200">{user?.role} - {user?.agencyName || 'Central'}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500 border-2 border-blue-300 flex items-center justify-center text-white font-bold text-lg shadow-md">
                A
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>);
}
