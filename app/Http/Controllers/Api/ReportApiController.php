<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chantier;
use App\Models\ClientInvoice;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ReportApiController extends Controller
{
    public function financial()
    {
        $chantiers = Chantier::with('client')->get()->map(function ($c) {
            $recettes = ClientInvoice::where('chantier_id', $c->id)->sum('total_ttc');
            $depenses = Expense::where('chantier_id', $c->id)->sum('amount');

            return [
                'id' => $c->id,
                'name' => $c->name,
                'budget' => $c->budget,
                'recettes' => $recettes,
                'depenses' => $depenses,
                'benefice' => $recettes - $depenses,
                'rentabilite' => $c->budget > 0 ? round((($recettes - $depenses) / $c->budget) * 100, 1) : 0,
            ];
        });

        return response()->json(['chantiers' => $chantiers]);
    }

    public function export(Request $request, string $type)
    {
        $format = $request->get('format', 'csv');
        $data = Chantier::with('client')->get();

        if ($format === 'csv') {
            $csv = "Référence,Nom,Client,Ville,Budget,Statut,Progression\n";
            foreach ($data as $c) {
                $csv .= "{$c->reference},{$c->name},{$c->client->name},{$c->city},{$c->budget},{$c->status},{$c->progress}%\n";
            }

            return Response::make($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="chantiers-'.date('Y-m-d').'.csv"',
            ]);
        }

        return response()->json(['message' => 'Format non supporté'], 400);
    }
}
