import { useMemo } from 'react';

function getAvatarUrl(user) {
    if (user?.avatar) {
        return user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`;
    }
    const name = encodeURIComponent(user?.name || 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=F97316&color=fff&size=128&bold=true&format=svg`;
}

export default function UserAvatar({ user, size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-11 h-11',
    };

    const avatarUrl = useMemo(() => getAvatarUrl(user), [user]);

    return (
        <div
            className={`${sizes[size]} rounded-full overflow-hidden ring-2 ring-brand-orange/40 shadow-md shadow-orange-500/20 shrink-0 ${className}`}
            title={user?.name}
        >
            <img
                src={avatarUrl}
                alt={user?.name || 'Utilisateur'}
                className="w-full h-full object-cover bg-brand-navy"
            />
        </div>
    );
}
