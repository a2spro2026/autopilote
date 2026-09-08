import { NavLink } from 'react-router-dom';

export default function Logo({ size = 'md', showText = true }) {
    const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-11 h-11 text-base', lg: 'w-16 h-16 text-xl' };

    return (
        <div className="flex items-center gap-3">
            <div className={`${sizes[size]} relative rounded-xl bg-gradient-to-br from-brand-navy to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30 overflow-hidden`}>
                <span className="font-bold text-white relative z-10">AP</span>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-orange rounded-full" />
            </div>
            {showText && (
                <div>
                    <div className="font-bold text-lg leading-tight text-brand-navy dark:text-white tracking-wide">Autopilote</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        Gestion commerciale
                    </div>
                </div>
            )}
        </div>
    );
}

function BrandMark({ className = 'w-11 h-11' }) {
    return (
        <div className={`relative ${className} rounded-xl bg-gradient-to-br from-brand-navy via-blue-800 to-brand-orange flex items-center justify-center sidebar-logo-glow shadow-lg overflow-hidden shrink-0`}>
            <span className="relative z-10 font-black text-white text-sm tracking-tight">AP</span>
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-brand-orange border-2 border-slate-900 shadow-sm" />
        </div>
    );
}

export function SidebarBrand({ pageTitle }) {
    return (
        <NavLink to="/" className="flex items-center gap-3 group">
            <BrandMark />
            <div className="min-w-0">
                <div className="font-bold text-lg leading-tight tracking-wide truncate">
                    <span className="text-brand-orange">Autopilote</span>
                </div>
                {pageTitle && (
                    <div className="text-[11px] text-blue-200 font-medium truncate mt-0.5">
                        {pageTitle}
                    </div>
                )}
            </div>
        </NavLink>
    );
}

export function NavbarBrand({ pageTitle }) {
    return (
        <div className="navbar-brand group flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
            <NavLink to="/">
                <BrandMark className="w-10 h-10 sm:w-11 sm:h-11" />
            </NavLink>

            <div className="min-w-0 hidden sm:block border-l border-slate-200 dark:border-slate-700 pl-3">
                <div className="font-bold text-base sm:text-lg leading-tight tracking-wide truncate">
                    <span className="text-slate-800 dark:text-white">Bienvenue </span>
                    <span className="text-brand-orange">AutoPILOTE</span>
                </div>
                {pageTitle && pageTitle !== 'Tableau de bord' && (
                    <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 truncate">
                        {pageTitle}
                    </div>
                )}
            </div>

            <div className="sm:hidden text-sm font-semibold truncate max-w-[42vw] xs:max-w-[180px]">
                <span className="text-brand-orange">AutoPILOTE</span>
                {pageTitle && pageTitle !== 'Tableau de bord' && (
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {pageTitle}
                    </div>
                )}
            </div>
        </div>
    );
}
