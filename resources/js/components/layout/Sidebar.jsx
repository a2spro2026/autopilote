import { useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Lock } from 'lucide-react';
import { navigation } from '../../config/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarBrand } from '../Logo';
import { getPageTitle } from '../../lib/pageMeta';

const sectionThemes = {
    fournisseurs: {
        bar: 'bg-amber-400',
        soft: 'from-amber-500/25 via-orange-600/10 to-transparent',
        ring: 'ring-amber-400/25',
        icon: 'text-amber-300',
        glow: 'bg-amber-400/20',
    },
    catalogue: {
        bar: 'bg-teal-400',
        soft: 'from-teal-500/25 via-emerald-600/10 to-transparent',
        ring: 'ring-teal-400/25',
        icon: 'text-teal-300',
        glow: 'bg-teal-400/20',
    },
    clients: {
        bar: 'bg-sky-400',
        soft: 'from-sky-500/25 via-cyan-600/10 to-transparent',
        ring: 'ring-sky-400/25',
        icon: 'text-sky-300',
        glow: 'bg-sky-400/20',
    },
    facturation: {
        bar: 'bg-indigo-400',
        soft: 'from-indigo-500/25 via-blue-700/10 to-transparent',
        ring: 'ring-indigo-400/25',
        icon: 'text-indigo-300',
        glow: 'bg-indigo-400/20',
    },
    stock: {
        bar: 'bg-emerald-400',
        soft: 'from-emerald-500/25 via-teal-600/10 to-transparent',
        ring: 'ring-emerald-400/25',
        icon: 'text-emerald-300',
        glow: 'bg-emerald-400/20',
    },
    personnel: {
        bar: 'bg-violet-400',
        soft: 'from-violet-500/25 via-purple-600/10 to-transparent',
        ring: 'ring-violet-400/25',
        icon: 'text-violet-300',
        glow: 'bg-violet-400/20',
    },
    monetaire: {
        bar: 'bg-rose-400',
        soft: 'from-rose-500/25 via-pink-600/10 to-transparent',
        ring: 'ring-rose-400/25',
        icon: 'text-rose-300',
        glow: 'bg-rose-400/20',
    },
    configuration: {
        bar: 'bg-slate-300',
        soft: 'from-slate-400/25 via-slate-600/10 to-transparent',
        ring: 'ring-slate-300/25',
        icon: 'text-slate-200',
        glow: 'bg-slate-300/15',
    },
};

const defaultTheme = {
    bar: 'bg-white/50',
    soft: 'from-white/15 via-white/5 to-transparent',
    ring: 'ring-white/15',
    icon: 'text-blue-200',
    glow: 'bg-white/10',
};

function NavIcon({ icon: Icon, active, size = 'md', tone }) {
    const sizeClass = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

    return (
        <span
            className={`sidebar-icon-wrap flex items-center justify-center rounded-lg shrink-0 ${sizeClass} ${
                active ? 'bg-white/25 shadow-inner' : tone || 'bg-white/5'
            }`}
        >
            <Icon className={`${iconSize} ${active ? 'text-white' : 'text-blue-200'}`} strokeWidth={2} />
        </span>
    );
}

function NavChildItem({ child, onClose, locked }) {
    if (locked || child.disabled) {
        return (
            <div title={locked ? 'Section à venir' : 'Indisponible'} className="opacity-45 grayscale pointer-events-none">
                <div className="sidebar-child-item flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-slate-300 cursor-not-allowed">
                    <child.icon className="sidebar-child-icon w-4 h-4 shrink-0 opacity-60" strokeWidth={1.75} />
                    <span className="truncate">{child.label}</span>
                    {locked && <Lock className="ml-auto w-3 h-3 text-white/30 shrink-0" strokeWidth={2} />}
                </div>
            </div>
        );
    }

    return (
        <NavLink
            to={child.to}
            onClick={onClose}
            className={({ isActive }) =>
                `sidebar-child-item group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors duration-100 ${
                    isActive
                        ? 'sidebar-child-active text-white'
                        : 'text-blue-200/90 hover:bg-white/5 hover:text-white'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-brand-orange" />
                    )}
                    <child.icon
                        className={`sidebar-child-icon w-4 h-4 shrink-0 ${
                            isActive ? 'text-brand-orange' : 'opacity-70'
                        }`}
                        strokeWidth={1.75}
                    />
                    <span className="truncate">{child.label}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />}
                </>
            )}
        </NavLink>
    );
}

function DashboardLink({ item, onClose }) {
    return (
        <NavLink
            to={item.to}
            end
            onClick={onClose}
            className={({ isActive }) =>
                `sidebar-nav-item relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-100 ${
                    isActive
                        ? 'sidebar-nav-active text-white'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white/80" />
                    )}
                    <NavIcon icon={item.icon} active={isActive} />
                    <span>{item.label}</span>
                </>
            )}
        </NavLink>
    );
}

