export function formatMontantPlain(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Solde client / bon : 0 → vert, > 0 → rouge */
export function soldeTone(value) {
    const n = Number(value) || 0;
    if (n > 0) return 'red';
    return 'green';
}

export function formatSoldePlain(value) {
    return formatMontantPlain(value);
}

export function PayeCell({ value }) {
    return (
        <span className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
            {formatMontantPlain(value)}
        </span>
    );
}

export function SoldeCell({ value }) {
    const n = Number(value) || 0;
    if (n > 0) {
        return (
            <span className="tabular-nums font-bold text-red-600 dark:text-red-400">
                {formatMontantPlain(n)}
            </span>
        );
    }
    return (
        <span className="tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
            {formatMontantPlain(n)}
        </span>
    );
}

export function ReliquatCell({ value }) {
    const n = Number(value) || 0;
    if (n <= 0) return <span className="text-slate-400">—</span>;
    return (
        <span className="tabular-nums font-bold text-amber-600 dark:text-yellow-400">
            {formatSoldePlain(n)}
        </span>
    );
}
