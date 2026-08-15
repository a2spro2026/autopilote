import { formatMontant } from './bonExecutionUtils';

const REGLEMENT_LABELS = {
    Esp: 'Espèces',
    Chq: 'Chèque',
    Eff: 'Effet',
    Vir: 'Virement',
    Vers: 'Versement',
};

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatPlain(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function buildPaymentHtml(payment) {
    const allocationsRows = (payment.allocations || []).map((a) => `
<tr>
<td>${esc(a.order_reference || a.quote_reference || '—')}</td>
<td class="num">${formatPlain(a.amount)}</td>
</tr>`).join('');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Reçu Paiement ${esc(payment.reference)}</title>
<style>
@page { size: A4 portrait; margin: 12mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.4; }
.header { display: flex; justify-content: space-between; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 16px; }
.brand h1 { color: #1e3a8a; font-size: 20px; }
.doc-title { text-align: right; }
.doc-title h2 { color: #1e3a8a; text-transform: uppercase; font-size: 16px; }
.meta { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
.meta td { padding: 6px 8px; border: 1px solid #e2e8f0; }
.meta td:first-child { font-weight: 700; background: #f8fafc; width: 35%; color: #475569; }
.lines { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
.lines th, .lines td { border: 1px solid #cbd5e1; padding: 6px 8px; }
.lines th { background: #1e3a8a; color: #fff; font-weight: 700; text-transform: uppercase; font-size: 10px; }
.lines .num { text-align: right; }
.total { text-align: right; font-size: 14px; font-weight: 700; color: #1e3a8a; margin-top: 8px; }
</style>
</head>
<body>
<div class="header">
    <div class="brand"><h1>Autopilote</h1><p>État de Paiement Client</p></div>
    <div class="doc-title">
        <h2>Reçu de Paiement</h2>
        <p><strong>Réf :</strong> ${esc(payment.reference)}</p>
        <p><strong>Date :</strong> ${esc(payment.payment_date)}</p>
    </div>
</div>
<table class="meta">
<tr><td>Client</td><td>${esc(payment.client_name || '—')}</td></tr>
<tr><td>Ville Chantier</td><td>${esc(payment.ville_chantier || '—')}</td></tr>
<tr><td>Type Chantier</td><td>${esc(payment.chantier_type || '—')}</td></tr>
<tr><td>Règlement</td><td>${esc(REGLEMENT_LABELS[payment.reglement] || payment.reglement || '—')}</td></tr>
<tr><td>N°</td><td>${esc(payment.numero || '—')}</td></tr>
<tr><td>Banque</td><td>${esc(payment.banque || '—')}</td></tr>
<tr><td>Nom Tiré</td><td>${esc(payment.nom_tire || '—')}</td></tr>
<tr><td>Montant Total État</td><td>${formatPlain(payment.montant_total)}</td></tr>
</table>
${allocationsRows ? `
<table class="lines">
<thead><tr><th>Réf° État</th><th>Montant Affecté</th></tr></thead>
<tbody>${allocationsRows}</tbody>
</table>` : ''}
<p class="total">Montant payé : ${formatPlain(payment.montant)}</p>
<p class="total">Solde : ${formatPlain((Number(payment.montant) || 0) - (Number(payment.montant_total) || 0))}</p>
</body>
</html>`;
}

export function openPaymentPrintable(payment) {
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(buildPaymentHtml(payment));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}

export { formatMontant };
