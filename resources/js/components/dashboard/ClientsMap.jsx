import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Users } from 'lucide-react';
import api from '../../lib/api';

const MOROCCO_CENTER = [31.7917, -7.0926];
const MOROCCO_BOUNDS = [
    [21.0, -17.5],
    [36.0, -0.8],
];

function tooltipHtml(client) {
    const rows = [
        ['Code', client.code],
        ['Téléphone', client.phone],
        ['E-mail', client.email],
        ['Ville', client.city],
        ['Adresse', client.address],
        ['Localisé', client.located_at],
    ]
        .filter(([, v]) => v)
        .map(
            ([label, value]) =>
                `<div style="margin-top:4px"><span style="opacity:.65">${label} :</span> <strong>${String(value)}</strong></div>`
        )
        .join('');

    return `<div style="min-width:160px;max-width:240px;font-size:12px;line-height:1.35">
        <div style="font-weight:700;font-size:13px;margin-bottom:2px">${client.name || 'Client'}</div>
        ${rows}
    </div>`;
}

export default function ClientsMap() {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get('/dashboard/map-clients')
            .then((r) => {
                if (!cancelled) setClients(r.data?.data || []);
            })
            .catch(() => {
                if (!cancelled) {
                    setError('Impossible de charger les clients localisés.');
                    setClients([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            zoomControl: true,
            attributionControl: true,
            minZoom: 5,
            maxZoom: 16,
        }).setView(MOROCCO_CENTER, 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 19,
        }).addTo(map);

        map.fitBounds(MOROCCO_BOUNDS, { padding: [20, 20] });
        mapRef.current = map;

        const onResize = () => map.invalidateSize();
        window.addEventListener('resize', onResize);
        requestAnimationFrame(() => map.invalidateSize());

        return () => {
            window.removeEventListener('resize', onResize);
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const layer = L.layerGroup().addTo(map);

        clients.forEach((client) => {
            const lat = Number(client.latitude);
            const lng = Number(client.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

            const marker = L.circleMarker([lat, lng], {
                radius: 8,
                color: '#7f1d1d',
                weight: 2,
                fillColor: '#ef4444',
                fillOpacity: 0.95,
            });

            marker.bindTooltip(tooltipHtml(client), {
                direction: 'top',
                offset: [0, -8],
                opacity: 0.97,
                className: 'autopilote-map-tooltip',
                sticky: true,
            });

            layer.addLayer(marker);
        });

        if (clients.length > 0) {
            const bounds = L.latLngBounds(clients.map((c) => [c.latitude, c.longitude]));
            if (bounds.isValid()) {
                map.fitBounds(bounds.pad(0.35), { maxZoom: 10 });
            }
        } else {
            map.fitBounds(MOROCCO_BOUNDS, { padding: [20, 20] });
        }

        requestAnimationFrame(() => map.invalidateSize());

        return () => {
            map.removeLayer(layer);
        };
    }, [clients]);

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="px-3 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 border-b border-white/10 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-2.5 text-white min-w-0">
                    <div className="p-2 rounded-xl bg-white/15 ring-1 ring-white/20 shrink-0">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold tracking-wide truncate">Carte clients — Maroc</h3>
                        <p className="text-[11px] text-white/70 truncate hidden sm:block">Clients localisés par les commerciaux</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold bg-white/10 px-2.5 py-1.5 rounded-lg shrink-0">
                    <Users className="w-3.5 h-3.5" />
                    {loading ? '…' : clients.length}
                </div>
            </div>

            <div className="relative">
                <div ref={containerRef} className="h-[min(55dvh,520px)] sm:h-[min(62vh,640px)] w-full bg-slate-100 dark:bg-slate-800 touch-pan-y" />

                {(loading || error || clients.length === 0) && (
                    <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none px-3 sm:px-4">
                        <div className="rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-lg px-3 sm:px-4 py-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 text-center max-w-md">
                            {loading && 'Chargement de la carte…'}
                            {!loading && error}
                            {!loading && !error && clients.length === 0 &&
                                'Aucun client localisé pour le moment. Les points apparaîtront dès qu’un commercial enregistrera une position.'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
