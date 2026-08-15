<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentApiController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Document::with(['chantier', 'user'])
                ->when($request->type, fn ($q, $t) => $q->where('type', $t))
                ->when($request->chantier_id, fn ($q, $id) => $q->where('chantier_id', $id))
                ->latest()->paginate(20)
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:contrat,plan,photo,facture,bon_commande,administratif,autre',
            'file' => 'required|file|max:10240',
            'chantier_id' => 'nullable|exists:chantiers,id',
        ]);

        $file = $request->file('file');
        $path = $file->store('documents', 'public');

        $document = Document::create([
            'title' => $request->title,
            'type' => $request->type,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'chantier_id' => $request->chantier_id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($document, 201);
    }

    public function download(Document $document)
    {
        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    public function destroy(Document $document)
    {
        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'Document supprimé']);
    }
}
