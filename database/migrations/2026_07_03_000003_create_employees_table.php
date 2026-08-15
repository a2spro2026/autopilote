<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('cin')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('position');
            $table->decimal('daily_rate', 12, 2)->default(0);
            $table->decimal('monthly_salary', 12, 2)->default(0);
            $table->date('hire_date')->nullable();
            $table->enum('status', ['actif', 'inactif'])->default('actif');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
