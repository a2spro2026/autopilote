<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClientApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query()
            ->when($request->search, function ($q, $s) {
                $q->where(function ($inner) use ($s) {
                    $inner->where('name', 'like', "%{$s}%")
                        ->orWhere('phone', 'like', "%{$s}%")
                        ->orWhere('email', 'like', "%{$s}%");
                    if (preg_match('/^(CR-?)?(\d+)$/i', trim($s), $m)) {
                        $inner->orWhere('id', (int) $m[2]);
                    }
                });
            })
            ->latest();

        $clients = $request->boolean('all')
            ? $query->get()->map(fn ($c) => $this->formatClient($c))
            : $query->paginate(15)->through(fn ($c) => $this->formatClient($c));

        return response()->json([
            'data' => $request->boolean('all') ? $clients : $clients->items(),
            'meta' => [
                'next_id' => $this->nextClientCode(),
                'date' => now()->format('d/m/Y'),
            ],
            ...($request->boolean('all') ? [] : [
                'current_page' => $clients->currentPage(),
                'last_page' => $clients->lastPage(),
                'total' => $clients->total(),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);

        $client = Client::create([
            ...$validated,
            'budget' => $validated['budget'] ?? 0,
            'status' => $validated['status'] ?? 'actif',
        ]);

        return response()->json($this->formatClient($client), 201);
    }

    public function show(Client $client)
    {
        return response()->json($this->formatClient($client->load(['chantiers', 'invoices'])));
    }

    public function update(Request $request, Client $client)
    {
        $validated = $this->validated($request, true);

        if (array_key_exists('latitude', $validated) || array_key_exists('longitude', $validated)) {
            $lat = array_key_exists('latitude', $validated) ? $validated['latitude'] : $client->latitude;
            $lng = array_key_exists('longitude', $validated) ? $validated['longitude'] : $client->longitude;
            if ($lat !== null && $lng !== null) {
                $validated['located_at'] = now();
            } elseif ($lat === null || $lng === null) {
                $validated['located_at'] = null;
            }
        }

        $client->update($validated);

        return response()->json($this->formatClient($client->fresh()));
    }

    public function destroy(Client $client)
    {
        if ($client->photo_path) {
            Storage::disk('public')->delete($client->photo_path);
        }

        $client->delete();

        return response()->json(['message' => 'Client supprimé']);
    }

    public function locate(Request $request, Client $client)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $client->update([
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'located_at' => now(),
        ]);

        return response()->json($this->formatClient($client->fresh()));
    }

    public function photo(Request $request, Client $client)
    {
        $request->validate([
            'photo' => 'required|image|max:8192',
        ]);

        if ($client->photo_path) {
            Storage::disk('public')->delete($client->photo_path);
        }

        $path = $request->file('photo')->store('clients', 'public');

        $client->update([
            'photo_path' => $path,
        ]);

        return response()->json($this->formatClient($client->fresh()));
    }

    private function validated(Request $request, bool $partial = false): array
    {
        return $request->validate([
            'name' => ($partial ? 'sometimes' : 'required').'|string|max:255',
            'contact_person' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'ice' => 'nullable|string',
            'chantier_type' => 'nullable|in:Rev,Entr,Pro',
            'reglement' => 'nullable|in:Esp,Chq,Eff,Vir,Vers',
            'chantier_address' => 'nullable|string',
            'budget' => 'nullable|numeric|min:0',
            'work_delay' => 'nullable|string|max:100',
            'status' => 'in:actif,inactif',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);
    }

    private function nextClientCode(): string
    {
        $next = (Client::max('id') ?? 0) + 1;

        return 'CR-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    private function formatClient(Client $client): array
    {
        return [
            'id' => $client->id,
            'code' => $client->code,
            'name' => $client->name,
            'contact_person' => $client->contact_person,
            'contact' => $client->phone ?: $client->contact_person,
            'email' => $client->email,
            'phone' => $client->phone,
            'address' => $client->address,
            'city' => $client->city,
            'latitude' => $client->latitude !== null ? (float) $client->latitude : null,
            'longitude' => $client->longitude !== null ? (float) $client->longitude : null,
            'located_at' => $client->located_at?->format('d/m/Y H:i'),
            'photo_url' => $client->photo_path ? '/storage/'.$client->photo_path : null,
            'is_located' => $client->latitude !== null && $client->longitude !== null,
            'chantier_type' => $client->chantier_type,
            'reglement' => $client->reglement,
            'chantier_address' => $client->chantier_address,
            'budget' => round((float) $client->budget, 2),
            'initial_balance' => number_format((float) $client->budget, 2, '.', ''),
            'work_delay' => $client->work_delay,
            'echeance' => $client->work_delay,
            'status' => $client->status,
            'created_at' => $client->created_at?->format('d/m/Y'),
        ];
    }
}
