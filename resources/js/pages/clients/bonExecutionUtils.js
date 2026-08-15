import { formatDelayDisplay, formatMontant } from '../devis/devisUtils';

export { formatDelayDisplay, formatMontant };

export const emptyFilters = {
    date_from: '',
    date_to: '',
    client_name: '',
    city: '',
};

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatMontantPlain(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function buildBonExecutionHtml(row) {
    const itemsRows = (row.items || []).map((item) => {
        const typeTravaux = item.type_travaux?.trim();
        const typeTravauxCell = typeTravaux
            ? `<span class="type-travaux-box">${esc(typeTravaux)}</span>`
            : '—';
        return `
<tr>
<td class="left">${typeTravauxCell}</td>
<td class="left designation">${esc(item.designation || '—')}</td>
<td>${esc(item.consistance || '—')}</td>
<td>${esc(item.unit || '—')}</td>
<td class="num">${item.quantity ?? 1}</td>
<td class="num">${formatMontantPlain(item.unit_price)}</td>
<td class="num strong"><span class="subtotal-box">${formatMontantPlain(item.subtotal)}</span></td>
</tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Bon D'Execution ${esc(row.reference)}</title>
<style>
@page { size: A4 portrait; margin: 10mm 12mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    color: #1e293b;
    line-height: 1.35;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
.sheet { max-width: 210mm; margin: 0 auto; padding: 8mm; }
.header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 2px solid #1e3a8a;
}
.brand h1 { font-size: 18px; color: #1e3a8a; margin-bottom: 2px; }
.brand p { font-size: 9px; color: #64748b; }
.doc-title {
    text-align: right;
}
.doc-title h2 {
    font-size: 16px;
    color: #1e3a8a;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.doc-title p { font-size: 10px; color: #475569; margin-top: 2px; }
.meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
    margin-bottom: 14px;
    font-size: 10px;
}
.meta div { padding: 2px 0; }
.meta strong { color: #1e3a8a; }
.lines { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
.lines th, .lines td {
    border: 1px solid #cbd5e1;
    padding: 5px 6px;
    vertical-align: middle;
}
.lines thead th {
    background: #1e3a8a;
    color: #fff;
    font-weight: 700;
    font-size: 9px;
    text-transform: uppercase;
}
.lines tbody tr:nth-child(even) td { background: #f8fafc; }
.lines .num { text-align: right; white-space: nowrap; }
.lines .left { text-align: left; }
.lines .designation { word-wrap: break-word; overflow-wrap: anywhere; }
.lines .strong { font-weight: 700; color: #1e3a5f; }
.lines .type-travaux-box {
    display: inline-block;
    min-width: 48px;
    padding: 2px 8px;
    background: #fef9c3;
    border: 1px solid #fde047;
    border-radius: 4px;
    color: #1e3a5f;
    font-weight: 600;
}
.lines .subtotal-box {
    display: inline-block;
    min-width: 56px;
    padding: 2px 8px;
    border: 1px solid #1e3a5f;
    border-radius: 4px;
    background: #f8fafc;
    font-weight: 700;
    color: #1e3a5f;
}
.totals {
    width: 52%;
    margin-left: auto;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
}
.totals table { width: 100%; border-collapse: collapse; }
.totals td {
    padding: 6px 10px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 10px;
}
.totals tr:last-child td { border-bottom: none; }
.totals td:first-child { font-weight: 600; color: #475569; }
.totals td:last-child { text-align: right; font-weight: 700; color: #1e3a8a; }
.totals tr.highlight td { background: #eef2ff; }
</style>
</head>
<body>
<div class="sheet">
    <div class="header">
        <div class="brand">
            <h1>Autopilote</h1>
            <p>ERP BTP — Gestion de chantiers</p>
        </div>
        <div class="doc-title">
            <h2>Bon D'Execution</h2>
            <p><strong>Réf :</strong> ${esc(row.reference)}</p>
            <p><strong>Date :</strong> ${esc(row.order_date)}</p>
        </div>
    </div>

    <div class="meta">
        <div><strong>DV N° :</strong> ${esc(row.quote_reference || '—')}</div>
        <div><strong>Nom Client :</strong> ${esc(row.client_name || '—')}</div>
        <div><strong>Type Travaux :</strong> ${esc(row.type_travaux || '—')}</div>
        <div><strong>Ville :</strong> ${esc(row.city || '—')}</div>
        <div><strong>Délai :</strong> ${esc(formatDelayDisplay(row.work_delay))}</div>
        <div><strong>Règlement :</strong> ${esc(row.reglement || '—')}</div>
    </div>

    <table class="lines">
        <thead>
            <tr>
                <th>Type Travaux</th>
                <th>Désignation</th>
                <th>Cons.</th>
                <th>Unité</th>
                <th>Qté</th>
                <th>Prix HT</th>
                <th>Sous-Total HT</th>
            </tr>
        </thead>
        <tbody>${itemsRows || '<tr><td colspan="7" style="text-align:center;color:#94a3b8">Aucune ligne</td></tr>'}</tbody>
    </table>

    <div class="totals">
        <table>
            <tr><td>Montant HT</td><td>${formatMontantPlain(row.subtotal)}</td></tr>
            <tr><td>TVA 20%</td><td>${formatMontantPlain(row.tva)}</td></tr>
            <tr class="highlight"><td>Montant TTC</td><td>${formatMontantPlain(row.total_ttc)}</td></tr>
            <tr><td>Avance</td><td>${formatMontantPlain(row.avance)}</td></tr>
            <tr class="highlight"><td>Solde</td><td>${formatMontantPlain(row.solde)}</td></tr>
        </table>
    </div>
</div>
</body>
</html>`;
}

export function openPrintable(row) {
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(buildBonExecutionHtml(row));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}
