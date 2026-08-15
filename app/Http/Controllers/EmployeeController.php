<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::latest()->paginate(15);

        return view('employees.index', compact('employees'));
    }

    public function create()
    {
        return view('employees.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'cin' => 'nullable|string|max:20|unique:employees',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'position' => 'required|string|max:100',
            'daily_rate' => 'required|numeric|min:0',
            'monthly_salary' => 'required|numeric|min:0',
            'hire_date' => 'nullable|date',
            'status' => 'required|in:actif,inactif',
            'notes' => 'nullable|string',
        ]);

        Employee::create($validated);

        return redirect()->route('employees.index')->with('success', 'Employé créé.');
    }

    public function show(Employee $employee)
    {
        $employee->load(['advances', 'payments', 'assignments.chantier']);

        return view('employees.show', compact('employee'));
    }

    public function edit(Employee $employee)
    {
        return view('employees.edit', compact('employee'));
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'cin' => 'nullable|string|max:20|unique:employees,cin,'.$employee->id,
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'position' => 'required|string|max:100',
            'daily_rate' => 'required|numeric|min:0',
            'monthly_salary' => 'required|numeric|min:0',
            'hire_date' => 'nullable|date',
            'status' => 'required|in:actif,inactif',
            'notes' => 'nullable|string',
        ]);

        $employee->update($validated);

        return redirect()->route('employees.index')->with('success', 'Employé mis à jour.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return redirect()->route('employees.index')->with('success', 'Employé supprimé.');
    }
}
