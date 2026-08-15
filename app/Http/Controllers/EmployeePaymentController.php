<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeAdvance;
use App\Models\EmployeePayment;
use Illuminate\Http\Request;

class EmployeePaymentController extends Controller
{
    public function index()
    {
        $payments = EmployeePayment::with('employee')->latest('period_end')->paginate(15);

        return view('employee-payments.index', compact('payments'));
    }

    public function create()
    {
        $employees = Employee::where('status', 'actif')->orderBy('last_name')->get();

        return view('employee-payments.create', compact('employees'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'base_amount' => 'required|numeric|min:0',
            'bonuses' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $advancesDeducted = EmployeeAdvance::where('employee_id', $validated['employee_id'])
            ->where('status', 'en_cours')
            ->sum('amount');

        $netAmount = $validated['base_amount'] + ($validated['bonuses'] ?? 0) - $advancesDeducted;

        EmployeePayment::create([
            'employee_id' => $validated['employee_id'],
            'period_start' => $validated['period_start'],
            'period_end' => $validated['period_end'],
            'base_amount' => $validated['base_amount'],
            'advances_deducted' => $advancesDeducted,
            'bonuses' => $validated['bonuses'] ?? 0,
            'net_amount' => max(0, $netAmount),
            'status' => 'valide',
            'notes' => $validated['notes'] ?? null,
            'user_id' => auth()->id(),
        ]);

        EmployeeAdvance::where('employee_id', $validated['employee_id'])
            ->where('status', 'en_cours')
            ->update(['status' => 'deduite']);

        return redirect()->route('employee-payments.index')->with('success', 'Paiement personnel créé.');
    }

    public function destroy(EmployeePayment $employeePayment)
    {
        $employeePayment->delete();

        return redirect()->route('employee-payments.index')->with('success', 'Paiement supprimé.');
    }
}
