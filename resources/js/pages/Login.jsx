import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginBrandLogo } from '../components/LoginBrand';

const fieldBase =
    'relative rounded-xl border overflow-hidden transition-all duration-300 backdrop-blur-sm';
const fieldIdle = 'border-white/15 bg-white/[0.06]';
const fieldActive = 'border-brand-orange/70 bg-white/[0.1] shadow-[0_0_0_1px_rgba(249,115,22,0.25),0_8px_32px_rgba(249,115,22,0.12)]';

/** Tête de tigre stylisée */
function TigerHead({ className = 'w-8 h-8' }) {
    return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
            <ellipse cx="32" cy="34" rx="22" ry="20" fill="#F97316" />
            <ellipse cx="32" cy="36" rx="14" ry="12" fill="#FDBA74" />
            <path d="M12 22 L6 8 L20 16 Z" fill="#EA580C" />
            <path d="M52 22 L58 8 L44 16 Z" fill="#EA580C" />
            <path d="M12 22 L8 14 L18 18" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M52 22 L56 14 L46 18" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="24" cy="32" rx="4" ry="5" fill="#0f172a" />
            <ellipse cx="40" cy="32" rx="4" ry="5" fill="#0f172a" />
            <circle cx="25" cy="31" r="1.2" fill="white" />
            <circle cx="41" cy="31" r="1.2" fill="white" />
            <ellipse cx="32" cy="40" rx="3" ry="2.2" fill="#0f172a" />
            <path d="M32 42 v6 M26 44 h12" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M18 28 Q22 26 24 30" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M46 28 Q42 26 40 30" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M14 36 Q18 42 22 38" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M50 36 Q46 42 42 38" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    );
}

/** Emblème tigre + voiture */
function TigerCarBadge() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 120 }}
            whileHover={{ y: -4, scale: 1.03 }}
            className="relative flex items-center gap-3 rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
            <div className="relative">
                <svg viewBox="0 0 88 40" className="w-20 h-9 text-white/90" fill="currentColor" aria-hidden="true">
                    <path d="M8 28 L14 16 C16 12 20 10 26 10 L52 10 C58 10 62 12 66 16 L78 28 L82 28 C84 28 85 30 84 32 L82 34 C80 36 78 36 76 36 L72 36 C70 32 66 30 62 30 L28 30 C24 30 20 32 18 36 L12 36 C10 36 8 36 7 34 L5 32 C4 30 5 28 8 28 Z" />
                    <circle cx="24" cy="34" r="5" fill="#0f172a" stroke="#F97316" strokeWidth="2" />
                    <circle cx="66" cy="34" r="5" fill="#0f172a" stroke="#F97316" strokeWidth="2" />
                    <path d="M28 12 L34 20 L50 20 L56 12" fill="none" stroke="#FDBA74" strokeWidth="1.5" opacity="0.7" />
                </svg>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <TigerHead className="w-7 h-7 drop-shadow-[0_2px_8px_rgba(249,115,22,0.6)]" />
                </div>
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-brand-orange font-bold">Auto</p>
                <p className="text-sm text-white font-semibold leading-tight">Esprit tigre</p>
            </div>
        </motion.div>
    );
}

/** Emblème tigre + moto */
function TigerMotoBadge() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 120 }}
            whileHover={{ y: -4, scale: 1.03 }}
            className="relative flex items-center gap-3 rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
            <div className="relative">
                <svg viewBox="0 0 88 44" className="w-20 h-10 text-white/90" fill="currentColor" aria-hidden="true">
                    <circle cx="22" cy="32" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
                    <circle cx="66" cy="32" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
                    <circle cx="22" cy="32" r="3" fill="#F97316" />
                    <circle cx="66" cy="32" r="3" fill="#F97316" />
                    <path d="M30 30 L42 18 L58 18 L64 28 L54 28 L48 22 L38 28 Z" />
                    <path d="M42 18 L46 10 L52 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M58 18 L68 12" fill="none" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="absolute -top-2 left-[42%] -translate-x-1/2">
                    <TigerHead className="w-7 h-7 drop-shadow-[0_2px_8px_rgba(249,115,22,0.6)]" />
                </div>
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-brand-orange font-bold">Moto</p>
                <p className="text-sm text-white font-semibold leading-tight">Puissance féline</p>
            </div>
        </motion.div>
    );
}

