import { useCallback, useEffect, useMemo, useState } from 'react';
import { Banknote, CircleDollarSign, FileCheck, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import api from '../lib/api';

const METHODS = [
    ['especes', 'Espèces'],
    ['cheque', 'Chèque'],
    ['virement', 'Virement'],
    ['carte', 'Carte'],
];

const emptyForm = {
    invoice_id: '',
    payment_date: '',
    amount: '',
    method: 'virement',
    reference: '',
    notes: '',
};

const inputClass = 'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 text-xs text-center outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600';

function formatAmount(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function methodLabel(value) {
    return METHODS.find(([key]) => key === value)?.[1] || value || '—';
}

function SummaryCard({ label, value, icon: Icon, gradient, money = true }) {
    return (
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 text-white shadow-lg`}>
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">{label}</p>
                    <p className="mt-1 text-xl font-extrabold tabular-nums">{money ? formatAmount(value) : value}</p>
                </div>
                <div className="rounded-xl bg-white/15 p-2.5 ring-1 ring-white/20"><Icon className="h-5 w-5" /></div>
            </div>
        </div>
    );
}

function PaymentModal({ open, form, invoices, editingId, saving, error, onChange, onClose, onSubmit }) {
    const selectedInvoice = invoices.find((invoice) => Number(invoice.id) === Number(form.invoice_id));
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between bg-gradient-to-r from-zinc-900 via-brand-navy to-slate-900 px-5 py-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-100">Factures ventes</p>
                        <h2 className="text-sm font-extrabold uppercase tracking-wide text-white">{editingId ? 'Modifier le règlement' : 'Nouveau règlement de facture'}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 p-5">
                    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{error}</div>}

                    <div>
                        <label className="field-label">Facture de vente</label>
                        <select required value={form.invoice_id} onChange={(event) => onChange('invoice_id', event.target.value)} className={inputClass}>
                            <option value="">Sélectionner une facture</option>
                            {invoices.map((invoice) => (
                                <option key={invoice.id} value={invoice.id} disabled={!editingId && Number(invoice.remaining) <= 0}>
                                    {invoice.reference} — {invoice.client_name || 'Client'} — Solde {formatAmount(invoice.remaining)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedInvoice && (
                        <div className="grid grid-cols-3 gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-center dark:border-blue-900 dark:bg-blue-950/30">
                            <div><p className="text-[9px] font-bold uppercase text-slate-400">Total TTC</p><p className="text-sm font-bold text-slate-800 dark:text-white">{formatAmount(selectedInvoice.total_ttc)}</p></div>
                            <div><p className="text-[9px] font-bold uppercase text-slate-400">Déjà payé</p><p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatAmount(selectedInvoice.amount_paid)}</p></div>
                            <div><p className="text-[9px] font-bold uppercase text-slate-400">Solde</p><p className="text-sm font-extrabold text-orange-600">{formatAmount(selectedInvoice.remaining)}</p></div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="field-label field-label-compact">Date</label>
                            <input required type="date" value={form.payment_date} onChange={(event) => onChange('payment_date', event.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="field-label field-label-compact">Montant</label>
                            <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => onChange('amount', event.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="field-label field-label-compact">Mode de paiement</label>
                            <select required value={form.method} onChange={(event) => onChange('method', event.target.value)} className={inputClass}>
                                {METHODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="field-label field-label-compact">N° chèque / Référence</label>
                            <input value={form.reference} onChange={(event) => onChange('reference', event.target.value)} className={inputClass} placeholder="Facultatif" />
                        </div>
                    </div>

                    <div>
                        <label className="field-label field-label-compact">Remarque</label>
                        <textarea rows={2} value={form.notes} onChange={(event) => onChange('notes', event.target.value)} className={inputClass} />
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="btn-muted text-xs">Annuler</button>
                        <button type="submit" disabled={saving} className="btn-primary min-w-28 text-xs">{saving ? 'Enregistrement...' : 'Valider'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ReglementFactureVentePage() {
    const [rows, setRows] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState({ count: 0, total_paid: 0, invoice_total: 0, remaining_total: 0 });
    const [filters, setFilters] = useState({ reference: '', method: '', month: '' });
    const [appliedFilters, setAppliedFilters] = useState({});
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        setLoading(true);
        api.get('/invoice-payments', { params: appliedFilters })
            .then(({ data }) => {
                setRows(data.data || []);
                setSummary(data.meta || {});
            })
            .catch(() => {
                setRows([]);
                setSummary({ count: 0, total_paid: 0, invoice_total: 0, remaining_total: 0 });
            })
            .finally(() => setLoading(false));
    }, [appliedFilters]);

    const loadInvoices = useCallback(() => {
        api.get('/invoice-payments/invoices', { params: { all: 1 } })
            .then(({ data }) => setInvoices(data.data || []))
            .catch(() => setInvoices([]));
    }, []);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { loadInvoices(); }, [loadInvoices]);

    const clients = useMemo(() => [...new Set(rows.map((row) => row.client_name).filter(Boolean))], [rows]);

    const openNew = () => {
        setEditingId(null);
        setForm({ ...emptyForm, payment_date: new Date().toISOString().slice(0, 10) });
        setError('');
        setModalOpen(true);
    };

    const openEdit = (row) => {
        setEditingId(row.id);
        setForm({
            invoice_id: String(row.invoice_id || ''),
            payment_date: row.payment_date || '',
            amount: row.amount || '',
            method: row.method || 'virement',
            reference: row.reference || '',
            notes: row.notes || '',
        });
        setError('');
        setModalOpen(true);
    };

    const onChange = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (editingId) {
                await api.put(`/invoice-payments/${editingId}`, form);
            } else {
                await api.post('/invoice-payments', form);
            }
            setModalOpen(false);
            await Promise.all([load(), loadInvoices()]);
        } catch (requestError) {
            const errors = requestError.response?.data?.errors;
            setError(errors ? Object.values(errors).flat()[0] : requestError.response?.data?.message || 'Enregistrement impossible.');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (row) => {
        if (!window.confirm(`Supprimer le règlement ${row.code} ? Le solde de la facture sera recalculé.`)) return;
        try {
            await api.delete(`/invoice-payments/${row.id}`);
            await Promise.all([load(), loadInvoices()]);
        } catch (requestError) {
            window.alert(requestError.response?.data?.message || 'Suppression impossible.');
        }
    };

    return (
        <div className="space-y-4">
            <PaymentModal open={modalOpen} form={form} invoices={invoices} editingId={editingId} saving={saving} error={error} onChange={onChange} onClose={() => setModalOpen(false)} onSubmit={submit} />

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Règlements Factures Ventes</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Paiements liés uniquement aux factures de vente — indépendants des règlements clients sur bons de vente.</p>
                </div>
                <button type="button" onClick={openNew} className="btn-primary self-start text-sm"><Plus className="h-4 w-4" /> Nouveau</button>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <SummaryCard label="Factures TTC" value={summary.invoice_total} icon={FileCheck} gradient="from-zinc-900 to-brand-navy" />
                <SummaryCard label="Total réglé" value={summary.total_paid} icon={CircleDollarSign} gradient="from-emerald-500 to-teal-800" />
                <SummaryCard label="Solde factures" value={summary.remaining_total} icon={Banknote} gradient="from-orange-500 to-rose-700" />
                <SummaryCard label="Nb règlements" value={summary.count || 0} icon={Banknote} gradient="from-violet-600 to-indigo-900" money={false} />
            </div>

            <div className="glass-card p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <input value={filters.reference} onChange={(event) => setFilters({ ...filters, reference: event.target.value })} className={inputClass} placeholder="N° facture / référence" />
                    <select value={filters.method} onChange={(event) => setFilters({ ...filters, method: event.target.value })} className={inputClass}>
                        <option value="">Tous les modes</option>
                        {METHODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <input type="month" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })} className={inputClass} />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setAppliedFilters({ ...filters })} className="btn-secondary flex-1 text-xs">Rechercher</button>
                        <button type="button" title="Actualiser" onClick={load} className="btn-muted px-3"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
                    </div>
                </div>
                {clients.length > 0 && <p className="mt-2 text-[10px] text-slate-400">{clients.length} client(s) dans la liste affichée</p>}
            </div>

            <div className="glass-card overflow-hidden border border-slate-200/70 shadow-card dark:border-slate-700/70">
                <div className="bg-gradient-to-r from-zinc-900 via-brand-navy to-slate-900 px-5 py-3.5">
                    <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-white"><Banknote className="h-4 w-4" /> Liste des règlements de factures</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead>
                            <tr>
                                {['Date', 'N° Règlement', 'N° Facture', 'Client', 'Mode', 'Référence', 'Montant', 'Solde Facture', 'Actions'].map((heading) => (
                                    <th key={heading} className="px-3 py-3 text-center text-[10px] text-slate-600 dark:text-slate-200">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">Chargement...</td></tr>
                            ) : rows.length ? rows.map((row) => (
                                <tr key={row.id} className="transition-colors hover:bg-orange-50/50 dark:hover:bg-slate-800/50">
                                    <td className="px-3 py-3 text-center">{row.payment_date}</td>
                                    <td className="px-3 py-3 text-center font-mono text-xs font-bold text-brand-navy dark:text-orange-400">{row.code}</td>
                                    <td className="px-3 py-3 text-center font-bold">{row.invoice_reference}</td>
                                    <td className="px-3 py-3 text-center">{row.client_name || '—'}</td>
                                    <td className="px-3 py-3 text-center"><span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-orange-700 dark:bg-blue-900/40 dark:text-orange-300">{methodLabel(row.method)}</span></td>
                                    <td className="px-3 py-3 text-center text-xs">{row.reference || '—'}</td>
                                    <td className="px-3 py-3 text-center font-extrabold tabular-nums text-emerald-700 dark:text-emerald-400">{formatAmount(row.amount)}</td>
                                    <td className="px-3 py-3 text-center font-bold tabular-nums text-orange-600">{formatAmount(row.invoice_remaining)}</td>
                                    <td className="px-3 py-3">
                                        <div className="flex justify-center gap-1">
                                            <button type="button" title="Modifier" onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30"><Pencil className="h-4 w-4" /></button>
                                            <button type="button" title="Supprimer" onClick={() => remove(row)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={9} className="px-4 py-14 text-center text-slate-400">Aucun règlement de facture enregistré</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
