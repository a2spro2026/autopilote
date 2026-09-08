<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('products', 'code_barre')) {
            return;
        }

        DB::statement('ALTER TABLE products MODIFY code_barre VARCHAR(500) NULL');
    }

    public function down(): void
    {
        if (! Schema::hasColumn('products', 'code_barre')) {
            return;
        }

        DB::statement('ALTER TABLE products MODIFY code_barre VARCHAR(100) NULL');
    }
};
