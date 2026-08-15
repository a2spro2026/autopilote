export const CONSISTANCE_OPTIONS = ['', 'F', 'M', 'F+M'];
export const UNIT_OPTIONS = ['', 'JEU', 'KG', 'KM', 'KM-UNIF', 'M', 'M²', 'M³', 'ML', 'T', 'U'];
export const TYPE_OPTIONS = ['', 'Public', 'Privé'];
export const STATUT_FILTER_OPTIONS = [
    { value: '', label: 'Tous' },
    { value: 'en_attente', label: 'En Attente' },
    { value: 'valide', label: 'Validé' },
];

let lineKey = 0;
export function newLine() {
    return {
        _key: ++lineKey,
        type_travaux: '',
        designation: '',
        consistance: '',
        unit: '',
        quantity: '1',
        unit_price: '',
    };
}

export const emptyHeader = {
    client_id: '',
    quote_date: '',
    contact: '',
    city: '',
    chantier_type: '',
    budget: '',
    work_delay: '',
};

export const emptyFilters = {
    date_from: '',
    date_to: '',
    client_name: '',
    city: '',
    statut: '',
};

export function parseDelayInput(value) {
    return String(value ?? '').replace(/\s*Jrs?\.?$/i, '').trim();
}

export function formatDelayDisplay(value) {
    const n = parseDelayInput(value);
    if (!n) return '—';
    return `${n} Jrs`;
}

export function formatDelaySave(value) {
    const n = parseDelayInput(value);
    if (!n) return null;
    return `${n} Jrs`;
}

export function lineSubtotal(line) {
    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.unit_price) || 0;
    return qty * price;
}

export const TVA_RATE = 0.20;

export function calcTotals(totalHt) {
    const ht = Number(totalHt) || 0;
    const tva = Math.round(ht * TVA_RATE * 100) / 100;
    const totalTtc = Math.round((ht + tva) * 100) / 100;
    return { totalHt: ht, tva, totalTtc };
}

