export function LoginBrandLogo({ large = false }) {
    const box = large ? 'w-16 h-16' : 'w-14 h-14';
    const bx = large ? 'text-2xl' : 'text-xl';

    return (
        <div className={`${box} relative shrink-0`}>
            <div className={`${box} rounded-2xl bg-gradient-to-br from-brand-navy via-blue-700 to-brand-orange p-[2px] shadow-xl shadow-black/30`}>
                <div className="w-full h-full rounded-[14px] bg-slate-900/90 flex items-center justify-center relative overflow-hidden">
                    <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full opacity-25" fill="white">
                        <rect x="10" y="28" width="14" height="26" rx="1" />
                        <rect x="28" y="18" width="12" height="36" rx="1" />
                        <rect x="44" y="24" width="10" height="30" rx="1" />
                        <line x1="49" y1="8" x2="49" y2="24" stroke="white" strokeWidth="2.5" />
                        <line x1="40" y1="14" x2="58" y2="14" stroke="white" strokeWidth="2.5" />
                    </svg>
                    <span className={`${bx} font-black text-white relative z-10 tracking-tighter`}>
                        A<span className="text-brand-orange">P</span>
                    </span>
                </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-orange border-2 border-slate-900 flex items-center justify-center">
                <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="currentColor">
                    <path d="M6 1.5L7 4.5H10L7.75 6.25L8.5 9.5L6 7.75L3.5 9.5L4.25 6.25L2 4.5H5L6 1.5Z" />
                </svg>
            </div>
        </div>
    );
}

export function LoginBranding({ compact = false }) {
    return (
        <div className={`text-center ${compact ? 'mb-8' : ''}`}>
            <div className="flex items-center justify-center gap-4">
                <LoginBrandLogo large={!compact} />
                <div className={compact ? '' : 'pt-1'}>
                    <h1 className={`font-black tracking-wide leading-none text-white ${compact ? 'text-2xl' : 'text-4xl xl:text-5xl'}`}>
                        <span className="text-brand-orange">Autopilote</span>
                    </h1>
                    <p className="text-[10px] sm:text-xs text-blue-200/80 uppercase tracking-[0.2em] mt-1.5 font-medium">
                        Gestion commerciale
                    </p>
                </div>
            </div>

            <p className={`text-brand-orange font-semibold ${compact ? 'text-sm mt-4' : 'text-lg xl:text-xl mt-8'} leading-snug`}>
                Pilotez vos opérations en toute simplicité.
            </p>

            <p className={`text-white/75 leading-relaxed mx-auto ${compact ? 'text-xs mt-3 max-w-xs' : 'text-sm xl:text-base mt-4 max-w-md'}`}>
                Vos équipes, vos tâches… tout dans{' '}
                <span className="text-white font-semibold">Autopilote</span>.
            </p>
        </div>
    );
}
