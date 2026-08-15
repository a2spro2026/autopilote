<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\ClientInvoice;
use App\Models\Product;
use App\Models\SupplierInvoice;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $monthStart = now()->startOfMonth();
        $yearStart = now()->startOfYear();

        $ventesMois = ClientInvoice::where('invoice_date', '>=', $monthStart)
            ->whereIn('status', ['en_attente', 'partielle', 'payee', 'en_retard'])
            ->sum('total_ttc');

        $ventesMoisPrecedent = ClientInvoice::whereBetween('invoice_date', [
            now()->subMonth()->startOfMonth(),
            now()->subMonth()->endOfMonth(),
        ])->sum('total_ttc');

        $ventesEvolution = $ventesMoisPrecedent > 0
            ? round((($ventesMois - $ventesMoisPrecedent) / $ventesMoisPrecedent) * 100, 1)
            : 0;

        $stockTotal = Product::where('status', 'actif')
            ->selectRaw('SUM(quantity_in_stock * unit_price) as total, COUNT(*) as count')
            ->first();

        $facturesMois = ClientInvoice::where('invoice_date', '>=', $monthStart)->count();
        $facturesMontant = ClientInvoice::where('invoice_date', '>=', $monthStart)->sum('total_ttc');

        $chantiersEnCours = Chantier::where('status', 'en_cours')->count();
        $chantiersEnRetard = Chantier::where('status', 'en_cours')
            ->where('end_date', '<', now())
            ->where('progress', '<', 100)
            ->count();

        $caAnnee = ClientInvoice::where('invoice_date', '>=', $yearStart)
            ->whereIn('status', ['en_attente', 'partielle', 'payee', 'en_retard'])
            ->sum('total_ttc');

        $chantiers = Chantier::with('client')
            ->where('status', 'en_cours')
            ->orderByDesc('progress')
            ->limit(5)
            ->get();

        $recentInvoices = ClientInvoice::with('client')
            ->latest('invoice_date')
            ->limit(4)
            ->get();

        $lowStockProducts = Product::whereColumn('quantity_in_stock', '<=', 'min_stock_alert')
            ->where('status', 'actif')
            ->limit(3)
            ->get();

        $overdueInvoices = ClientInvoice::where('status', 'en_retard')->count()
            + SupplierInvoice::where('status', 'en_retard')->count();

        $salesByMonth = ClientInvoice::select(
            DB::raw('MONTH(invoice_date) as month'),
            DB::raw('SUM(total_ttc) as total')
        )
            ->whereYear('invoice_date', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        return view('dashboard.index', compact(
            'ventesMois', 'ventesEvolution', 'stockTotal', 'facturesMois', 'facturesMontant',
            'chantiersEnCours', 'chantiersEnRetard', 'caAnnee', 'chantiers',
            'recentInvoices', 'lowStockProducts', 'overdueInvoices', 'salesByMonth'
        ));
    }
}
