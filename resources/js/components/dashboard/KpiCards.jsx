import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingCart, ShoppingBag, Scale, Receipt, Truck, TrendingUp, TrendingDown,
} from 'lucide-react';
import api from '../../lib/api';

const cards = [
    {
        key: 'total_achats',
        label: 'Total Achats',
        icon: ShoppingCart,
        format: 'currency',
        gradient: 'from-zinc-900 via-zinc-800 to-orange-700',
        glow: 'rgba(249, 115, 22, 0.35)',
    },
    {
        key: 'total_ventes',
        label: 'Total Ventes',
        icon: ShoppingBag,
        format: 'currency',
        gradient: 'from-amber-500 via-orange-500 to-orange-700',
        glow: 'rgba(249, 115, 22, 0.4)',
    },
    {
        key: 'reliquat',
        label: 'Reliquat',
        icon: Scale,
        format: 'currency',
        gradient: 'from-emerald-500 via-teal-600 to-green-800',
        glow: 'rgba(16, 185, 129, 0.4)',
        dynamic: true,
    },
    {
        key: 'total_charges',
        label: 'Total Charges',
        icon: Receipt,
        format: 'currency',
        gradient: 'from-rose-500 via-red-500 to-rose-800',
        glow: 'rgba(244, 63, 94, 0.35)',
    },
    {
        key: 'solde_fournisseur',
        label: 'Solde Fournisseur',
        icon: Truck,
        format: 'currency',
        gradient: 'from-violet-500 via-purple-600 to-indigo-900',
        glow: 'rgba(139, 92, 246, 0.4)',
        dynamic: true,
        supplierFilter: true,
    },
];

function formatValue(value, format) {
    const num = Number(value) || 0;
    if (format === 'number') return num.toLocaleString('fr-FR');
    return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AnimatedValue({ value, format }) {
    const [display, setDisplay] = useState(0);
    const target = Number(value) || 0;

    useEffect(() => {
        if (target === 0) {
            setDisplay(0);
            return;
        }
        const duration = 800;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }, [target]);

    return <>{formatValue(display, format)}</>;
}

function KpiCard({ card, value, index, supplierFilter }) {
    const Icon = card.icon;
    const isDynamic = card.dynamic;
    const num = Number(value) || 0;
    const positive = num >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className={`kpi-card-compact group relative overflow-hidden rounded-lg bg-gradient-to-br ${card.gradient} shadow-md hover:shadow-lg transition-all duration-300`}
            style={{ '--kpi-glow': card.glow }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <div className={`relative p-2.5 flex flex-col ${supplierFilter ? 'min-h-[88px]' : 'min-h-[82px]'}`}>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="p-1 rounded-md bg-white/20 backdrop-blur-sm">
                        <Icon className="w-3 h-3 text-white" strokeWidth={2} />
                    </div>
                    {isDynamic && (
                        <span className={`inline-flex items-center gap-0.5 text-[8px] font-bold uppercase px-1 py-0.5 rounded-full ${
                            positive ? 'bg-white/25 text-white' : 'bg-black/25 text-red-200'
                        }`}>
                            {positive ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                        </span>
                    )}
                </div>

                {supplierFilter && (
                    <select
                        value={supplierFilter.value}
                        onChange={(e) => supplierFilter.onChange(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full mb-1.5 rounded border border-white/20 bg-white/10 text-white text-[8px] font-medium px-1 py-0.5 h-5 outline-none focus:ring-1 focus:ring-white/30 cursor-pointer truncate leading-none"
                        title="Filtrer par fournisseur"
                    >
                        <option value="" className="text-slate-900">Tous</option>
                        {supplierFilter.options.map((s) => (
                            <option key={s.id} value={String(s.id)} className="text-slate-900">
                                {s.name}
                            </option>
                        ))}
                    </select>
                )}

                <p className="text-[9px] font-semibold text-white/80 uppercase tracking-wide leading-tight line-clamp-2">
                    {card.label}
                </p>

                <p className={`mt-auto font-bold text-white tracking-tight leading-none tabular-nums ${
                    supplierFilter ? 'text-sm pt-1' : 'text-base pt-2.5'
                }`}>
                    <AnimatedValue value={value} format={card.format} />
                </p>
            </div>
        </motion.div>
    );
}

function SectionTitle() {
    return (
        <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-bold tracking-[0.25em] text-slate-600 dark:text-slate-300 uppercase whitespace-nowrap">
                Cartes Analytiques
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-brand-orange/60 via-zinc-800/40 to-transparent" />
        </div>
    );
}

export default function KpiCards({ kpis, loading }) {
    const [supplierId, setSupplierId] = useState('');

    const supplierOptions = useMemo(
        () => (Array.isArray(kpis?.soldes_fournisseurs) ? kpis.soldes_fournisseurs : []),
        [kpis?.soldes_fournisseurs],
    );

    const soldeFournisseurValue = useMemo(() => {
        if (!supplierId) {
            return Number(kpis?.solde_fournisseur) || 0;
        }
        const match = supplierOptions.find((s) => String(s.id) === String(supplierId));
        return Number(match?.solde) || 0;
    }, [supplierId, kpis?.solde_fournisseur, supplierOptions]);

    const supplierFilter = {
        value: supplierId,
        onChange: setSupplierId,
        options: supplierOptions,
    };

    if (loading) {
        return (
            <div>
                <SectionTitle />
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                    {cards.map((card) => (
                        <div key={card.key} className={`kpi-card-skeleton rounded-lg ${card.supplierFilter ? 'h-[92px]' : 'h-[82px]'}`} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <SectionTitle />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                {cards.map((card, i) => (
                    <KpiCard
                        key={card.key}
                        card={card}
                        value={card.key === 'solde_fournisseur' ? soldeFournisseurValue : kpis?.[card.key]}
                        index={i}
                        supplierFilter={card.supplierFilter ? supplierFilter : null}
                    />
                ))}
            </div>
        </div>
    );
}

export function useDashboardKpis() {
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard')
            .then((r) => setKpis(r.data.kpis))
            .catch(() => setKpis({}))
            .finally(() => setLoading(false));
    }, []);

    return { kpis, loading };
}
