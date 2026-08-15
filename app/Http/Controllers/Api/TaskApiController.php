<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskApiController extends Controller
{
    public function index()
    {
        return response()->json(Task::with(['chantier', 'assignee'])->latest()->paginate(20));
    }

    public function overdue()
    {
        return response()->json(
            Task::with(['chantier', 'assignee'])
                ->where(function ($q) {
                    $q->where('status', 'en_retard')
                        ->orWhere(function ($q) {
                            $q->whereIn('status', ['a_faire', 'en_cours'])->where('due_date', '<', now());
                        });
                })->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'chantier_id' => 'required|exists:chantiers,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'in:basse,normale,haute,urgente',
            'assigned_to' => 'nullable|exists:employees,id',
        ]);

        return response()->json(Task::create($validated), 201);
    }

    public function update(Request $request, Task $task)
    {
        $task->update($request->validate([
            'title' => 'sometimes|string',
            'status' => 'in:a_faire,en_cours,termine,en_retard',
            'priority' => 'in:basse,normale,haute,urgente',
        ]));

        return response()->json($task->load(['chantier', 'assignee']));
    }
}