function LoginHero() {
    return (
        <div className="relative z-10 hidden lg:flex flex-1 min-h-screen flex-col justify-between px-10 xl:px-16 py-12 max-w-3xl">
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-[0.28em] font-medium"
            >
                <span className="w-8 h-px bg-brand-orange/70" />
                Performance &amp; maîtrise
            </motion.div>

            <div className="my-auto pr-6">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-brand-orange font-semibold text-sm tracking-[0.2em] uppercase mb-4"
                >
                    Bienvenue
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, type: 'spring', stiffness: 100 }}
                    className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight"
                >
                    Autopilote
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-300 to-orange-200 mt-1">
                        au rythme du tigre
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    className="mt-6 text-lg xl:text-xl text-white/75 max-w-md leading-relaxed"
                >
                    Pilotez ventes, stock et ateliers avec la précision d&apos;un félin — rapide, fluide, sans frein.
                </motion.p>

                <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 space-y-3"
                >
                    {[
                        'Une vision claire de votre business auto & moto',
                        'Des opérations synchronisées, du devis à la caisse',
                        'L\'instinct tigre : décider vite, livrer juste',
                    ].map((line, i) => (
                        <motion.li
                            key={line}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + i * 0.08 }}
                            className="flex items-start gap-3 text-sm text-white/65"
                        >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                            {line}
                        </motion.li>
                    ))}
                </motion.ul>

                <div className="mt-10 flex flex-wrap gap-4">
                    <TigerCarBadge />
                    <TigerMotoBadge />
                </div>
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-white/35 tracking-wide"
            >
                Auto · Moto · Pièces — tout sous contrôle
            </motion.p>
        </div>
    );
}