export function formatMontant(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

export function buildDevisHtml(row) {
    const totals = calcTotals(row.subtotal);
    const tva = row.tva ?? totals.tva;
    const totalTtc = row.total_ttc ?? totals.totalTtc;
    const subtotal = row.subtotal ?? totals.totalHt;

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
<title>Devis ${esc(row.reference)}</title>
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
.sheet {
    width: 100%;
    max-width: 186mm;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 277mm;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #1e3a5f;
    margin-bottom: 10px;
}
.brand h1 {
    font-size: 18px;
    color: #1e3a5f;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
}
.brand p { font-size: 9px; color: #64748b; }
.doc-box { text-align: right; }
.doc-title {
    font-size: 15px;
    font-weight: 700;
    color: #ea580c;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.doc-ref {
    display: inline-block;
    margin-top: 4px;
    padding: 3px 10px;
    background: #fff7ed;
    color: #ea580c;
    border: 1px solid #fdba74;
    border-radius: 999px;
    font-weight: 700;
    font-size: 11px;
}
.doc-meta { margin-top: 6px; font-size: 9px; color: #475569; }
.doc-meta div { margin-top: 2px; }
.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
}
.info-card {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
}
.info-card h3 {
    background: #1e3a5f;
    color: #fff;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    padding: 5px 8px;
}
.info-card table { width: 100%; border-collapse: collapse; }
.info-card th,
.info-card td {
    padding: 4px 8px;
    font-size: 9px;
    border-bottom: 1px solid #f1f5f9;
    text-align: left;
    vertical-align: top;
}
.info-card th {
    width: 38%;
    color: #64748b;
    font-weight: 700;
    background: #f8fafc;
}
.info-card tr:last-child th,
.info-card tr:last-child td { border-bottom: none; }
.section-title {
    font-size: 10px;
    font-weight: 700;
    color: #1e3a5f;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 5px;
}
.lines-wrap {
    flex: 1;
    margin-bottom: 8px;
}
.lines {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}
.lines thead th {
    background: #1e3a5f;
    color: #fff;
    font-weight: 700;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    padding: 5px 4px;
    border: 1px solid #1e3a5f;
    text-align: center;
}
.lines tbody td {
    border: 1px solid #e2e8f0;
    padding: 4px 4px;
    font-size: 9px;
    vertical-align: middle;
}
.lines tbody tr:nth-child(even) td { background: #f8fafc; }
.lines .num { text-align: right; white-space: nowrap; }
.lines .left { text-align: left; }
.lines .designation {
    word-wrap: break-word;
    overflow-wrap: anywhere;
}
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
.col-type { width: 23%; }
.col-des { width: 33%; }
.col-c { width: 8%; }
.col-u { width: 8%; }
.col-q { width: 8%; }
.col-p { width: 9%; }
.col-s { width: 13%; }
.bottom {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: auto;
    padding-top: 8px;
}
.totals {
    width: 52%;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
}
.totals table { width: 100%; border-collapse: collapse; }
.totals td {
    padding: 5px 10px;
    font-size: 10px;
    border-bottom: 1px solid #f1f5f9;
}
.totals td:first-child {
    color: #64748b;
    font-weight: 600;
    text-align: left;
}
.totals td:last-child {
    text-align: right;
    font-weight: 700;
    white-space: nowrap;
}
.totals tr:last-child td {
    background: #1e3a5f;
    color: #fff;
    font-size: 11px;
    border-bottom: none;
}
.totals tr:nth-last-child(2) td { border-bottom: none; }
.footer {
    margin-top: 10px;
    padding-top: 6px;
    border-top: 1px dashed #cbd5e1;
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    color: #94a3b8;
}
.badge-statut {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 9px;
    background: #fef3c7;
    color: #b45309;
}
.badge-statut.valide { background: #d1fae5; color: #047857; }
@media print {
    body { margin: 0; }
    .sheet { min-height: auto; max-height: 277mm; }
}
</style>
</head>
<body>
<div class="sheet">
    <div class="header">
        <div class="brand">
            <h1>Autopilote</h1>
            <p>Gestion intelligente — Bâtiment &amp; Travaux Publics</p>
        </div>
        <div class="doc-box">
            <div class="doc-title">Devis</div>
            <div class="doc-ref">${esc(row.reference)}</div>
            <div class="doc-meta">
                <div><strong>Date :</strong> ${esc(row.quote_date || '—')}</div>
                <div><strong>Statut :</strong>
                    <span class="badge-statut ${row.statut === 'Validé' ? 'valide' : ''}">${esc(row.statut || 'En Attente')}</span>
                </div>
                ${row.bon_commande ? `<div><strong>Bon de commande :</strong> ${esc(row.bon_commande)}</div>` : ''}
            </div>
        </div>
    </div>

    <div class="info-grid">
        <div class="info-card">
            <h3>Client</h3>
            <table>
                <tr><th>Nom</th><td>${esc(row.client_name || '—')}</td></tr>
                <tr><th>Contact</th><td>${esc(row.contact || '—')}</td></tr>
                <tr><th>Ville</th><td>${esc(row.city || '—')}</td></tr>
            </table>
        </div>
        <div class="info-card">
            <h3>Chantier</h3>
            <table>
                <tr><th>Type</th><td>${esc(row.chantier_type || '—')}</td></tr>
                <tr><th>Délai</th><td>${esc(formatDelayDisplay(row.work_delay))}</td></tr>
            </table>
        </div>
    </div>

    <div class="lines-wrap">
        <div class="section-title">Détail des prestations</div>
        <table class="lines">
            <thead>
                <tr>
                    <th class="col-type" style="color:#1e3a5f">Type Travaux</th>
                    <th class="col-des">Désignation</th>
                    <th class="col-c">Cons.</th>
                    <th class="col-u">Unité</th>
                    <th class="col-q">Qté</th>
                    <th class="col-p">Prix HT</th>
                    <th class="col-s">Sous-Total HT</th>
                </tr>
            </thead>
            <tbody>${itemsRows || '<tr><td colspan="7" style="text-align:center;padding:12px;color:#94a3b8">Aucune ligne</td></tr>'}</tbody>
        </table>
    </div>

    <div class="bottom">
        <div class="totals">
            <table>
                <tr><td>Total HT</td><td>${formatMontantPlain(subtotal)}</td></tr>
                <tr><td>TVA 20%</td><td>${formatMontantPlain(tva)}</td></tr>
                <tr><td>Total TTC</td><td>${formatMontantPlain(totalTtc)}</td></tr>
            </table>
        </div>
    </div>

    <div class="footer">
        <span>Document généré le ${new Date().toLocaleDateString('fr-FR')} — Autopilote</span>
        <span>Devis valable 30 jours — Merci de votre confiance</span>
    </div>
</div>
</body>
</html>`;
}

export function openPrintable(row) {
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(buildDevisHtml(row));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}

export function mapRowToLines(row) {
    return (row.items?.length ? row.items : [{
        type_travaux: row.type_travaux || '',
        designation: row.designation || '',
        consistance: row.consistance || '',
        unit: row.unit || '',
        quantity: row.quantity ?? '1',
        unit_price: row.unit_price ?? '',
    }]).map((item) => ({
        _key: ++lineKey,
        type_travaux: item.type_travaux || '',
        designation: item.designation || '',
        consistance: item.consistance || '',
        unit: item.unit || '',
        quantity: String(item.quantity ?? '1'),
        unit_price: item.unit_price !== undefined && item.unit_price !== null ? String(item.unit_price) : '',
    }));
}
