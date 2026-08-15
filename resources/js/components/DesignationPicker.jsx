import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Package, Search } from 'lucide-react';

const triggerClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-brand-navy/30 focus:border-brand-navy transition-all flex items-center gap-2 min-w-0';

export default function DesignationPicker({ products = [], value, onSelect, placeholder = '— Sélectionner un article —' }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);
    const panelRef = useRef(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = products;
        if (q) {
            list = products.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.article_id?.toLowerCase().includes(q) ||
                    p.reference?.toLowerCase().includes(q) ||
                    p.famille?.toLowerCase().includes(q),
            );
        }
        return list.slice(0, 100);
    }, [products, query]);

    const updatePosition = useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({
            top: rect.bottom + 6,
            left: rect.left,
            width: Math.max(rect.width, 340),
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        updatePosition();
        const onScroll = () => updatePosition();
        const onResize = () => updatePosition();
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onResize);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (
                !triggerRef.current?.contains(e.target) &&
                !panelRef.current?.contains(e.target)
            ) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    const handleOpen = () => {
        updatePosition();
        setOpen((o) => !o);
        if (open) setQuery('');
    };

    const handleSelect = (product) => {
        onSelect(product);
        setOpen(false);
        setQuery('');
    };

    const selected = products.find((p) => p.name === value);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={handleOpen}
                className={`${triggerClass} ${open ? 'ring-2 ring-brand-navy/30 border-brand-navy' : ''}`}
            >
                <Package className="w-3.5 h-3.5 shrink-0 text-orange-500" />
                <span className={`truncate flex-1 text-left ${value ? 'font-medium' : 'text-slate-400'}`}>
                    {value || placeholder}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {createPortal(
                open ? (
                        <div
                            ref={panelRef}
                            style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
                            className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 overflow-hidden"
                        >
                            <div className="px-3 py-2.5 bg-gradient-to-r from-brand-navy/5 via-orange-500/5 to-orange-500/10 dark:from-brand-navy/20 dark:to-orange-900/20 border-b border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-navy dark:text-orange-400 mb-2">
                                    Catalogue produits
                                </p>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Rechercher désignation, ID article, famille…"
                                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    {query
                                        ? `${filtered.length} résultat${filtered.length > 1 ? 's' : ''}`
                                        : `${products.length} articles — saisissez un mot-clé pour filtrer`}
                                </p>
                            </div>

                            <ul className="max-h-72 overflow-y-auto overscroll-contain py-1">
                                {filtered.length ? (
                                    filtered.map((p) => {
                                        const active = value === p.name;
                                        return (
                                            <li key={p.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelect(p)}
                                                    className={`w-full text-left px-3 py-2.5 transition-colors border-l-2 ${
                                                        active
                                                            ? 'bg-orange-50 dark:bg-orange-900/25 border-orange-500'
                                                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/80'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-orange-400 font-bold">
                                                            {p.article_id || p.reference}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-slate-800 dark:text-white leading-snug">
                                                                {p.name}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                {p.famille && (
                                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                                                        {p.famille}
                                                                    </span>
                                                                )}
                                                                {p.consistance && (
                                                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                                        {p.consistance}
                                                                    </span>
                                                                )}
                                                                {p.unit && (
                                                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                                        {p.unit}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className="px-4 py-8 text-center">
                                        <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                        <p className="text-xs text-slate-400">Aucun article correspondant</p>
                                    </li>
                                )}
                            </ul>

                            {selected && (
                                <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                                    <p className="text-[10px] text-slate-500 truncate">
                                        Sélection : <span className="font-semibold text-slate-700 dark:text-slate-200">{selected.name}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                ) : null,
                document.body,
            )}
        </>
    );
}
