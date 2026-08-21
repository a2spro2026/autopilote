import { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Lock } from 'lucide-react';
import { navigation } from '../../config/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarBrand } from '../Logo';
import { getPageTitle } from '../../lib/pageMeta';

const sectionColors = {
    fournisseurs: 'from-amber-500/20 to-orange-600/10',
    catalogue: 'from-emerald-500/20 to-teal-600/10',
    clients: 'from-blue-500/20 to-cyan-600/10',
    facturation: 'from-indigo-500/20 to-blue-700/10',
    stock: 'from-emerald-500/20 to-teal-600/10',
    personnel: 'from-violet-500/20 to-purple-600/10',
    monetaire: 'from-rose-500/20 to-pink-600/10',
    configuration: 'from-slate-400/20 to-slate-600/10',
};

function NavIcon({ icon: Icon, active, size = 'md' }) {
    const sizeClass = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

    return (
        <span
            className={`sidebar-icon-wrap flex items-center justify-center rounded-lg shrink-0 ${sizeClass} ${
                active ? 'bg-white/25 shadow-inner' : 'bg-white/5'
            }`}
        >
            <Icon className={`${iconSize} ${active ? 'text-white' : 'text-blue-200'}`} strokeWidth={2} />
        </span>
    );
}

function NavChildItem({ child, onClose }) {
    if (child.disabled) {
        return (
            <div title="Indisponible" className="opacity-40 grayscale pointer-events-none">
                <div className="sidebar-child-item flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-slate-400 cursor-not-allowed">
                    <child.icon className="sidebar-child-icon w-4 h-4 shrink-0 opacity-60" strokeWidth={1.75} />
                    <span className="truncate">{child.label}</span>
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

function LockedNavItem({ item }) {
    return (
        <div
            title="Section à venir"
            className="sidebar-nav-item relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/25 cursor-not-allowed select-none grayscale opacity-60"
        >
            <span className="sidebar-icon-wrap flex items-center justify-center rounded-lg shrink-0 w-8 h-8 bg-white/5">
                <item.icon className="w-4 h-4 text-white/30" strokeWidth={2} />
            </span>
            <span className="flex-1 text-left truncate">{item.label}</span>
            <Lock className="w-3.5 h-3.5 text-white/25 shrink-0" strokeWidth={2} />
        </div>
    );
}

function DashboardLink({ item, onClose }) {
    if (item.locked) {
        return <LockedNavItem item={item} />;
    }
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
    const isChildActive = !disabled && !group.locked && group.children?.some(
        (c) => !c.disabled && (location.pathname === c.to || location.pathname.startsWith(`${c.to}/`)),
    );
    const [open, setOpen] = useState(isChildActive);
    const accent = sectionColors[group.id] || 'from-white/10 to-white/5';

    if (group.locked) {
        return (
            <div className="mb-1">
                <LockedNavItem item={group} />
            </div>
        );
    }

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
        <div className={`mb-1 ${disabled ? 'opacity-40 grayscale' : ''}`} title={disabled ? 'Section indisponible' : undefined}>
            <button
                type="button"
                onClick={() => !disabled && setOpen((v) => !v)}
                disabled={disabled}
                className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-100 ${
                    disabled
                        ? 'text-slate-400 cursor-not-allowed bg-white/5'
                        : isChildActive || open
                            ? `sidebar-section-open text-white bg-gradient-to-r ${accent}`
                            : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
            >
                <NavIcon icon={group.icon} active={!disabled && (isChildActive || open)} />
                <span className="flex-1 text-left truncate">{group.label}</span>
                <span
                    className={`flex items-center justify-center w-6 h-6 rounded-md bg-white/5 transition-transform duration-150 ${
                        open ? 'rotate-180' : ''
                    }`}
                >
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </span>
            </button>

            {!disabled && open && (
                <div className="mt-1.5 ml-4 pl-3 border-l-2 sidebar-tree-line space-y-0.5 py-1">
                    {group.children.map((child) => (
                        <NavChildItem key={child.to} child={child} onClose={onClose} />
                    ))}
                </div>
            )}
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
                <div className="space-y-1">
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
