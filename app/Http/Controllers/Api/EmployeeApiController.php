<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeApiController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Employee::when($request->search, fn ($q, $s) => $q->where('first_name', 'like', "%{$s}%")->orWhere('last_name', 'like', "%{$s}%"))
                ->latest()->paginate(15)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'matricule' => 'nullable|string|unique:employees',
            'cin' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'email' => 'nullable|email',
            'position' => 'required|string',
            'daily_rate' => 'numeric|min:0',
            'monthly_salary' => 'numeric|min:0',
            'hire_date' => 'nullable|date',
            'status' => 'in:actif,inactif',
        ]);

        if (empty($validated['matricule'])) {
            $validated['matricule'] = 'EMP-'.str_pad(Employee::count() + 1, 5, '0', STR_PAD_LEFT);
        }

        return response()->json(Employee::create($validated), 201);
    }

    public function show(Employee $employee)
    {
        return response()->json($employee->load(['advances', 'payments', 'assignments.chantier']));
    }

    public function update(Request $request, Employee $employee)
    {
        $employee->update($request->validate([
            'first_name' => 'sometimes|string',
            'last_name' => 'sometimes|string',
            'position' => 'sometimes|string',
            'monthly_salary' => 'numeric|min:0',
            'status' => 'in:actif,inactif',
        ]));

        return response()->json($employee);
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return response()->json(['message' => 'Employé supprimé']);
    }
}
