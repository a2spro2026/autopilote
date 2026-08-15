import { useEffect, useState } from 'react';
import api from '../lib/api';

export function useDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard')
            .then((r) => setData(r.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}
