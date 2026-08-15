<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\ChantierAssignment;
use App\Models\Employee;
use Illuminate\Http\Request;

class ChantierAssignmentController extends Controller
{
    public function store(Request $request, Chantier $chantier)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'role' => 'nullable|string|max:100',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        $chantier->assignments()->create($validated);

        return back()->with('success', 'Employé affecté au chantier.');
    }

    public function destroy(Chantier $chantier, ChantierAssignment $chantier_assignment)
    {
        $chantier_assignment->delete();

        return back()->with('success', 'Affectation supprimée.');
    }
}