function PasswordField({ value, onChange, showPassword, onToggle }) {
    const [focused, setFocused] = useState(false);

    return (
        <div className="relative">
            <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 mb-2">
                Mot de Passe
            </label>
            <motion.div animate={{ scale: focused ? 1.01 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <div className={`${fieldBase} ${focused ? fieldActive : fieldIdle}`}>
                    <Lock
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                            focused ? 'text-brand-orange' : 'text-white/40'
                        }`}
                    />
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="Mot de passe"
                        required
                        autoComplete="new-password"
                        className="block w-full pl-11 pr-11 py-3.5 text-sm text-white bg-transparent outline-none placeholder:text-white/30"
                    />
                    <motion.button
                        type="button"
                        onClick={onToggle}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/40 hover:text-brand-orange hover:bg-white/10 transition-colors"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={showPassword ? 'hide' : 'show'}
                                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                transition={{ duration: 0.2 }}
                                className="block"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

const LOGIN_DOMAIN = '@autopilote.com';

function sanitizeLoginLocal(value) {
    // Garde uniquement la partie locale (avant @) si un email complet est collé
    return String(value || '')
        .split('@')[0]
        .replace(/\s+/g, '')
        .toLowerCase();
}

export default function Login() {
    const [status, setStatus] = useState('');
    const [loginLocal, setLoginLocal] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    // Panneau vide : aucune session ni identifiant prérempli
    useEffect(() => {
        logout();
        setStatus('');
        setLoginLocal('');
        setPassword('');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const local = sanitizeLoginLocal(loginLocal);
        if (!status || !local || !password) {
            setError('Veuillez saisir le statut, le login et le mot de passe.');
            return;
        }
        setLoading(true);
        try {
            await login(`${local}${LOGIN_DOMAIN}`, password, status);
            navigate('/');
        } catch (err) {
            setError(
                err.response?.data?.errors?.status?.[0]
                || err.response?.data?.errors?.email?.[0]
                || err.response?.data?.message
                || 'Identifiants incorrects'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex overflow-hidden bg-black">
            <div
                className="absolute inset-0 bg-cover bg-no-repeat"
                style={{
                    backgroundImage: "url('/images/login-bg.png?v=7')",
                    backgroundPosition: 'center center',
                    transform: 'scale(1.05)',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_40%,rgba(249,115,22,0.14),transparent_50%)] pointer-events-none" />

            <LoginHero />

            {/* Panneau droite */}
            <div className="relative z-10 flex w-full lg:w-[min(100%,480px)] min-h-screen items-center justify-center p-5 sm:p-8 ml-auto">
                <motion.div
                    initial={{ opacity: 0, x: 28, y: 12 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 110 }}
                    className="w-full max-w-[400px]"
                >
                    <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/25 via-white/10 to-brand-orange/30">
                        <div className="relative rounded-[23px] bg-slate-950/75 backdrop-blur-2xl border border-white/10 overflow-hidden px-7 sm:px-8 py-8 sm:py-9">
                            <div className="pointer-events-none absolute -top-24 -right-16 w-56 h-56 rounded-full bg-brand-orange/15 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-28 -left-20 w-56 h-56 rounded-full bg-blue-600/20 blur-3xl" />
                            <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                            <div className="relative">
                                <div className="flex items-center justify-center gap-3.5 mb-6">
                                    <div className="relative">
                                        <LoginBrandLogo />
                                        <motion.div
                                            animate={{ y: [0, -3, 0] }}
                                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                            className="absolute -top-2 -right-2"
                                        >
                                            <TigerHead className="w-5 h-5" />
                                        </motion.div>
                                    </div>
                                    <div>
                                        <h1 className="font-black tracking-wide leading-none text-2xl text-white">
                                            <span className="text-brand-orange">Autopilote</span>
                                        </h1>
                                        <p className="text-[10px] text-white/45 uppercase tracking-[0.22em] mt-1.5 font-medium">
                                            Gestion commerciale
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6 text-center">
                                    <h2 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
                                        Connexion
                                        <Sparkles className="w-4 h-4 text-brand-orange/80" />
                                    </h2>
                                    <p className="text-sm text-white/45 mt-1">Accédez à votre espace</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.96 }}
                                                className="p-3 rounded-xl bg-red-500/15 text-red-300 text-sm text-center border border-red-400/25"
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div>
                                        <label htmlFor="status" className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 mb-2">
                                            Statut
                                        </label>
                                        <div className={`${fieldBase} ${fieldIdle} focus-within:border-brand-orange/70 focus-within:bg-white/[0.1] focus-within:shadow-[0_0_0_1px_rgba(249,115,22,0.25)]`}>
                                            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                                            <select
                                                id="status"
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                required
                                                className="block w-full pl-11 pr-10 py-3.5 text-sm text-white bg-transparent outline-none appearance-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                                            >
                                                <option value="">— Sélectionner —</option>
                                                <option value="administrateur">Administrateur</option>
                                                <option value="commercial">Commercial</option>
                                                <option value="caisse">Caisse</option>
                                                <option value="facturation">Facturation</option>
                                            </select>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">⌄</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="login" className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 mb-2">
                                            Login
                                        </label>
                                        <motion.div
                                            animate={{ scale: emailFocused ? 1.01 : 1 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                            className={`${fieldBase} ${emailFocused ? fieldActive : fieldIdle}`}
                                        >
                                            <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${emailFocused ? 'text-brand-orange' : 'text-white/40'}`} />
                                            <div className="flex items-center w-full pl-11 pr-3 py-3.5">
                                                <input
                                                    id="login"
                                                    type="text"
                                                    name="login"
                                                    value={loginLocal}
                                                    onChange={(e) => setLoginLocal(sanitizeLoginLocal(e.target.value))}
                                                    onFocus={() => setEmailFocused(true)}
                                                    onBlur={() => setEmailFocused(false)}
                                                    placeholder="identifiant"
                                                    required
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    className="min-w-0 flex-1 text-sm text-white bg-transparent outline-none border-0 ring-0 focus:outline-none focus:ring-0 shadow-none placeholder:text-white/30"
                                                />
                                                <span className="shrink-0 text-sm font-medium text-white/55 select-none pl-1">
                                                    {LOGIN_DOMAIN}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </div>

                                    <PasswordField
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        showPassword={showPassword}
                                        onToggle={() => setShowPassword(!showPassword)}
                                    />

                                    <div className="flex items-center justify-between text-sm pt-0.5">
                                        <label className="flex items-center gap-2 text-white/55 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={remember}
                                                onChange={(e) => setRemember(e.target.checked)}
                                                className="rounded border-white/25 bg-white/10 text-brand-orange focus:ring-brand-orange/50"
                                            />
                                            <span className="group-hover:text-white/80 transition-colors">Se souvenir</span>
                                        </label>
                                        <button type="button" className="text-brand-orange/90 text-sm font-medium hover:text-brand-orange hover:underline underline-offset-2">
                                            Mot de passe oublié ?
                                        </button>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: loading ? 1 : 1.015 }}
                                        whileTap={{ scale: loading ? 1 : 0.98 }}
                                        className="relative w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-navy via-blue-800 to-brand-orange text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_12px_40px_rgba(249,115,22,0.28)] overflow-hidden group mt-1"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                        <span className="relative flex items-center gap-2">
                                            {loading ? (
                                                <>
                                                    <motion.span
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                    />
                                                    Connexion...
                                                </>
                                            ) : (
                                                <>Se connecter <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                            )}
                                        </span>
                                    </motion.button>
                                </form>

                                <footer className="mt-8 pt-5 border-t border-white/10">
                                    <p className="text-[11px] text-white/35 tracking-wide">
                                        Créé par{' '}
                                        <span className="text-brand-orange font-bold tracking-wider">A2SPRO</span>
                                        <span className="mx-1.5 text-white/20">—</span>
                                        <span className="text-white/55 font-semibold">A2S</span>
                                    </p>
                                </footer>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
