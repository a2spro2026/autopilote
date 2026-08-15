<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('contact')->nullable()->after('client_id');
            $table->string('city')->nullable()->after('contact');
            $table->string('chantier_type', 20)->nullable()->after('city');
            $table->decimal('budget', 14, 2)->default(0)->after('chantier_type');
            $table->string('work_delay')->nullable()->after('budget');
            $table->string('designation')->nullable()->after('work_delay');
            $table->string('consistance', 10)->nullable()->after('designation');
            $table->string('unit', 20)->nullable()->after('consistance');
            $table->decimal('unit_price', 12, 2)->default(0)->after('unit');
            $table->decimal('subtotal', 14, 2)->default(0)->after('unit_price');
            $table->timestamp('sent_at')->nullable()->after('notes');
            $table->unsignedBigInteger('client_order_id')->nullable()->after('sent_at');
        });

        Schema::create('client_orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('quote_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->date('order_date');
            $table->string('contact')->nullable();
            $table->string('city')->nullable();
            $table->string('chantier_type', 20)->nullable();
            $table->decimal('budget', 14, 2)->default(0);
            $table->string('work_delay')->nullable();
            $table->string('designation')->nullable();
            $table->string('consistance', 10)->nullable();
            $table->string('unit', 20)->nullable();
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('total_ht', 14, 2)->default(0);
            $table->decimal('tva', 14, 2)->default(0);
            $table->decimal('total_ttc', 14, 2)->default(0);
            $table->enum('status', ['en_attente', 'en_cours', 'livre', 'annule'])->default('en_attente');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('quotes', function (Blueprint $table) {
            $table->foreign('client_order_id')->references('id')->on('client_orders')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropForeign(['client_order_id']);
            $table->dropColumn([
                'contact', 'city', 'chantier_type', 'budget', 'work_delay',
                'designation', 'consistance', 'unit', 'unit_price', 'subtotal',
                'sent_at', 'client_order_id',
            ]);
        });

        Schema::dropIfExists('client_orders');
    }
};
