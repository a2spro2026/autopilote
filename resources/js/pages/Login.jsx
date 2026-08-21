import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    Shield,
    Sparkles,
    Package,
    ShoppingCart,
    Car,
    BarChart3,
    Timer,
    Coins,
    Handshake,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LOGIN_DOMAIN = '@adeso.com';

const fieldBase =
    'relative rounded-xl border overflow-hidden transition-all duration-300 backdrop-blur-sm';
const fieldIdle = 'border-white/15 bg-white/[0.06]';
const fieldActive =
    'border-red-500/70 bg-white/[0.1] shadow-[0_0_0_1px_rgba(227,30,36,0.25),0_8px_32px_rgba(227,30,36,0.12)]';

const featureCards = [
    { icon: Package, label: 'Stock en temps réel' },
    { icon: ShoppingCart, label: 'Achats & Fournisseurs' },
    { icon: Car, label: 'Ventes & Facturation' },
    { icon: BarChart3, label: 'Statistiques & Rapports' },
];

const valueCards = [
    {
        icon: Shield,
        title: 'Fiabilité',
        text: 'Des données toujours sécurisées',
    },
    {
        icon: Timer,
        title: 'Gain de temps',
        text: 'Une gestion plus rapide et efficace',
    },
    {
        icon: Coins,
        title: 'Rentabilité',
        text: 'De meilleures décisions pour plus de profits',
    },
    {
        icon: Handshake,
        title: 'Partenaire de confiance',
        text: 'Au service de votre performance',
    },
];

function sanitizeLoginLocal(value) {
    return String(value || '')
        .split('@')[0]
        .replace(/\s+/g, '')
        .toLowerCase();
}

function AdesoMark({ className = 'w-14 h-10' }) {
    return (
        <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
            <path
                d="M4 28 C14 8, 28 4, 40 10 C48 14, 54 12, 60 8"
                fill="none"
                stroke="#e31e24"
                strokeWidth="3.2"
                strokeLinecap="round"
            />
            <path
                d="M8 30 C18 14, 30 10, 42 14 C50 17, 55 15, 60 12"
                fill="none"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.9"
            />
        </svg>
    );
}

