'use client';

import { Search, Filter, X } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ClientFilters({ totalResults }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Local state for search input
    const initialQuery = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(initialQuery);

    // Debounce search term changes
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            params.set('page', '1');

            if (searchTerm) {
                params.set('q', searchTerm);
            } else {
                params.delete('q');
            }

            // Only update if the query param is different from current state
            // preventing loops or unnecessary replaces if initial load
            if (params.get('q') !== (searchParams.get('q') || '')) {
                replace(`${pathname}?${params.toString()}`);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm, pathname, replace, searchParams]);

    const handleFilterChange = (key, value) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');

        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        replace(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        setSearchTerm(''); // Clear local state
        replace(pathname);
    };

    const estado = searchParams.get('estado') || 'all';

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 md:space-y-0 md:flex gap-4">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, DNI, RUC o correo..."
                    className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 transition"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative">
                    <div className="flex items-center gap-2 relative">
                        <select
                            value={estado}
                            onChange={(e) => handleFilterChange('estado', e.target.value)}
                            className="pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-blue-300 transition appearance-none"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="activo">Activos</option>
                            <option value="suspendido">Suspendidos</option>
                        </select>
                        <Filter className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
                    </div>
                </div>

                {/* Clear Filters Button */}
                {(searchTerm || estado !== 'all') && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm transition"
                    >
                        <X className="w-4 h-4" />
                        Limpiar
                    </button>
                )}
            </div>
        </div>
    );
}
