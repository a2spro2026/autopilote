<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeAdvance;
use Illuminate\Http\Request;

class EmployeeAdvanceController extends Controller
{
    public function index()
    {
        $advances = EmployeeAdvance::with('employee')->latest('advance_date')->paginate(15);

        return view('employee-advances.index', compact('advances'));
    }

    public function create()
    {
        $employees = Employee::where('status', 'actif')->orderBy('last_name')->get();

        return view('employee-advances.create', compact('employees'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0.01',
            'advance_date' => 'required|date',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        EmployeeAdvance::create([
            ...$validated,
            'status' => 'en_cours',
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('employee-advances.index')->with('success', 'Avance enregistrée.');
    }

    public function destroy(EmployeeAdvance $employeeAdvance)
    {
        $employeeAdvance->delete();

        return redirect()->route('employee-advances.index')->with('success', 'Avance supprimée.');
    }
}
