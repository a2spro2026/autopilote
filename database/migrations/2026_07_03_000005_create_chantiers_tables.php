<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chantiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('reference')->unique();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('budget', 14, 2)->default(0);
            $table->enum('status', ['planifie', 'en_cours', 'suspendu', 'termine', 'annule'])->default('planifie');
            $table->unsignedTinyInteger('progress')->default(0);
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('chantier_besoins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chantier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description')->nullable();
            $table->decimal('quantity_needed', 12, 3);
            $table->decimal('quantity_allocated', 12, 3)->default(0);
            $table->enum('status', ['en_attente', 'commande', 'livre', 'annule'])->default('en_attente');
            $table->date('needed_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('chantier_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chantier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('role')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('chantier_id')->nullable()->after('reference_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('chantier_id');
        });

        Schema::dropIfExists('chantier_assignments');
        Schema::dropIfExists('chantier_besoins');
        Schema::dropIfExists('chantiers');
    }
};
