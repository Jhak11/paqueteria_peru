import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export interface AuthUser {
    userId: number;
    email: string;
    name: string;
    role: string;
    roleId: number;
    agencyId?: number | null;
    agencyName?: string | null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('auth-token');

        if (!token) {
            return null;
        }

        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'paqueteria-peru-secret-key-2024'
        );

        const { payload } = await jwtVerify(token.value, secret);

        return {
            userId: payload.userId as number,
            email: payload.email as string,
            name: payload.name as string,
            role: payload.role as string,
            roleId: payload.roleId as number,
            agencyId: (payload.agencyId as number) || null,
            agencyName: (payload.agencyName as string) || null,
        };
    } catch (error) {
        console.error('Error verificando token:', error);
        return null;
    }
}

export async function requireAuth(allowedRoles?: string[]): Promise<AuthUser> {
    const user = await getAuthUser();

    if (!user) {
        throw new Error('NO_AUTH');
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        throw new Error('FORBIDDEN');
    }

    return user;
}
