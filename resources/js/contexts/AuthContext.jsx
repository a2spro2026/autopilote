import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

function readStoredUser() {
    try {
        const raw = localStorage.getItem('autopilote_user');
        const token = localStorage.getItem('autopilote_token');
        if (!token || !raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => readStoredUser());
    const [loading] = useState(false);

    const login = useCallback(async (email, password, status) => {
        const { data } = await api.post('/login', { email, password, status });
        localStorage.setItem('autopilote_token', data.token);
        localStorage.setItem('autopilote_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(async () => {
        try { await api.post('/logout'); } catch { /* ignore */ }
        localStorage.removeItem('autopilote_token');
        localStorage.removeItem('autopilote_user');
        setUser(null);
    }, []);

    const can = useCallback((permission) => {
        if (!user) return false;
        return !!(user.is_admin || user.permissions?.includes(permission));
    }, [user]);

    const canMenu = useCallback((key) => {
        if (!user) return false;
        if (!user.menu_access) return true;
        return user.menu_access.includes(key);
    }, [user]);

    const value = useMemo(
        () => ({ user, loading, login, logout, can, canMenu }),
        [user, loading, login, logout, can, canMenu],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
