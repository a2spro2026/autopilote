<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('chantier_type', 20)->nullable()->after('city');
            $table->string('reglement', 10)->nullable()->after('chantier_type');
            $table->text('chantier_address')->nullable()->after('reglement');
            $table->decimal('budget', 14, 2)->default(0)->after('chantier_address');
            $table->string('work_delay')->nullable()->after('budget');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['chantier_type', 'reglement', 'chantier_address', 'budget', 'work_delay']);
        });
    }
};
