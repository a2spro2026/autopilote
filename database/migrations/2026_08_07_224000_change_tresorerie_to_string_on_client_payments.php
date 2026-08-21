<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('client_payments', 'tresorerie')) {
            return;
        }

        try {
            DB::statement('ALTER TABLE client_payments MODIFY tresorerie VARCHAR(255) NULL');
        } catch (\Throwable $e) {
            // SQLite / already string
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('client_payments', 'tresorerie')) {
            return;
        }

        try {
            DB::statement('ALTER TABLE client_payments MODIFY tresorerie DECIMAL(14,2) NULL');
        } catch (\Throwable $e) {
            // ignore
        }
    }
};
