<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (! Schema::hasColumn('employees', 'contract_type')) {
                $table->string('contract_type', 20)->nullable()->after('position');
            }
            if (! Schema::hasColumn('employees', 'echeance')) {
                $table->string('echeance', 20)->nullable()->after('monthly_salary');
            }
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (Schema::hasColumn('employees', 'contract_type')) {
                $table->dropColumn('contract_type');
            }
            if (Schema::hasColumn('employees', 'echeance')) {
                $table->dropColumn('echeance');
            }
        });
    }
};
