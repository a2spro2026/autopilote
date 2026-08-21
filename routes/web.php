<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect('/app/login'));
Route::redirect('/login', '/app/login');

Route::view('/app/{any?}', 'spa')->where('any', '.*')->name('spa');

require __DIR__.'/auth.php';
