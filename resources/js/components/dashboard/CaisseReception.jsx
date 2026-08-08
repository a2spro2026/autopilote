import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2, XCircle, RefreshCw, Calculator, Eye, Pencil, Printer, FileText, X, Wallet,
} from 'lucide-react';
import api from '../../lib/api';

const REGLEMENT_CARDS = ['Esp', 'TPE', 'Vir', 'Chq', 'Eff', 'Crédit', 'Vers'];

function formatMontant(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function todayFr() {
    return new Date().toLocaleDateString('fr-FR');
}

function ActionBtn({ title, onClick, icon: Icon, color = 'slate' }) {
    const colors = {
        blue: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400',
        amber: 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400',
        slate: 'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        orange: 'hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400',
        emerald: 'hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400',
    };
    return (
        <button type="button" title={title} onClick={onClick} className={`p-1.5 rounded-lg text-slate-400 transition-colors ${colors[color]}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
    );
}

function buildBonHtml(row) {
    const itemsRows = (row.items?.length ? row.items : [{
        article_ref: row.article_ref,
        description: row.designation,
        quantity: row.quantity,
        unit_price: row.unit_price,
        total: row.subtotal,
    }]).map((i) => `<tr>
<td>${i.article_ref || '—'}</td>
<td>${i.description || '—'}</td>
<td>${i.quantity ?? '—'}</td>
<td>${formatMontant(i.unit_price)}</td>
<td><strong>${formatMontant(i.total)}</strong></td>
</tr>`).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bon ${row.reference}</title>
<style>body{font-family:Arial,sans-serif;padding:32px;color:#1e293b}h1{color:#1e3a5f;font-size:22px}
table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #e2e8f0;padding:8px;font-size:11px;text-align:center}
th{background:#f8fafc;font-weight:700}.badge{background:#ecfdf5;color:#047857;padding:4px 10px;border-radius:999px;font-weight:700}
</style></head><body>
<h1>Autopilote — Bon de Vente <span class="badge">${row.reference}</span></h1>
<table>
<tr><th>Date</th><td>${row.order_date || '—'}</td><th>Client</th><td>${row.client || '—'}</td></tr>
<tr><th>Commercial</th><td>${row.commercial_name || '—'}</td><th>Règlement</th><td>${row.reglement || '—'}</td></tr>
</table>
<table>
<thead><tr><th>Réf</th><th>Désignation</th><th>Qté</th><th>P/U</th><th>S/Total</th></tr></thead>
<tbody>${itemsRows}</tbody>
</table>
<p style="text-align:right;font-weight:700;margin-top:12px">Total TTC : ${formatMontant(row.montant ?? row.subtotal)}</p>
</body></html>`;
}

function openPrintable(row) {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(buildBonHtml(row));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}

function ViewModal({ row, onClose }) {
    if (!row) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-navy to-blue-800">
                    <div>
                        <p className="text-[10px] text-blue-200 uppercase tracking-wider">Bon de Vente</p>
                        <h3 className="text-white font-bold">{row.reference}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-2 text-sm max-h-[65vh] overflow-y-auto">
                    {[
                        ['Date', row.order_date],
                        ['Client', row.client],
                        ['Commercial', row.commercial_name],
                        ['Montant TTC', formatMontant(row.montant)],
                        ['Règlement', row.reglement],
                        ['Statut', row.status_label],
                    ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4 py-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 shrink-0">{label}</span>
                            <span className="font-medium text-slate-800 dark:text-white text-right">{value || '—'}</span>
                        </div>
                    ))}
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-navy pt-2">Articles</p>
                    {(row.items || []).map((i, idx) => (
                        <div key={i.id || idx} className="rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2 text-xs">
                            <div className="font-semibold">{i.article_ref || '—'} — {i.description}</div>
                            <div className="text-slate-500 mt-0.5">{i.quantity} × {formatMontant(i.unit_price)} = <strong>{formatMontant(i.total)}</strong></div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button type="button" onClick={() => openPrintable(row)} className="btn-secondary text-xs flex-1"><Printer className="w-3.5 h-3.5" /> Imprimer</button>
                    <button type="button" onClick={() => openPrintable(row)} className="btn-primary text-xs flex-1"><FileText className="w-3.5 h-3.5" /> PDF</button>
                </div>
            </div>
        </div>
    );
}

function EditModal({ row, onClose, onSaved }) {
    const [lines, setLines] = useState(() => (row?.items || []).map((i) => ({
        ...i,
        quantity: String(i.quantity ?? ''),
        unit_price: String(i.unit_price ?? ''),
    })));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const total = useMemo(
        () => lines.reduce((s, l) => s + ((parseFloat(l.quantity) || 0) * (parseFloat(l.unit_price) || 0)), 0),
        [lines],
    );

    const setLine = (idx, key, value) => {
        setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [key]: value } : l)));
    };

    const handleSave = async () => {
        setError('');
        setSaving(true);
        try {
            await api.put(`/sales-orders/${row.id}`, {
                client_id: row.client_id,
                order_date: row.order_date_raw,
                reglement: row.reglement && row.reglement !== '—' ? row.reglement : null,
                city: row.city,
                address: row.address,
                chauffeur: row.chauffeur,
                matricule: row.matricule,
                status: row.status,
                items: lines.map((l) => ({
                    product_id: l.product_id || null,
                    article_ref: l.article_ref || null,
                    code_barre: l.code_barre || null,
                    description: l.description || 'Article',
                    categorie: l.categorie || null,
                    famille: l.famille || null,
                    marque: l.marque || null,
                    unit: l.unit || null,
                    quantity: parseFloat(l.quantity) || 0,
                    unit_price: parseFloat(l.unit_price) || 0,
                })),
            });
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Modification impossible');
        } finally {
            setSaving(false);
        }
    };

    if (!row) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-navy to-blue-800">
                    <div>
                        <p className="text-[10px] text-blue-200 uppercase tracking-wider">Modifier</p>
                        <h3 className="text-white font-bold">{row.reference} — {row.client}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                    {error && <div className="p-2 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>}
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-slate-500 uppercase tracking-wider">
                                <th className="py-2 text-left">Désignation</th>
                                <th className="py-2 w-24 text-center">Qté</th>
                                <th className="py-2 w-28 text-center">Prix/U</th>
                                <th className="py-2 w-28 text-right">Sous-Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {lines.map((l, idx) => (
                                <tr key={l.id || idx}>
                                    <td className="py-2 pr-2">{l.description || l.article_ref || '—'}</td>
                                    <td className="py-2 px-1">
                                        <input
                                            value={l.quantity}
                                            onChange={(e) => setLine(idx, 'quantity', e.target.value)}
                                            className="w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-center"
                                        />
                                    </td>
                                    <td className="py-2 px-1">
                                        <input
                                            value={l.unit_price}
                                            onChange={(e) => setLine(idx, 'unit_price', e.target.value)}
                                            className="w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-center"
                                        />
                                    </td>
                                    <td className="py-2 text-right font-semibold tabular-nums">
                                        {formatMontant((parseFloat(l.quantity) || 0) * (parseFloat(l.unit_price) || 0))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="text-right text-sm font-bold text-emerald-700">Total : {formatMontant(total)}</p>
                </div>
                <div className="flex gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-sm flex-1 disabled:opacity-50">
                        <CheckCircle2 className="w-4 h-4" />
                        {saving ? 'Enregistrement...' : 'Valider'}
                    </button>
                    <button type="button" onClick={onClose} className="btn-danger text-sm flex-1">
                        <XCircle className="w-4 h-4" /> Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

function PayerPanel({ order, onClose, onSaved }) {
    const [reglement, setReglement] = useState('Esp');
    const [numero, setNumero] = useState('');
    const [banque, setBanque] = useState('');
    const [nomTire, setNomTire] = useState('');
    const [dateEncaiss, setDateEncaiss] = useState(todayIso());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const canPay = order?.can_pay !== false && Number(order?.solde ?? order?.montant_ttc) > 0;
    const showCheque = reglement === 'Chq' || reglement === 'Eff';
    const inputClass = 'w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 text-sm text-center outline-none focus:ring-1 focus:ring-brand-navy/30 focus:border-brand-navy';
    const readOnlyClass = 'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 text-sm text-center cursor-not-allowed';

    const handleValider = async () => {
        setError('');
        if (!canPay) {
            setError('Ce bon est déjà soldé.');
            return;
        }
        if (showCheque && (!numero.trim() || !banque.trim() || !nomTire.trim() || !dateEncaiss)) {
            setError('Renseignez N°, Bnq, Tiré et Date Encaiss.');
            return;
        }
        setSaving(true);
        try {
            await api.post('/sales-orders/payer', {
                order_id: order.order_id,
                payment_date: todayIso(),
                reglement,
                numero: showCheque ? numero.trim() : null,
                banque: showCheque ? banque.trim() : null,
                nom_tire: showCheque ? nomTire.trim() : null,
                date_encaissement: showCheque ? dateEncaiss : null,
            });
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Paiement impossible');
        } finally {
            setSaving(false);
        }
    };

    if (!order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900">
                    <div>
                        <p className="text-[10px] text-emerald-100 uppercase tracking-wider">Paiement caisse</p>
                        <h3 className="text-white font-bold flex items-center gap-2"><Wallet className="w-4 h-4" /> Payer</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
                </div>

                <div className="p-5 space-y-3">
                    {error && <div className="p-2 rounded-lg bg-red-50 text-red-600 text-xs border border-red-100">{error}</div>}
                    {!canPay && (
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-100">
                            Bon déjà soldé
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="field-label field-label-compact">Date</label>
                            <input value={todayFr()} readOnly className={readOnlyClass} />
                        </div>
                        <div>
                            <label className="field-label field-label-compact">N° de Bon</label>
                            <input value={order.numero_bon || '—'} readOnly className={readOnlyClass} />
                        </div>
                        <div className="col-span-2">
                            <label className="field-label field-label-compact">Nom Client</label>
                            <input value={order.client_name || '—'} readOnly className={readOnlyClass} />
                        </div>
                        <div className="col-span-2">
                            <label className="field-label field-label-compact">Montant TTC</label>
                            <input value={formatMontant(order.montant_ttc)} readOnly className={`${readOnlyClass} font-bold text-slate-700 dark:text-slate-200`} />
                        </div>
                        <div className="col-span-2">
                            <label className="field-label field-label-compact">Solde à payer</label>
                            <input value={formatMontant(order.solde ?? order.montant_ttc)} readOnly className={`${readOnlyClass} font-bold text-emerald-700 dark:text-emerald-400`} />
                        </div>
                    </div>

                    {canPay && (
                        <>
                            <div>
                                <label className="field-label field-label-compact mb-2 block">Mode de règlement</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {REGLEMENT_CARDS.map((opt) => {
                                        const active = reglement === opt;
                                        return (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setReglement(opt)}
                                                className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition-all ${
                                                    active
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-400/50'
                                                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-300 hover:bg-emerald-50/50'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {showCheque && (
                                <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-900/20 p-3 space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                        Détails {reglement}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="field-label field-label-compact">N°</label>
                                            <input value={numero} onChange={(e) => setNumero(e.target.value)} className={inputClass} placeholder="N° chèque / effet" />
                                        </div>
                                        <div>
                                            <label className="field-label field-label-compact">Bnq</label>
                                            <input value={banque} onChange={(e) => setBanque(e.target.value)} className={inputClass} placeholder="Banque" />
                                        </div>
                                        <div>
                                            <label className="field-label field-label-compact">Tiré</label>
                                            <input value={nomTire} onChange={(e) => setNomTire(e.target.value)} className={inputClass} placeholder="Nom du tiré" />
                                        </div>
                                        <div>
                                            <label className="field-label field-label-compact">Date Encaiss</label>
                                            <input type="date" value={dateEncaiss} onChange={(e) => setDateEncaiss(e.target.value)} className={inputClass} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {canPay && (
                        <button type="button" onClick={handleValider} disabled={saving} className="btn-primary text-sm flex-1 disabled:opacity-50">
                            <CheckCircle2 className="w-4 h-4" />
                            {saving ? 'Validation...' : 'Valider'}
                        </button>
                    )}
                    <button type="button" onClick={onClose} className={`btn-danger text-sm ${canPay ? 'flex-1' : 'w-full'}`}>
                        <XCircle className="w-4 h-4" /> Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Réception caisse : bons commercial (soldés ou en attente de solde).
 */
export default function CaisseReception() {
    const navigate = useNavigate();
    const [lines, setLines] = useState([]);
    const [orderIds, setOrderIds] = useState([]);
    const [selected, setSelected] = useState(() => new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [viewRow, setViewRow] = useState(null);
    const [editRow, setEditRow] = useState(null);
    const [payOrder, setPayOrder] = useState(null);

    const [payableIds, setPayableIds] = useState([]);

    const load = useCallback(() => {
        setLoading(true);
        setError('');
        api.get('/sales-orders-caisse')
            .then((res) => {
                const data = res.data.data ?? [];
                const ids = res.data.meta?.order_ids ?? [];
                const pending = (res.data.meta?.pending_ids ?? []).map(String);
                setLines(data);
                setOrderIds(ids);
                setPayableIds(pending);
                setSelected(new Set(pending));
            })
            .catch(() => {
                setLines([]);
                setOrderIds([]);
                setPayableIds([]);
                setSelected(new Set());
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const totalSelected = useMemo(() => {
        return lines
            .filter((l) => selected.has(String(l.order_id)))
            .reduce((s, l) => s + (Number(l.sous_total) || 0), 0);
    }, [lines, selected]);

    const firstLineIndexByOrder = useMemo(() => {
        const map = new Map();
        lines.forEach((l, idx) => {
            if (!map.has(String(l.order_id))) map.set(String(l.order_id), idx);
        });
        return map;
    }, [lines]);

    const orderSummary = useCallback((orderId) => {
        const group = lines.filter((l) => String(l.order_id) === String(orderId));
        if (!group.length) return null;
        const first = group[0];
        return {
            order_id: first.order_id,
            numero_bon: first.numero_bon,
            client_id: first.client_id,
            client_name: first.client_name,
            montant_ttc: first.montant_ttc,
            solde: first.solde,
            date: first.date,
            commercial_name: first.commercial_name,
            can_pay: first.can_pay,
            can_encaisser: first.can_encaisser,
            status: first.status,
            status_label: first.status_label,
        };
    }, [lines]);

    const fetchOrder = async (orderId) => {
        const { data } = await api.get(`/sales-orders/${orderId}`);
        return data.data;
    };

    const toggleOrder = (orderId) => {
        const key = String(orderId);
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === payableIds.length && payableIds.length > 0) {
            setSelected(new Set());
        } else {
            setSelected(new Set(payableIds));
        }
    };

    const handleValider = async () => {
        setError('');
        const ids = Array.from(selected)
            .map(Number)
            .filter((id) => {
                const s = orderSummary(id);
                return s?.can_encaisser;
            });
        if (!ids.length) {
            setError('Sélectionnez au moins un bon en attente caisse à valider.');
            return;
        }
        setSaving(true);
        try {
            await api.post('/sales-orders/encaisser', { order_ids: ids });
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Impossible d\'encaisser');
        } finally {
            setSaving(false);
        }
    };

    const handlePayer = () => {
        setError('');
        const ids = Array.from(selected).map(Number).filter(Boolean);
        if (ids.length !== 1) {
            setError('Sélectionnez un seul bon pour payer.');
            return;
        }
        openPayForOrder(ids[0]);
    };

    const openPayForOrder = (orderId) => {
        setError('');
        const summary = orderSummary(orderId);
        if (!summary) {
            setError('Bon introuvable.');
            return;
        }
        setSelected(new Set([String(orderId)]));
        setPayOrder(summary);
    };

    const handleFermer = () => navigate('/');

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-emerald-600" />
                        Caisse
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Bons de vente validés par le commercial
                    </p>
                </div>
                <button type="button" onClick={load} disabled={loading} className="btn-secondary text-sm">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                </button>
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
                    {error}
                </div>
            )}

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-brand-navy via-blue-800 to-blue-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Réception bons de vente</h3>
                    <span className="text-xs text-white/80">
                        {orderIds.length} bon(s) · {payableIds.length} en attente de solde
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1200px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-3 py-3 text-center w-10">
                                    <input
                                        type="checkbox"
                                        checked={payableIds.length > 0 && selected.size === payableIds.length}
                                        onChange={toggleAll}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600"
                                    />
                                </th>
                                {['Date', 'Nom Commercial', 'Client', 'N° Bon', 'Réf', 'Désignation', 'Qté', 'Prix/U', 'Sous-Total', 'Solde', 'Statut', 'Actions'].map((h) => (
                                    <th key={h} className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(13)].map((__, j) => (
                                            <td key={j} className="px-3 py-3 text-center">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[80px]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : lines.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-4 py-12 text-center text-slate-400">
                                        Aucun bon envoyé par le commercial
                                    </td>
                                </tr>
                            ) : (
                                lines.map((line, idx) => {
                                    const checked = selected.has(String(line.order_id));
                                    const isFirstOfOrder = firstLineIndexByOrder.get(String(line.order_id)) === idx;
                                    const solde = Number(line.solde) || 0;
                                    const isSolde = !line.can_pay;
                                    return (
                                        <tr
                                            key={`${line.order_id}-${idx}`}
                                            onDoubleClick={(e) => {
                                                if (e.target.closest('button, input, a')) return;
                                                openPayForOrder(line.order_id);
                                            }}
                                            title="Double-clic pour payer"
                                            className={`hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 cursor-pointer ${isSolde ? 'bg-emerald-50/20 dark:bg-emerald-900/10' : ''}`}
                                        >
                                            <td className="px-3 py-2.5 text-center">
                                                {isFirstOfOrder && line.can_pay ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleOrder(line.order_id)}
                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600"
                                                    />
                                                ) : null}
                                            </td>
                                            <td className="px-3 py-2.5 text-center text-xs text-slate-600 dark:text-slate-300">{line.date}</td>
                                            <td className="px-3 py-2.5 text-center text-xs font-medium text-slate-700 dark:text-slate-100">{line.commercial_name}</td>
                                            <td className="px-3 py-2.5 text-center text-xs text-slate-700 dark:text-slate-200">{line.client_name || '—'}</td>
                                            <td className="px-3 py-2.5 text-center font-mono text-xs font-semibold text-brand-navy dark:text-emerald-400">{line.numero_bon}</td>
                                            <td className="px-3 py-2.5 text-center font-mono text-xs text-slate-600 dark:text-slate-300">{line.reference || '—'}</td>
                                            <td className="px-3 py-2.5 text-center text-xs text-slate-700 dark:text-slate-200">{line.designation || '—'}</td>
                                            <td className="px-3 py-2.5 text-center tabular-nums text-xs text-slate-700 dark:text-slate-200">{line.quantity}</td>
                                            <td className="px-3 py-2.5 text-center tabular-nums text-xs text-slate-700 dark:text-slate-200">{formatMontant(line.unit_price)}</td>
                                            <td className="px-3 py-2.5 text-center tabular-nums text-xs font-semibold text-emerald-700 dark:text-emerald-400">{formatMontant(line.sous_total)}</td>
                                            <td className={`px-3 py-2.5 text-center tabular-nums text-xs ${solde > 0 ? 'amount-solde-due' : 'amount-solde-ok'}`}>
                                                {isFirstOfOrder ? formatMontant(line.solde) : ''}
                                            </td>
                                            <td className="px-3 py-2.5 text-center">
                                                {isFirstOfOrder ? (
                                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${
                                                        isSolde
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                            : line.status === 'valide'
                                                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                                : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                                    }`}>
                                                        {line.status_label || '—'}
                                                    </span>
                                                ) : null}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {isFirstOfOrder ? (
                                                    <div className="inline-flex items-center justify-center gap-0.5">
                                                        <ActionBtn
                                                            title="Voir"
                                                            icon={Eye}
                                                            color="blue"
                                                            onClick={async () => {
                                                                try {
                                                                    setViewRow(await fetchOrder(line.order_id));
                                                                } catch {
                                                                    setError('Impossible de charger le bon');
                                                                }
                                                            }}
                                                        />
                                                        <ActionBtn
                                                            title="Modifier"
                                                            icon={Pencil}
                                                            color="amber"
                                                            onClick={async () => {
                                                                try {
                                                                    setEditRow(await fetchOrder(line.order_id));
                                                                } catch {
                                                                    setError('Impossible de charger le bon');
                                                                }
                                                            }}
                                                        />
                                                        <ActionBtn
                                                            title="Imprimer"
                                                            icon={Printer}
                                                            color="slate"
                                                            onClick={async () => {
                                                                try {
                                                                    openPrintable(await fetchOrder(line.order_id));
                                                                } catch {
                                                                    setError('Impossible d\'imprimer');
                                                                }
                                                            }}
                                                        />
                                                        <ActionBtn
                                                            title="PDF"
                                                            icon={FileText}
                                                            color="orange"
                                                            onClick={async () => {
                                                                try {
                                                                    openPrintable(await fetchOrder(line.order_id));
                                                                } catch {
                                                                    setError('Impossible de générer le PDF');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                ) : null}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Total sélection&nbsp;:{' '}
                        <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{formatMontant(totalSelected)}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handlePayer}
                            disabled={!selected.size}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold tracking-wide text-white bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-white/15 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0"
                        >
                            <Wallet className="w-4 h-4" />
                            Payer
                        </button>
                        <button type="button" onClick={handleValider} disabled={saving || !selected.size} className="btn-primary text-sm disabled:opacity-50">
                            <CheckCircle2 className="w-4 h-4" />
                            {saving ? 'Validation...' : 'Valider'}
                        </button>
                        <button type="button" onClick={handleFermer} className="btn-danger text-sm">
                            <XCircle className="w-4 h-4" />
                            Fermer
                        </button>
                    </div>
                </div>
            </div>

            {viewRow && <ViewModal row={viewRow} onClose={() => setViewRow(null)} />}
            {editRow && <EditModal row={editRow} onClose={() => setEditRow(null)} onSaved={load} />}
            {payOrder && <PayerPanel order={payOrder} onClose={() => setPayOrder(null)} onSaved={load} />}
        </div>
    );
}
