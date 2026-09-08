<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserApiController extends Controller
{
    private const LOGIN_STATUTS = [
        'administrateur' => 'Administrateur',
        'gerant' => 'Gérant',
        'commercial' => 'Commercial',
        'caisse' => 'Caisse',
        'facturation' => 'Facturation',
    ];

    public function index(Request $request)
    {
        $query = User::with('role')
            ->when($request->search, function ($q, $s) {
                $q->where(function ($inner) use ($s) {
                    $inner->where('name', 'like', "%{$s}%")
                        ->orWhere('email', 'like', "%{$s}%")
                        ->orWhere('phone', 'like', "%{$s}%");
                });
            })
            ->orderBy('id');

        $users = $request->boolean('all')
            ? $query->get()->map(fn ($u) => $this->formatUser($u))
            : $query->paginate(50)->through(fn ($u) => $this->formatUser($u));

        return response()->json([
            'data' => $request->boolean('all') ? $users : $users->items(),
            'meta' => [
                'next_id' => (int) (User::max('id') ?? 0) + 1,
                'statuts' => collect(self::LOGIN_STATUTS)
                    ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
                    ->values(),
            ],
            ...($request->boolean('all') ? [] : [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $roleId = $this->roleIdFromStatut($validated['statut'] ?? null);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
            'role_id' => $roleId,
            'is_active' => array_key_exists('is_active', $validated)
                ? (bool) $validated['is_active']
                : true,
        ]);

        return response()->json($this->formatUser($user->load('role')), 201);
    }

    public function show(User $user)
    {
        return response()->json($this->formatUser($user->load('role')));
    }

    public function update(Request $request, User $user)
    {
        $validated = $this->validated($request, $user->id);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
        ];

        $passwordChanged = false;
        $deactivated = false;

        if (array_key_exists('is_active', $validated)) {
            $data['is_active'] = (bool) $validated['is_active'];
            $deactivated = $user->is_active && ! $data['is_active'];
        }

        if (! empty($validated['password'])) {
            $data['password'] = $validated['password'];
            $passwordChanged = true;
        }

        if (! empty($validated['statut'])) {
            $data['role_id'] = $this->roleIdFromStatut($validated['statut']);
        }

        $user->update($data);

        // Nouveau mot de passe ou suspension → coupe l’accès immédiat (sessions API)
        if ($passwordChanged || $deactivated) {
            $user->tokens()->delete();
        }

        return response()->json($this->formatUser($user->fresh()->load('role')));
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }

    public function suspend(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas suspendre votre propre compte.'], 422);
        }

        $user->update(['is_active' => ! $user->is_active']);

        if (! $user->is_active) {
            $user->tokens()->delete();
        }

        return response()->json($this->formatUser($user->fresh()->load('role')));
    }

    private function validated(Request $request, ?int $userId = null): array
    {
        $creating = $userId === null;

        return $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'phone' => 'nullable|string|max:40',
            'password' => ($creating ? 'required' : 'nullable').'|string|min:6|max:255',
            'is_active' => 'nullable|boolean',
            'statut' => ($creating ? 'required' : 'nullable').'|in:'.implode(',', array_keys(self::LOGIN_STATUTS)),
        ]);
    }

    private function roleIdFromStatut(?string $statut): ?int
    {
        $slug = $statut && isset(self::LOGIN_STATUTS[$statut])
            ? $statut
            : 'commercial';

        return Role::where('slug', $slug)->value('id')
            ?? Role::where('slug', 'administrateur')->value('id');
    }

    private function formatUser(User $user): array
    {
        $slug = $user->role?->slug;
        $statutLabel = self::LOGIN_STATUTS[$slug] ?? ($user->role?->name ?: '—');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'contact' => $user->phone,
            'phone' => $user->phone,
            'email' => $user->email,
            'login' => $user->email,
            'password_mask' => '••••••••',
            'statut' => $statutLabel,
            'statut_slug' => $slug && isset(self::LOGIN_STATUTS[$slug]) ? $slug : '',
            'etat' => $user->is_active ? 'Actif' : 'Suspendue',
            'is_active' => (bool) $user->is_active,
            'role_id' => $user->role_id,
            'role' => $user->role?->name,
        ];
    }
}
