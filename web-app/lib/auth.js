import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
export async function getAuthUser() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('auth-token');
        if (!token) {
            return null;
        }
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'paqueteria-peru-secret-key-2024');
        const { payload } = await jwtVerify(token.value, secret);
        return {
            userId: payload.userId,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            roleId: payload.roleId,
            agencyId: payload.agencyId || null,
            agencyName: payload.agencyName || null,
        };
    }
    catch (error) {
        console.error('Error verificando token:', error);
        return null;
    }
}
export async function requireAuth(allowedRoles) {
    const user = await getAuthUser();
    if (!user) {
        throw new Error('NO_AUTH');
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        throw new Error('FORBIDDEN');
    }
    return user;
}
