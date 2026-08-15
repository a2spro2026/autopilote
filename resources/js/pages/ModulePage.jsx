import { useLocation } from 'react-router-dom';
import { getPageMeta } from '../lib/pageMeta';

export { getPageMeta } from '../lib/pageMeta';

export default function ModulePage() {
    const { pathname } = useLocation();
    const meta = getPageMeta(pathname);
    const Icon = meta.icon;

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-navy to-blue-700 flex items-center justify-center shadow-lg shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
                <div>
                    {meta.subtitle && (
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-orange mb-1">{meta.subtitle}</p>
                    )}
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{meta.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Module en cours de configuration — Autopilote
                    </p>
                </div>
            </div>
            <div className="glass-card p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 text-sm">Le contenu de ce module sera bientôt disponible.</p>
            </div>
        </div>
    );
}
