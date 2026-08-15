import { Banknote, ClipboardList, ShoppingBag, Wallet } from 'lucide-react';
import ReportTable from './ReportTable';

function formatMontant(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatQte(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 });
}

function SoldeCell({ value }) {
    const n = Number(value) || 0;
    const color = n > 0
        ? 'text-red-600 dark:text-red-400'
        : 'text-emerald-600 dark:text-emerald-400';
    return <span className={`font-bold tabular-nums ${color}`}>{formatMontant(n)}</span>;
}

function PayeCell({ value }) {
    return <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatMontant(value)}</span>;
}

const bonsAchatsColumns = [
    { key: 'date', label: 'Date' },
    { key: 'fournisseur', label: 'Fournisseurs' },
    { key: 'bn_numero', label: 'BN N°', render: (v) => <span className="font-mono text-xs font-semibold text-brand-navy dark:text-orange-400">{v || '—'}</span> },
    { key: 'qte', label: 'Qte', align: 'right', render: (v) => formatQte(v) },
    { key: 'montant_bon', label: 'Montant Bon', align: 'right', render: (v) => <span className="font-semibold tabular-nums text-brand-navy dark:text-orange-400">{formatMontant(v)}</span> },
    { key: 'solde', label: 'Solde', align: 'right', render: (v) => <SoldeCell value={v} /> },
];

const bonsVentesColumns = [
    { key: 'date', label: 'Date' },
    { key: 'client', label: 'Client' },
    { key: 'bn_numero', label: 'BN N°', render: (v) => <span className="font-mono text-xs font-semibold text-brand-navy dark:text-blue-400">{v || '—'}</span> },
    { key: 'qte', label: 'Qte', align: 'right', render: (v) => formatQte(v) },
    { key: 'montant_bon', label: 'Montant Bon', align: 'right', render: (v) => <span className="font-semibold tabular-nums text-brand-navy dark:text-blue-400">{formatMontant(v)}</span> },
    { key: 'solde', label: 'Solde', align: 'right', render: (v) => <SoldeCell value={v} /> },
];

const bonsChargeColumns = [
    { key: 'date', label: 'Date' },
    { key: 'designation', label: 'Désignation' },
    { key: 'beneficiaire', label: 'Bénéficiaire' },
    { key: 'regl', label: 'Régl', render: (v) => <span className="font-semibold text-slate-700 dark:text-slate-200">{v || '—'}</span> },
    { key: 'date_decaiss', label: 'Date Décaiss' },
];

const reglADecaisserColumns = [
    { key: 'type_reg', label: 'Type Rég', render: (v) => <span className="font-semibold text-slate-700 dark:text-slate-200">{v || '—'}</span> },
    { key: 'numero', label: 'N°', render: (v) => <span className="font-mono text-xs font-semibold">{v || '—'}</span> },
    { key: 'bnq', label: 'Bnq' },
    { key: 'tire', label: 'Tiré' },
    { key: 'montant', label: 'Montant', align: 'right', render: (v) => <span className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">{formatMontant(v)}</span> },
    { key: 'date_decaiss', label: 'Date Décaiss' },
];

export default function DashboardTables({ tables, loading }) {
    return (
        <div className="space-y-6 pb-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ReportTable
                    title="5 Derniers Bons Achats"
                    icon={ClipboardList}
                    columns={bonsAchatsColumns}
                    rows={tables?.derniers_bons_achats}
                    loading={loading}
                    accent="from-amber-500 via-orange-500 to-orange-700"
                    headerStyle="gray"
                    showCount={false}
                />
                <ReportTable
                    title="5 Derniers Bons Ventes"
                    icon={ShoppingBag}
                    columns={bonsVentesColumns}
                    rows={tables?.derniers_bons_ventes}
                    loading={loading}
                    accent="from-blue-600 via-blue-700 to-slate-800"
                    headerStyle="gray"
                    showCount={false}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ReportTable
                    title="5 Derniers Bon Charge"
                    icon={Wallet}
                    columns={bonsChargeColumns}
                    rows={tables?.derniers_bons_charge}
                    loading={loading}
                    accent="from-teal-600 via-cyan-700 to-slate-800"
                    headerStyle="gray"
                    showCount={false}
                />

                <ReportTable
                    title="5 Régl à Décaisser — Semaine en cours"
                    icon={Banknote}
                    columns={reglADecaisserColumns}
                    rows={tables?.regl_a_decaisser}
                    loading={loading}
                    accent="from-rose-500 via-red-500 to-rose-800"
                    headerStyle="gray"
                    showCount={false}
                />
            </div>
        </div>
    );
}
