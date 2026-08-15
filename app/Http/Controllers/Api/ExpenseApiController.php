<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseApiController extends Controller
{
    public function index()
    {
        return response()->json(Expense::with('chantier')->latest('expense_date')->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|in:salaires,transport,carburant,location,eau_electricite,sous_traitance,divers',
            'chantier_id' => 'nullable|exists:chantiers,id',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $validated['reference'] = 'CHG-'.now()->format('YmdHis');
        $validated['user_id'] = $request->user()->id;

        return response()->json(Expense::create($validated), 201);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json(['message' => 'Charge supprimée']);
    }
}