function PasswordField({ value, onChange, showPassword, onToggle }) {
    const [focused, setFocused] = useState(false);

    return (
        <div className="relative">
            <label
                htmlFor="password"
                className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 mb-2"
            >
                Mot de Passe
            </label>
            <motion.div
                animate={{ scale: focused ? 1.01 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                <div className={`${fieldBase} ${focused ? fieldActive : fieldIdle}`}>
                    <Lock
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                            focused ? 'text-red-400' : 'text-white/40'
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
                        className="block w-full pl-11 pr-11 py-3 text-sm text-white bg-transparent outline-none placeholder:text-white/30"
                    />
                    <motion.button
                        type="button"
                        onClick={onToggle}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
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
                err.response?.data?.errors?.status?.[0] ||
                    err.response?.data?.errors?.email?.[0] ||
                    err.response?.data?.message ||
                    'Identifiants incorrects'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#05070d] text-white">
            {/* Fond photo (sans UI) + voile */}
            <img
                src="/images/login-bg.png?v=22"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
                draggable={false}
            />
            <div className="absolute inset-0 bg-[#05070d]/78" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05070d]/92 via-[#05070d]/60 to-[#05070d]/85" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#05070d]/85 via-[#05070d]/35 to-[#05070d]/92" />

            <div className="relative z-10 min-h-screen flex flex-col px-5 sm:px-8 lg:px-10 xl:px-14 py-6 lg:py-8">
                {/* Header */}
                <header className="flex items-start justify-between gap-6">
                    <div className="flex flex-col items-start">
                        <AdesoMark className="w-24 h-16 sm:w-28 sm:h-20 mb-2" />
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
                            <span className="text-white">STE </span>
                            <span className="text-[#e31e24]">ADESO</span>
                        </h1>
                        <p
                            className="mt-2 text-lg sm:text-xl lg:text-2xl text-white/90 italic"
                            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                        >
                            Pièces de Rechange
                        </p>
                    </div>
                    <p
                        className="hidden md:block text-right text-3xl lg:text-4xl xl:text-5xl text-white max-w-md lg:max-w-lg leading-tight pt-2"
                        style={{ fontFamily: '"Great Vibes", cursive' }}
                    >
                        La performance commence par la bonne pièce !
                    </p>
                </header>

                {/* Corps : contenu + formulaire */}
                <div className="flex-1 grid lg:grid-cols-[1fr_min(100%,400px)] gap-8 lg:gap-10 items-center mt-6 lg:mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="hidden lg:block max-w-3xl"
                    >
                        <h2 className="text-3xl xl:text-4xl font-semibold leading-tight text-white">
                            Votre solution complète pour la gestion{' '}
                            <span className="font-bold">des pièces de rechange</span>
                        </h2>

                        <div className="mt-8 grid grid-cols-2 xl:grid-cols-4 gap-3">
                            {featureCards.map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md px-4 py-5 text-center shadow-lg shadow-black/20"
                                >
                                    <Icon className="w-7 h-7 mx-auto text-white mb-3" strokeWidth={1.6} />
                                    <p className="text-sm font-medium text-white/90 leading-snug">{label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Formulaire */}
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-[400px] mx-auto lg:mx-0 lg:justify-self-end"
                    >
                        <div className="rounded-2xl border border-white/10 bg-[#0b1220]/88 backdrop-blur-xl shadow-2xl shadow-black/50 px-6 sm:px-7 py-7">
                            <div className="mb-6 text-center">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-[#e31e24] font-semibold mb-2">
                                    Pièces de rechange
                                </p>
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                                    STE <span className="text-[#e31e24]">ADESO</span>
                                </h2>
                                <h3 className="mt-4 text-base font-semibold text-white flex items-center justify-center gap-2">
                                    Connexion
                                    <Sparkles className="w-4 h-4 text-red-400/90" />
                                </h3>
                                <p className="text-sm text-white/45 mt-1">Accédez à votre espace</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
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
                                    <label
                                        htmlFor="status"
                                        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 mb-2"
                                    >
                                        Statut
                                    </label>
                                    <div
                                        className={`${fieldBase} ${fieldIdle} focus-within:border-red-500/70 focus-within:bg-white/[0.1]`}
                                    >
                                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                                        <select
                                            id="status"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            required
                                            className="block w-full pl-11 pr-10 py-3 text-sm text-white bg-transparent outline-none appearance-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                                        >
                                            <option value="">— Sélectionner —</option>
                                            <option value="administrateur">Administrateur</option>
                                            <option value="commercial">Commercial</option>
                                            <option value="caisse">Caisse</option>
                                            <option value="facturation">Facturation</option>
                                        </select>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                                            ⌄
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="login"
                                        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 mb-2"
                                    >
                                        Login
                                    </label>
                                    <motion.div
                                        animate={{ scale: emailFocused ? 1.01 : 1 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        className={`${fieldBase} ${emailFocused ? fieldActive : fieldIdle}`}
                                    >
                                        <User
                                            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                                                emailFocused ? 'text-red-400' : 'text-white/40'
                                            }`}
                                        />
                                        <div className="flex items-center w-full pl-11 pr-3 py-3">
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
                                            className="rounded border-white/25 bg-white/10 text-[#e31e24] focus:ring-red-500/50"
                                        />
                                        <span className="group-hover:text-white/80 transition-colors">Se souvenir</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="text-red-400/90 text-sm font-medium hover:text-red-300 hover:underline underline-offset-2"
                                    >
                                        Mot de passe oublié ?
                                    </button>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: loading ? 1 : 1.015 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    className="relative w-full py-3.5 rounded-xl bg-[#e31e24] hover:bg-[#c9181e] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_12px_40px_rgba(227,30,36,0.35)] overflow-hidden group mt-1"
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
                                            <>
                                                Se connecter{' '}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </motion.button>
                            </form>

                            <footer className="mt-6 pt-4 border-t border-white/10">
                                <p className="text-[11px] text-white/35 tracking-wide">
                                    Créé par{' '}
                                    <span className="text-red-400 font-bold tracking-wider">A2SPRO</span>
                                    <span className="mx-1.5 text-white/20">—</span>
                                    <span className="text-white/55 font-semibold">A2S</span>
                                </p>
                            </footer>
                        </div>
                    </motion.aside>
                </div>

                {/* Cartes bas + copyright */}
                <div className="mt-6 lg:mt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                        {valueCards.map(({ icon: Icon, title, text }) => (
                            <div
                                key={title}
                                className="rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md px-4 py-4 flex items-start gap-3 shadow-lg shadow-black/20"
                            >
                                <Icon className="w-6 h-6 text-[#e31e24] shrink-0 mt-0.5" strokeWidth={1.75} />
                                <div>
                                    <p className="font-semibold text-white text-sm">{title}</p>
                                    <p className="text-xs text-white/65 mt-0.5 leading-snug">{text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-2 border-t border-[#e31e24]/70">
                        <p className="text-center text-xs sm:text-sm text-white/70 py-2">
                            © 2026 - STE ADESO - Tous Droits Réservés
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
