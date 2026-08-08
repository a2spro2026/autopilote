const h=["","F","M","F+M"],m=["","JEU","KG","KM","KM-UNIF","M","M²","M³","ML","T","U"],v=["","Public","Privé"],y=[{value:"",label:"Tous"},{value:"en_attente",label:"En Attente"},{value:"valide",label:"Validé"}];let r=0;function T(){return{_key:++r,type_travaux:"",designation:"",consistance:"",unit:"",quantity:"1",unit_price:""}}const _={client_id:"",quote_date:"",contact:"",city:"",chantier_type:"",budget:"",work_delay:""},w={date_from:"",date_to:"",client_name:"",city:"",statut:""};function l(t){return String(t??"").replace(/\s*Jrs?\.?$/i,"").trim()}function f(t){const e=l(t);return e?`${e} Jrs`:"—"}function $(t){const e=l(t);return e?`${e} Jrs`:null}function k(t){const e=parseFloat(t.quantity)||0,i=parseFloat(t.unit_price)||0;return e*i}const u=.2;function g(t){const e=Number(t)||0,i=Math.round(e*u*100)/100,s=Math.round((e+i)*100)/100;return{totalHt:e,tva:i,totalTtc:s}}function D(t){return(Number(t)||0).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})}function a(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function o(t){return(Number(t)||0).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})}function x(t){const e=g(t.subtotal),i=t.tva??e.tva,s=t.total_ttc??e.totalTtc,c=t.subtotal??e.totalHt,p=(t.items||[]).map(n=>{const d=n.type_travaux?.trim();return`
<tr>
<td class="left">${d?`<span class="type-travaux-box">${a(d)}</span>`:"—"}</td>
<td class="left designation">${a(n.designation||"—")}</td>
<td>${a(n.consistance||"—")}</td>
<td>${a(n.unit||"—")}</td>
<td class="num">${n.quantity??1}</td>
<td class="num">${o(n.unit_price)}</td>
<td class="num strong"><span class="subtotal-box">${o(n.subtotal)}</span></td>
</tr>`}).join("");return`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Devis ${a(t.reference)}</title>
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
            <div class="doc-ref">${a(t.reference)}</div>
            <div class="doc-meta">
                <div><strong>Date :</strong> ${a(t.quote_date||"—")}</div>
                <div><strong>Statut :</strong>
                    <span class="badge-statut ${t.statut==="Validé"?"valide":""}">${a(t.statut||"En Attente")}</span>
                </div>
                ${t.bon_commande?`<div><strong>Bon de commande :</strong> ${a(t.bon_commande)}</div>`:""}
            </div>
        </div>
    </div>

    <div class="info-grid">
        <div class="info-card">
            <h3>Client</h3>
            <table>
                <tr><th>Nom</th><td>${a(t.client_name||"—")}</td></tr>
                <tr><th>Contact</th><td>${a(t.contact||"—")}</td></tr>
                <tr><th>Ville</th><td>${a(t.city||"—")}</td></tr>
            </table>
        </div>
        <div class="info-card">
            <h3>Chantier</h3>
            <table>
                <tr><th>Type</th><td>${a(t.chantier_type||"—")}</td></tr>
                <tr><th>Délai</th><td>${a(f(t.work_delay))}</td></tr>
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
            <tbody>${p||'<tr><td colspan="7" style="text-align:center;padding:12px;color:#94a3b8">Aucune ligne</td></tr>'}</tbody>
        </table>
    </div>

    <div class="bottom">
        <div class="totals">
            <table>
                <tr><td>Total HT</td><td>${o(c)}</td></tr>
                <tr><td>TVA 20%</td><td>${o(i)}</td></tr>
                <tr><td>Total TTC</td><td>${o(s)}</td></tr>
            </table>
        </div>
    </div>

    <div class="footer">
        <span>Document généré le ${new Date().toLocaleDateString("fr-FR")} — Autopilote</span>
        <span>Devis valable 30 jours — Merci de votre confiance</span>
    </div>
</div>
</body>
</html>`}function S(t){const e=window.open("","_blank","width=800,height=600");e&&(e.document.write(x(t)),e.document.close(),e.focus(),setTimeout(()=>e.print(),300))}function z(t){return(t.items?.length?t.items:[{type_travaux:t.type_travaux||"",designation:t.designation||"",consistance:t.consistance||"",unit:t.unit||"",quantity:t.quantity??"1",unit_price:t.unit_price??""}]).map(e=>({_key:++r,type_travaux:e.type_travaux||"",designation:e.designation||"",consistance:e.consistance||"",unit:e.unit||"",quantity:String(e.quantity??"1"),unit_price:e.unit_price!==void 0&&e.unit_price!==null?String(e.unit_price):""}))}export{h as C,y as S,v as T,m as U,D as a,_ as b,g as c,$ as d,w as e,f,k as l,z as m,T as n,S as o,l as p};
