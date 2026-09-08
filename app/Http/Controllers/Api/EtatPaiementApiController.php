<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeMonthPayment;
use Illuminate\Http\Request;

class EtatPaiementApiController extends Controller
{
    public function index(Request $request)
    {
        $year = (int) ($request->input('year') ?: now()->year);

        $employees = Employee::query()
            ->when($request->filled('matricule'), fn ($q) => $q->where('matricule', 'like', '%'.$request->matricule.'%'))
            ->when($request->filled('nom'), function ($q) use ($request) {
                $s = $request->nom;
                $q->where(function ($w) use ($s) {
                    $w->where('first_name', 'like', "%{$s}%")
                        ->orWhere('last_name', 'like', "%{$s}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$s}%"]);
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $payments = EmployeeMonthPayment::query()
            ->where('year', $year)
            ->whereIn('employee_id', $employees->pluck('id'))
            ->get()
            ->groupBy('employee_id');

        $rows = $employees->map(function (Employee $e) use ($payments, $year) {
            $salary = round((float) ($e->monthly_salary ?: $e->daily_rate), 2);
            $months = array_fill(1, 12, false);
            foreach ($payments->get($e->id, collect()) as $p) {
                if ($p->month >= 1 && $p->month <= 12) {
                    $months[$p->month] = (bool) $p->paid;
                }
            }
            $paidCount = collect($months)->filter()->count();

            return [
                'id' => $e->id,
                'date' => $e->hire_date?->format('d/m/Y'),
                'matricule' => $e->matricule,
                'full_name' => trim("{$e->first_name} {$e->last_name}"),
                'salaire' => $salary,
                'year' => $year,
                'months' => $months,
                'paid_count' => $paidCount,
                'total' => round($salary * $paidCount, 2),
            ];
        })->values();

        return response()->json([
            'data' => $rows,
            'meta' => [
                'year' => $year,
                'nbr_personnel' => $rows->count(),
                'total_salaires' => round((float) $rows->sum('salaire'), 2),
            ],
        ]);
    }

    public function toggle(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
            'month' => 'required|integer|min:1|max:12',
            'paid' => 'required|boolean',
        ]);

        $row = EmployeeMonthPayment::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'year' => $validated['year'],
                'month' => $validated['month'],
            ],
            ['paid' => $validated['paid']],
        );

        return response()->json([
            'employee_id' => $employee->id,
            'year' => $row->year,
            'month' => $row->month,
            'paid' => (bool) $row->paid,
        ]);
    }
}
