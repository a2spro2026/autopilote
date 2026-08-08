export default function StatCard({ title, value, subtitle, icon: Icon, color = 'navy', trend }) {
    const colors = {
        navy: 'from-brand-navy to-blue-700',
        orange: 'from-brand-orange to-orange-600',
        green: 'from-emerald-500 to-emerald-700',
        red: 'from-red-500 to-red-700',
        purple: 'from-violet-500 to-violet-700',
    };

    return (
        <div className="glass-card p-5 shadow-card hover:shadow-glass transition-shadow duration-200 hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                    {trend !== undefined && (
                        <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {trend >= 0 ? '+' : ''}{trend}%
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
