<?php

namespace App\Http\Controllers;

use App\Models\ClientInvoice;
use App\Models\EmployeePayment;
use App\Models\Payment;
use App\Models\SupplierInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with('user')->latest('payment_date')->paginate(15);

        return view('payments.index', compact('payments'));
    }

    public function create()
    {
        $clientInvoices = ClientInvoice::whereIn('status', ['en_attente', 'partielle', 'en_retard'])
            ->with('client')->orderBy('due_date')->get();
        $supplierInvoices = SupplierInvoice::whereIn('status', ['en_attente', 'partielle', 'en_retard'])
            ->with('supplier')->orderBy('due_date')->get();
        $employeePayments = EmployeePayment::where('status', 'valide')->with('employee')->get();

        return view('payments.create', compact('clientInvoices', 'supplierInvoices', 'employeePayments'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:client,fournisseur,personnel',
            'payable_id' => 'required|integer',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'method' => 'required|in:especes,cheque,virement,carte',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $payableClass = match ($validated['type']) {
            'client' => ClientInvoice::class,
            'fournisseur' => SupplierInvoice::class,
            'personnel' => EmployeePayment::class,
        };

        DB::transaction(function () use ($validated, $payableClass) {
            $payable = $payableClass::findOrFail($validated['payable_id']);

            Payment::create([
                'type' => $validated['type'],
                'payable_type' => $payableClass,
                'payable_id' => $payable->id,
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'method' => $validated['method'],
                'reference' => $validated['reference'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'user_id' => auth()->id(),
            ]);

            if ($payable instanceof ClientInvoice || $payable instanceof SupplierInvoice) {
                $payable->amount_paid += $validated['amount'];
                $remaining = $payable->total_ttc - $payable->amount_paid;

                if ($remaining <= 0) {
                    $payable->status = 'payee';
                } elseif ($payable->amount_paid > 0) {
                    $payable->status = 'partielle';
                }

                $payable->save();
            }

            if ($payable instanceof EmployeePayment) {
                $payable->update(['status' => 'paye', 'payment_date' => $validated['payment_date']]);
            }
        });

        return redirect()->route('payments.index')->with('success', 'Règlement enregistré.');
    }

    public function show(Payment $payment)
    {
        $payment->load(['payable', 'user']);

        return view('payments.show', compact('payment'));
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->route('payments.index')->with('success', 'Règlement supprimé.');
    }
}
