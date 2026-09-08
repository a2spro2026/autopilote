import { useRef, useState } from 'react';
import { Camera, MapPin, Loader2 } from 'lucide-react';
import api from '../lib/api';

/**
 * Icônes commercial : prendre une photo + localiser le client (GPS).
 */
export default function ClientLocateActions({
    clientId,
    located = false,
    hasPhoto = false,
    onUpdated,
    size = 'sm',
    className = '',
}) {
    const inputRef = useRef(null);
    const [busy, setBusy] = useState('');
    const [hint, setHint] = useState('');

    if (!clientId) return null;

    const iconClass = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
    const btnClass = size === 'md' ? 'p-2' : 'p-1.5';

    const report = (message, isError = false) => {
        setHint(message);
        window.setTimeout(() => setHint(''), 3500);
        if (isError) {
            // Keep toast-like feedback without blocking UI.
        }
    };

    const handleLocate = () => {
        if (!navigator.geolocation) {
            report('Géolocalisation non supportée sur cet appareil', true);
            return;
        }
        setBusy('locate');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { data } = await api.post(`/clients/${clientId}/locate`, {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                    onUpdated?.(data);
                    report('Position enregistrée');
                } catch (err) {
                    report(err.response?.data?.message || 'Échec enregistrement GPS', true);
                } finally {
                    setBusy('');
                }
            },
            (err) => {
                setBusy('');
                const msg =
                    err.code === 1
                        ? 'Autorisez la localisation dans le navigateur'
                        : 'Impossible d’obtenir la position GPS';
                report(msg, true);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
        );
    };

    const handlePhotoPick = () => {
        inputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setBusy('photo');
        try {
            const form = new FormData();
            form.append('photo', file);
            const { data } = await api.post(`/clients/${clientId}/photo`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUpdated?.(data);
            report('Photo enregistrée');
        } catch (err) {
            report(err.response?.data?.message || 'Échec envoi photo', true);
        } finally {
            setBusy('');
        }
    };

    return (
        <div className={`inline-flex flex-col items-center ${className}`}>
            <div className="inline-flex items-center gap-0.5">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoChange}
                />
                <button
                    type="button"
                    title="Prendre photo du client"
                    disabled={!!busy}
                    onClick={handlePhotoPick}
                    className={`${btnClass} rounded-lg transition-colors disabled:opacity-50 ${
                        hasPhoto
                            ? 'text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-300'
                            : 'text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/30 dark:hover:text-sky-400'
                    }`}
                >
                    {busy === 'photo' ? (
                        <Loader2 className={`${iconClass} animate-spin`} />
                    ) : (
                        <Camera className={iconClass} strokeWidth={2} />
                    )}
                </button>
                <button
                    type="button"
                    title="Localiser le client (GPS)"
                    disabled={!!busy}
                    onClick={handleLocate}
                    className={`${btnClass} rounded-lg transition-colors disabled:opacity-50 ${
                        located
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400'
                    }`}
                >
                    {busy === 'locate' ? (
                        <Loader2 className={`${iconClass} animate-spin`} />
                    ) : (
                        <MapPin className={iconClass} strokeWidth={2} />
                    )}
                </button>
            </div>
            {hint && (
                <span className="mt-0.5 text-[9px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap max-w-[140px] truncate">
                    {hint}
                </span>
            )}
        </div>
    );
}