function NavGroup({ group, onClose }) {
    const location = useLocation();
    const disabled = !!group.disabled;
    const locked = !!group.locked;
    const theme = sectionThemes[group.id] || defaultTheme;
    const isChildActive =
        !disabled &&
        !locked &&
        group.children?.some(
            (c) => !c.disabled && (location.pathname === c.to || location.pathname.startsWith(`${c.to}/`)),
        );

    if (group.to) {
        return (
            <div className={disabled ? 'opacity-40 grayscale pointer-events-none' : ''}>
                <NavLink
                    to={group.to}
                    end
                    onClick={onClose}
                    className={({ isActive }) =>
                        `sidebar-nav-item relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-100 ${
                            isActive
                                ? 'sidebar-nav-active text-white'
                                : 'text-blue-100 hover:bg-white/10 hover:text-white'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white/80" />
                            )}
                            <NavIcon icon={group.icon} active={isActive} />
                            <span>{group.label}</span>
                        </>
                    )}
                </NavLink>
            </div>
        );
    }

    return (
        <div
            className={`sidebar-section-card relative mb-2.5 overflow-hidden rounded-2xl ring-1 ${theme.ring} ${
                disabled ? 'opacity-40 grayscale' : ''
            } ${locked ? 'opacity-80' : ''}`}
            title={disabled ? 'Section indisponible' : locked ? 'Section à venir' : undefined}
        >
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.soft} pointer-events-none`} />
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bar} ${isChildActive ? 'opacity-100' : 'opacity-70'}`} />

            <div className="relative px-3 pt-2.5 pb-2">
                <div className="flex items-center gap-2.5 mb-1.5">
                    <span
                        className={`sidebar-icon-wrap flex items-center justify-center rounded-lg shrink-0 w-8 h-8 ${theme.glow} ring-1 ring-white/10`}
                    >
                        <group.icon className={`w-4 h-4 ${theme.icon}`} strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-semibold leading-none mb-1">
                            Module
                        </p>
                        <p className="text-sm font-bold text-white truncate leading-tight">{group.label}</p>
                    </div>
                    {locked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/45 ring-1 ring-white/10">
                            <Lock className="w-3 h-3" strokeWidth={2} />
                            Bientôt
                        </span>
                    ) : (
                        <span className={`h-1.5 w-1.5 rounded-full ${theme.bar} shadow-[0_0_8px_rgba(255,255,255,0.35)]`} />
                    )}
                </div>

                {group.children?.length > 0 && (
                    <div className="mt-1 ml-1 pl-3 border-l border-white/10 space-y-0.5 py-0.5">
                        {group.children.map((child) => (
                            <NavChildItem
                                key={child.to}
                                child={child}
                                onClose={onClose}
                                locked={locked}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Sidebar({ mobile, onClose }) {
    const { can, canMenu, user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const pageTitle = getPageTitle(pathname);

    const hasMenuConfig = Array.isArray(user?.menu_access);

    const { dashboardItem, menuGroups } = useMemo(() => {
        const visibleNav = navigation
            .map((item) => {
                if (!can(item.perm) && !item.locked) return null;

                if (item.children) {
                    let children = item.children || [];
                    if (hasMenuConfig) {
                        children = children.filter((c) => c.disabled || canMenu(c.to));
                        const sectionOk = canMenu(item.id) || children.length > 0 || item.locked;
                        if (!sectionOk) return null;
                        return { ...item, children };
                    }
                    if (!children.length && !item.locked) return null;
                    return { ...item, children };
                }

                if (hasMenuConfig && item.id === 'dashboard' && !canMenu('dashboard') && !canMenu('/') && !canMenu('/dashboard')) {
                    return null;
                }
                return item;
            })
            .filter(Boolean);

        return {
            dashboardItem: visibleNav.find((item) => item.id === 'dashboard'),
            menuGroups: visibleNav.filter((item) => item.id !== 'dashboard'),
        };
    }, [can, canMenu, hasMenuConfig]);

    const handleLogout = async () => {
        await logout();
        onClose?.();
        navigate('/login');
    };

    return (
        <aside
            className={`sidebar-panel ${
                mobile ? 'fixed inset-y-0 left-0 z-50 w-72' : 'hidden lg:flex lg:w-72 lg:sticky lg:top-0'
            } flex-col h-screen text-white shrink-0`}
        >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-brand-orange/10" />
                <div className="absolute bottom-32 -left-10 w-32 h-32 rounded-full bg-blue-500/10" />
            </div>

            <div className="relative shrink-0 z-10 border-b border-white/10 bg-slate-900/40">
                <div className="p-4 pb-3">
                    <SidebarBrand pageTitle={pageTitle} />
                </div>
                {dashboardItem && (
                    <div className="px-3 pb-3">
                        <DashboardLink item={dashboardItem} onClose={onClose} />
                    </div>
                )}
            </div>

            <nav className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3">
                <div className="space-y-1.5">
                    {menuGroups.map((group) => (
                        <NavGroup key={group.id} group={group} onClose={onClose} />
                    ))}
                </div>
            </nav>

            <div className="relative shrink-0 p-4 border-t border-white/10 bg-slate-900/40 z-10">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="sidebar-nav-item w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-200 hover:text-white hover:bg-red-500/20 border border-red-500/20 hover:border-red-400/40 transition-colors duration-100"
                >
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/15 shrink-0">
                        <LogOut className="w-4 h-4" strokeWidth={2} />
                    </span>
                    <span className="flex-1 text-left">Se déconnecter</span>
                </button>
            </div>
        </aside>
    );
}
