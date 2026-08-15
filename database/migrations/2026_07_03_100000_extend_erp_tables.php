<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('brand')->nullable()->after('name');
            $table->string('location')->nullable()->after('min_stock_alert');
            $table->decimal('purchase_price', 12, 2)->default(0)->after('unit_price');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('matricule')->nullable()->unique()->after('id');
            $table->text('address')->nullable()->after('phone');
            $table->string('photo')->nullable()->after('notes');
        });

        Schema::table('chantiers', function (Blueprint $table) {
            $table->boolean('archived')->default(false)->after('description');
        });

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->date('order_date');
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('chantier_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('total_ht', 14, 2)->default(0);
            $table->decimal('tva', 14, 2)->default(0);
            $table->decimal('total_ttc', 14, 2)->default(0);
            $table->enum('status', ['brouillon', 'en_attente', 'valide', 'livre', 'annule'])->default('brouillon');
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description');
            $table->decimal('quantity', 12, 3);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('tva_rate', 5, 2)->default(20);
            $table->decimal('total', 14, 2);
            $table->timestamps();
        });

        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_chantier_id')->nullable()->constrained('chantiers')->nullOnDelete();
            $table->foreignId('to_chantier_id')->nullable()->constrained('chantiers')->nullOnDelete();
            $table->decimal('quantity', 12, 3);
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->enum('category', ['salaires', 'transport', 'carburant', 'location', 'eau_electricite', 'sous_traitance', 'divers']);
            $table->foreignId('chantier_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 14, 2);
            $table->date('expense_date');
            $table->text('description')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('chantier_id')->nullable()->constrained()->nullOnDelete();
            $table->date('quote_date');
            $table->date('valid_until')->nullable();
            $table->decimal('total_ht', 14, 2)->default(0);
            $table->decimal('tva', 14, 2)->default(0);
            $table->decimal('total_ttc', 14, 2)->default(0);
            $table->enum('status', ['brouillon', 'envoye', 'accepte', 'refuse', 'expire'])->default('brouillon');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('quote_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->constrained()->cascadeOnDelete();
            $table->string('description');
            $table->decimal('quantity', 12, 3)->default(1);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total', 14, 2);
            $table->timestamps();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('type', ['contrat', 'plan', 'photo', 'facture', 'bon_commande', 'administratif', 'autre']);
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->nullableMorphs('documentable');
            $table->foreignId('chantier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('chantier_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'conge', 'retard'])->default('present');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->decimal('overtime_hours', 5, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['employee_id', 'date']);
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chantier_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->enum('priority', ['basse', 'normale', 'haute', 'urgente'])->default('normale');
            $table->enum('status', ['a_faire', 'en_cours', 'termine', 'en_retard'])->default('a_faire');
            $table->foreignId('assigned_to')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('quote_items');
        Schema::dropIfExists('quotes');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');

        Schema::table('chantiers', fn (Blueprint $t) => $t->dropColumn('archived'));
        Schema::table('employees', function (Blueprint $t) {
            $t->dropColumn(['matricule', 'address', 'photo']);
        });
        Schema::table('products', function (Blueprint $t) {
            $t->dropColumn(['brand', 'location', 'purchase_price']);
        });
    }
};
