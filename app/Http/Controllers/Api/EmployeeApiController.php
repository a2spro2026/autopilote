<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::query()
            ->when($request->filled('matricule'), fn ($q) => $q->where('matricule', 'like', '%'.$request->matricule.'%'))
            ->when($request->filled('nom'), function ($q) use ($request) {
                $s = $request->nom;
                $q->where(function ($w) use ($s) {
                    $w->where('first_name', 'like', "%{$s}%")
                        ->orWhere('last_name', 'like', "%{$s}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$s}%"]);
                });
            })
            ->when($request->search, function ($q, $s) {
                $q->where(function ($w) use ($s) {
                    $w->where('first_name', 'like', "%{$s}%")
                        ->orWhere('last_name', 'like', "%{$s}%")
                        ->orWhere('matricule', 'like', "%{$s}%");
                });
            })
            ->latest('hire_date')
            ->latest('id');

        if ($request->boolean('all')) {
            $rows = $query->get()->map(fn ($e) => $this->format($e));

            return response()->json([
                'data' => $rows,
                'meta' => [
                    'next_id' => $this->nextMatricule(),
                    'date' => now()->format('Y-m-d'),
                    'date_display' => now()->format('d/m/Y'),
                ],
            ]);
        }

        return response()->json($query->paginate(15)->through(fn ($e) => $this->format($e)));
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);

        if (empty($validated['matricule'])) {
            $validated['matricule'] = $this->nextMatricule();
        }
        if (empty($validated['hire_date'])) {
            $validated['hire_date'] = now()->toDateString();
        }
        if (empty($validated['status'])) {
            $validated['status'] = 'actif';
        }

        $employee = Employee::create($validated);

        return response()->json($this->format($employee), 201);
    }

    public function show(Employee $employee)
    {
        return response()->json($this->format($employee->load(['advances', 'payments', 'assignments.chantier'])));
    }

    public function update(Request $request, Employee $employee)
    {
        $employee->update($this->validated($request, true));

        return response()->json($this->format($employee->fresh()));
    }

    public function suspend(Employee $employee)
    {
        $employee->update([
            'status' => $employee->status === 'actif' ? 'inactif' : 'actif',
        ]);

        return response()->json($this->format($employee->fresh()));
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return response()->json(['message' => 'Employé supprimé']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $fullName = trim((string) $request->input('full_name', ''));
        if ($fullName !== '') {
            $parts = preg_split('/\s+/', $fullName, 2);
            $request->merge([
                'first_name' => $parts[0] ?? $fullName,
                'last_name' => $parts[1] ?? '',
            ]);
        }

        $rules = [
            'first_name' => ($partial ? 'sometimes' : 'required').'|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'matricule' => 'nullable|string|max:50|unique:employees,matricule'.($partial && $request->route('employee') ? ','.$request->route('employee')->id : ''),
            'cin' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'position' => 'nullable|string|max:100',
            'contract_type' => 'nullable|in:CDI,CDD,Journalier',
            'daily_rate' => 'nullable|numeric|min:0',
            'monthly_salary' => 'nullable|numeric|min:0',
            'remuneration' => 'nullable|numeric|min:0',
            'echeance' => 'nullable|in:Jour,Semaine,15jrs,Mois',
            'hire_date' => 'nullable|date',
            'status' => 'nullable|in:actif,inactif',
            'notes' => 'nullable|string|max:2000',
        ];

        $validated = $request->validate($rules);

        if (array_key_exists('remuneration', $validated)) {
            $amount = (float) ($validated['remuneration'] ?? 0);
            $validated['monthly_salary'] = $amount;
            if (($validated['contract_type'] ?? $request->input('contract_type')) === 'Journalier') {
                $validated['daily_rate'] = $amount;
            }
            unset($validated['remuneration']);
        }

        if (! array_key_exists('position', $validated) || $validated['position'] === null || $validated['position'] === '') {
            if (! $partial) {
                $validated['position'] = $validated['contract_type'] ?? 'Personnel';
            }
        }

        if (! array_key_exists('last_name', $validated) || $validated['last_name'] === null) {
            $validated['last_name'] = $validated['last_name'] ?? '';
        }

        return $validated;
    }

    private function nextMatricule(): string
    {
        $max = Employee::query()
            ->where('matricule', 'like', 'EMP-%')
            ->get(['matricule'])
            ->map(function ($e) {
                if (preg_match('/EMP-(\d+)/', (string) $e->matricule, $m)) {
                    return (int) $m[1];
                }

                return 0;
            })
            ->max() ?? 0;

        return 'EMP-'.str_pad((string) ($max + 1), 5, '0', STR_PAD_LEFT);
    }

    private function format(Employee $e): array
    {
        $remuneration = (float) ($e->monthly_salary ?: $e->daily_rate);

        return [
            'id' => $e->id,
            'matricule' => $e->matricule,
            'hire_date' => $e->hire_date?->format('d/m/Y'),
            'hire_date_raw' => $e->hire_date?->format('Y-m-d'),
            'full_name' => trim("{$e->first_name} {$e->last_name}"),
            'first_name' => $e->first_name,
            'last_name' => $e->last_name,
            'status' => $e->status ?: 'actif',
            'status_label' => ($e->status === 'inactif') ? 'Suspendu' : 'Actif',
            'contract_type' => $e->contract_type,
            'remuneration' => round($remuneration, 2),
            'monthly_salary' => round((float) $e->monthly_salary, 2),
            'daily_rate' => round((float) $e->daily_rate, 2),
            'echeance' => $e->echeance,
            'position' => $e->position,
            'phone' => $e->phone,
            'email' => $e->email,
            'cin' => $e->cin,
            'address' => $e->address,
            'notes' => $e->notes,
            'created_at' => $e->created_at?->format('d/m/Y'),
        ];
    }
}
