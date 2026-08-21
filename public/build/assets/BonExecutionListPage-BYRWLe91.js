import{r as c,a as y,j as t,F as w}from"./main-rDD9S3k-.js";import{f as N,a as m}from"./devisUtils-Bdh2_MXj.js";import{S as $}from"./clientAmountUtils-DvG9EDYp.js";import{S as T}from"./search-DS_lliSX.js";import{R as C}from"./refresh-cw-DzrnzWzm.js";import{P as D}from"./printer-k7-ZdvjG.js";/* empty css            */const A={date_from:"",date_to:"",client_name:"",city:""};function l(a){return String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function i(a){return(Number(a)||0).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})}function S(a){const s=(a.items||[]).map(r=>{const d=r.type_travaux?.trim();return`
<tr>
<td class="left">${d?`<span class="type-travaux-box">${l(d)}</span>`:"—"}</td>
<td class="left designation">${l(r.designation||"—")}</td>
<td>${l(r.consistance||"—")}</td>
<td>${l(r.unit||"—")}</td>
<td class="num">${r.quantity??1}</td>
<td class="num">${i(r.unit_price)}</td>
<td class="num strong"><span class="subtotal-box">${i(r.subtotal)}</span></td>
</tr>`}).join("");return`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Bon D'Execution ${l(a.reference)}</title>
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
            <p><strong>Réf :</strong> ${l(a.reference)}</p>
            <p><strong>Date :</strong> ${l(a.order_date)}</p>
        </div>
    </div>

    <div class="meta">
        <div><strong>DV N° :</strong> ${l(a.quote_reference||"—")}</div>
        <div><strong>Nom Client :</strong> ${l(a.client_name||"—")}</div>
        <div><strong>Type Travaux :</strong> ${l(a.type_travaux||"—")}</div>
        <div><strong>Ville :</strong> ${l(a.city||"—")}</div>
        <div><strong>Délai :</strong> ${l(N(a.work_delay))}</div>
        <div><strong>Règlement :</strong> ${l(a.reglement||"—")}</div>
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
        <tbody>${s||'<tr><td colspan="7" style="text-align:center;color:#94a3b8">Aucune ligne</td></tr>'}</tbody>
    </table>

    <div class="totals">
        <table>
            <tr><td>Montant HT</td><td>${i(a.subtotal)}</td></tr>
            <tr><td>TVA 20%</td><td>${i(a.tva)}</td></tr>
            <tr class="highlight"><td>Montant TTC</td><td>${i(a.total_ttc)}</td></tr>
            <tr><td>Avance</td><td>${i(a.avance)}</td></tr>
            <tr class="highlight"><td>Solde</td><td>${i(a.solde)}</td></tr>
        </table>
    </div>
</div>
</body>
</html>`}function j(a){const s=window.open("","_blank","width=800,height=600");s&&(s.document.write(S(a)),s.document.close(),s.focus(),setTimeout(()=>s.print(),300))}function h({label:a,children:s}){return t.jsxs("div",{children:[t.jsx("label",{className:"field-label",children:a}),s]})}const g="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-navy/30 focus:border-brand-navy";function k({title:a,onClick:s,icon:r,color:d="slate"}){const o={slate:"hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200",orange:"hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400"};return t.jsx("button",{type:"button",title:a,onClick:s,className:`p-1.5 rounded-lg text-slate-400 transition-colors ${o[d]}`,children:t.jsx(r,{className:"w-3.5 h-3.5",strokeWidth:2})})}function H(){const[a,s]=c.useState(A),[r,d]=c.useState([]),[o,b]=c.useState(!0),x=c.useCallback(()=>{b(!0);const e={all:1,...a};Object.keys(e).forEach(n=>{e[n]||delete e[n]}),y.get("/client-orders",{params:e}).then(n=>d(n.data.data??[])).catch(()=>d([])).finally(()=>b(!1))},[a]);c.useEffect(()=>{x()},[x]);const p=(e,n)=>s(v=>({...v,[e]:n})),f=async e=>{try{const n=await y.get(`/client-orders/${e.id}`);j(n.data)}catch{j(e)}},u=["Date","DV N°","Nom Client","Type Travaux","Ville","Délai","Règlement","Montant HT","TVA","Montant TTC","Avance","Solde","Actions"];return t.jsxs("div",{className:"space-y-4",children:[t.jsx("div",{className:"glass-card p-4 shadow-card border border-slate-200/60 dark:border-slate-700/60",children:t.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1.2fr_0.9fr_auto] gap-2.5 items-end",children:[t.jsx(h,{label:"Date du",children:t.jsx("input",{type:"date",value:a.date_from,onChange:e=>p("date_from",e.target.value),className:g})}),t.jsx(h,{label:"Date au",children:t.jsx("input",{type:"date",value:a.date_to,onChange:e=>p("date_to",e.target.value),className:g})}),t.jsx(h,{label:"Nom Client",children:t.jsx("input",{type:"text",value:a.client_name,onChange:e=>p("client_name",e.target.value),placeholder:"Rechercher client...",className:g})}),t.jsx(h,{label:"Ville",children:t.jsx("input",{type:"text",value:a.city,onChange:e=>p("city",e.target.value),placeholder:"Ville...",className:g})}),t.jsxs("button",{type:"button",onClick:x,className:"btn-secondary text-xs h-[34px] px-4 self-end",children:[t.jsx(T,{className:"w-3.5 h-3.5"})," Rechercher"]})]})}),t.jsxs("div",{className:"glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60",children:[t.jsxs("div",{className:"px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 border-b border-white/10 flex items-center justify-between",children:[t.jsx("h3",{className:"text-sm font-bold text-white uppercase tracking-wide",children:"État d'Exécution"}),t.jsx("button",{type:"button",onClick:x,disabled:o,className:"p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors",title:"Actualiser",children:t.jsx(C,{className:`w-4 h-4 ${o?"animate-spin":""}`})})]}),t.jsx("div",{className:"overflow-x-auto",children:t.jsxs("table",{className:"w-full text-sm min-w-[1400px]",children:[t.jsx("thead",{children:t.jsx("tr",{className:"bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700",children:u.map(e=>t.jsx("th",{className:"px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap text-center",children:e},e))})}),t.jsx("tbody",{className:"divide-y divide-slate-100 dark:divide-slate-800",children:o?[...Array(4)].map((e,n)=>t.jsx("tr",{children:u.map((v,_)=>t.jsx("td",{className:"px-3 py-3 text-center",children:t.jsx("div",{className:"h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[80px]"})},_))},n)):r.length?r.map(e=>t.jsxs("tr",{className:"hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition-colors",children:[t.jsx("td",{className:"px-3 py-2.5 text-center text-slate-600 dark:text-slate-300",children:e.order_date}),t.jsx("td",{className:"px-3 py-2.5 text-center font-mono text-xs font-semibold text-brand-navy dark:text-violet-400",children:e.quote_reference||"—"}),t.jsx("td",{className:"px-3 py-2.5 text-center font-medium text-slate-800 dark:text-white",children:e.client_name||"—"}),t.jsx("td",{className:"px-3 py-2.5 text-center",children:e.type_travaux?t.jsx("span",{className:"inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-brand-navy dark:text-blue-300",children:e.type_travaux}):"—"}),t.jsx("td",{className:"px-3 py-2.5 text-center",children:t.jsx("span",{className:"inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",children:e.city||"—"})}),t.jsx("td",{className:"px-3 py-2.5 text-center text-slate-600 dark:text-slate-300",children:N(e.work_delay)}),t.jsx("td",{className:"px-3 py-2.5 text-center text-slate-600 dark:text-slate-300",children:e.reglement||"—"}),t.jsx("td",{className:"px-3 py-2.5 text-center font-semibold tabular-nums text-brand-navy dark:text-violet-400",children:m(e.subtotal)}),t.jsx("td",{className:"px-3 py-2.5 text-center tabular-nums text-slate-600 dark:text-slate-300",children:m(e.tva)}),t.jsx("td",{className:"px-3 py-2.5 text-center font-bold tabular-nums text-brand-navy dark:text-violet-400",children:m(e.total_ttc)}),t.jsx("td",{className:"px-3 py-2.5 text-center tabular-nums text-emerald-700 dark:text-emerald-300",children:m(e.avance)}),t.jsx("td",{className:"px-3 py-2.5 text-center",children:t.jsx($,{value:e.solde})}),t.jsx("td",{className:"px-3 py-2.5",children:t.jsxs("div",{className:"flex items-center justify-center gap-0.5",children:[t.jsx(k,{title:"Imprimer",icon:D,color:"slate",onClick:()=>f(e)}),t.jsx(k,{title:"PDF",icon:w,color:"orange",onClick:()=>f(e)})]})})]},e.id)):t.jsx("tr",{children:t.jsx("td",{colSpan:u.length,className:"px-4 py-12 text-center text-slate-400",children:"Aucun bon d'exécution — validez un devis pour l'afficher ici"})})})]})})]})]})}export{H as default};
