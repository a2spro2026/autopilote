<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientInvoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InvoicePaymentApiController extends Controller
{
    private const METHODS = ['especes', 'cheque', 'virement', 'carte'];

    public function index(Request $request)
    {
        $query = Payment::query()
            ->where('type', 'client')
            ->where('payable_type', ClientInvoice::class)
            ->with(['payable.client', 'user']);

        if ($request->filled('reference')) {
            $value = $request->string('reference')->toString();
            $query->where(function ($q) use ($value) {
                $q->where('reference', 'like', "%{$value}%")
                    ->orWhereHasMorph('payable', [ClientInvoice::class], fn ($invoice) => $invoice->where('reference', 'like', "%{$value}%"));
            });
        }
        if ($request->filled('method')) {
            $query->where('method', $request->method);
        }
        if ($request->filled('client_id')) {
            $clientId = $request->integer('client_id');
            $query->whereHasMorph('payable', [ClientInvoice::class], fn ($invoice) => $invoice->where('client_id', $clientId));
        }
        if ($request->filled('month') && preg_match('/^\d{4}-\d{2}$/', $request->month)) {
            [$year, $month] = explode('-', $request->month);
            $query->whereYear('payment_date', $year)->whereMonth('payment_date', $month);
        }

        $payments = $query->latest('payment_date')->latest('id')->get();
        $base = Payment::query()
            ->where('type', 'client')
            ->where('payable_type', ClientInvoice::class);

        return response()->json([
            'data' => $payments->map(fn (Payment $payment) => $this->formatPayment($payment))->values(),
            'meta' => [
                'count' => (clone $base)->count(),
                'total_paid' => number_format((float) (clone $base)->sum('amount'), 2, '.', ''),
                'invoice_total' => number_format((float) ClientInvoice::where('status', '!=', 'annulee')->sum('total_ttc'), 2, '.', ''),
                'remaining_total' => number_format((float) ClientInvoice::where('status', '!=', 'annulee')
                    ->selectRaw('COALESCE(SUM(total_ttc - amount_paid), 0) as remaining')->value('remaining'), 2, '.', ''),
            ],
        ]);
    }

    public function invoices(Request $request)
    {
        $query = ClientInvoice::with(['client', 'chantier'])
            ->where('status', '!=', 'annulee');

        if (! $request->boolean('all')) {
            $query->whereColumn('amount_paid', '<', 'total_ttc');
        }

        return response()->json([
            'data' => $query->latest('invoice_date')->latest('id')->get()
                ->map(fn (ClientInvoice $invoice) => $this->formatInvoice($invoice))
                ->values(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);

        $payment = DB::transaction(function () use ($validated, $request) {
            $invoice = ClientInvoice::lockForUpdate()->findOrFail($validated['invoice_id']);
            $this->assertAmountAllowed($invoice, (float) $validated['amount']);

            $payment = Payment::create([
                'type' => 'client',
                'payable_type' => ClientInvoice::class,
                'payable_id' => $invoice->id,
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'method' => $validated['method'],
                'reference' => $validated['reference'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'user_id' => $request->user()?->id,
            ]);

            $this->applyAmount($invoice, (float) $validated['amount']);

            return $payment->load(['payable.client', 'user']);
        });

        return response()->json([
            'message' => 'Règlement de facture enregistré',
            'data' => $this->formatPayment($payment),
        ], 201);
    }

    public function update(Request $request, Payment $invoicePayment)
    {
        $this->assertInvoicePayment($invoicePayment);
        $validated = $this->validated($request);

        $payment = DB::transaction(function () use ($validated, $invoicePayment) {
            $oldInvoice = ClientInvoice::lockForUpdate()->findOrFail($invoicePayment->payable_id);
            $newInvoice = (int) $validated['invoice_id'] === $oldInvoice->id
                ? $oldInvoice
                : ClientInvoice::lockForUpdate()->findOrFail($validated['invoice_id']);

            $this->applyAmount($oldInvoice, -((float) $invoicePayment->amount));
            $this->assertAmountAllowed($newInvoice, (float) $validated['amount']);

            $invoicePayment->update([
                'payable_id' => $newInvoice->id,
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'method' => $validated['method'],
                'reference' => $validated['reference'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            $this->applyAmount($newInvoice, (float) $validated['amount']);

            return $invoicePayment->fresh(['payable.client', 'user']);
        });

        return response()->json([
            'message' => 'Règlement de facture modifié',
            'data' => $this->formatPayment($payment),
        ]);
    }

    public function destroy(Payment $invoicePayment)
    {
        $this->assertInvoicePayment($invoicePayment);

        DB::transaction(function () use ($invoicePayment) {
            $invoice = ClientInvoice::lockForUpdate()->findOrFail($invoicePayment->payable_id);
            $this->applyAmount($invoice, -((float) $invoicePayment->amount));
            $invoicePayment->delete();
        });

        return response()->json(['message' => 'Règlement de facture supprimé']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'invoice_id' => 'required|exists:client_invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'method' => 'required|in:'.implode(',', self::METHODS),
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);
    }

    private function assertInvoicePayment(Payment $payment): void
    {
        abort_unless($payment->type === 'client' && $payment->payable_type === ClientInvoice::class, 404);
    }

    private function assertAmountAllowed(ClientInvoice $invoice, float $amount): void
    {
        if ($invoice->status === 'annulee') {
            throw ValidationException::withMessages(['invoice_id' => 'Cette facture est annulée.']);
        }

        $remaining = round(max((float) $invoice->total_ttc - (float) $invoice->amount_paid, 0), 2);
        if (round($amount, 2) > $remaining + 0.009) {
            throw ValidationException::withMessages([
                'amount' => 'Le montant dépasse le solde de la facture ('.number_format($remaining, 2, ',', ' ').').',
            ]);
        }
    }

    private function applyAmount(ClientInvoice $invoice, float $amount): void
    {
        $paid = round(max((float) $invoice->amount_paid + $amount, 0), 2);
        $total = round((float) $invoice->total_ttc, 2);

        $invoice->update([
            'amount_paid' => $paid,
            'status' => $paid + 0.009 >= $total ? 'payee' : ($paid > 0 ? 'partielle' : 'en_attente'),
        ]);
    }

    private function formatPayment(Payment $payment): array
    {
        /** @var ClientInvoice|null $invoice */
        $invoice = $payment->payable;

        return [
            'id' => $payment->id,
            'code' => 'RFV-'.str_pad((string) $payment->id, 5, '0', STR_PAD_LEFT),
            'payment_date' => $payment->payment_date?->format('Y-m-d'),
            'invoice_id' => $invoice?->id,
            'invoice_reference' => $invoice?->reference,
            'client_id' => $invoice?->client_id,
            'client_name' => $invoice?->client?->name,
            'amount' => number_format((float) $payment->amount, 2, '.', ''),
            'method' => $payment->method,
            'reference' => $payment->reference,
            'notes' => $payment->notes,
            'invoice_total' => number_format((float) ($invoice?->total_ttc ?? 0), 2, '.', ''),
            'invoice_paid' => number_format((float) ($invoice?->amount_paid ?? 0), 2, '.', ''),
            'invoice_remaining' => number_format(max((float) ($invoice?->total_ttc ?? 0) - (float) ($invoice?->amount_paid ?? 0), 0), 2, '.', ''),
        ];
    }

    private function formatInvoice(ClientInvoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'reference' => $invoice->reference,
            'invoice_date' => $invoice->invoice_date?->format('Y-m-d'),
            'client_id' => $invoice->client_id,
            'client_name' => $invoice->client?->name,
            'chantier' => $invoice->chantier?->name,
            'total_ttc' => number_format((float) $invoice->total_ttc, 2, '.', ''),
            'amount_paid' => number_format((float) $invoice->amount_paid, 2, '.', ''),
            'remaining' => number_format(max((float) $invoice->total_ttc - (float) $invoice->amount_paid, 0), 2, '.', ''),
            'status' => $invoice->status,
        ];
    }
}
