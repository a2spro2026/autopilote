import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LOGIN_DOMAIN = '@autopilote.com';

const fieldBase =
    'relative rounded-xl border overflow-hidden transition-all duration-300 backdrop-blur-sm';
const fieldIdle = 'border-white/15 bg-white/[0.06]';
const fieldActive =
    'border-sky-400/70 bg-white/[0.1] shadow-[0_0_0_1px_rgba(56,189,248,0.25),0_8px_32px_rgba(56,189,248,0.12)]';

function sanitizeLoginLocal(value) {
    return String(value || '')
        .split('@')[0]
        .replace(/\s+/g, '')
        .toLowerCase();
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
            navigate('/dashboard');
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
        <div className="relative min-h-screen overflow-hidden bg-[#0a1628] text-white">
            <img
                src="/images/login-bg.png?v=40"
                alt="Autopilote — Vente de pièces auto"
                className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
                draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/35 via-transparent to-[#0a1628]/85" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/40 via-transparent to-[#0a1628]/55" />

            <div className="relative z-10 min-h-screen flex items-center justify-end px-4 sm:px-8 lg:px-12 xl:px-16 py-8">
                <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full max-w-[400px]"
                >
                    <div className="w-full rounded-2xl border border-white/15 bg-[#0b1220]/88 backdrop-blur-xl shadow-2xl shadow-black/50 px-6 sm:px-8 py-8 sm:py-10 min-h-[560px] flex flex-col justify-center">
                        <div className="mb-6 text-center">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-sky-300/90 font-semibold mb-2">
                                Vente de pièces auto
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
                                <span className="text-white">AUTO</span>
                                <span className="text-sky-400">PILOTE</span>
                            </h1>
                            <h2 className="mt-4 text-base font-semibold text-white flex items-center justify-center gap-2">
                                Connexion
                                <Sparkles className="w-4 h-4 text-sky-300/90" />
                            </h2>
                            <p className="text-sm text-white/45 mt-1.5">Accédez à votre espace</p>
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
                                    className={`${fieldBase} ${fieldIdle} focus-within:border-sky-400/70 focus-within:bg-white/[0.1]`}
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
                                        <option value="gerant">Gérant</option>
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
                                            emailFocused ? 'text-sky-400' : 'text-white/40'
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
                                        className="rounded border-white/25 bg-white/10 text-sky-500 focus:ring-sky-500/50"
                                    />
                                    <span className="group-hover:text-white/80 transition-colors">Se souvenir</span>
                                </label>
                                <button
                                    type="button"
                                    className="text-sky-300/90 text-sm font-medium hover:text-sky-200 hover:underline underline-offset-2"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.015 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                className="relative w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-orange-500 hover:from-sky-500 hover:to-orange-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_12px_40px_rgba(14,165,233,0.35)] overflow-hidden group mt-1"
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

                        <footer className="mt-7 pt-4 border-t border-white/10">
                            <p className="text-[11px] text-white/35 tracking-wide">
                                Créé par{' '}
                                <span className="text-sky-400 font-bold tracking-wider">A2SPRO</span>
                                <span className="mx-1.5 text-white/20">—</span>
                                <span className="text-white/55 font-semibold">A2S</span>
                            </p>
                        </footer>
                    </div>
                </motion.aside>
            </div>
        </div>
    );
}
