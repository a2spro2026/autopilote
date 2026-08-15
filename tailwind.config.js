import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    navy: '#1E3A8A',
                    orange: '#F97316',
                    'navy-light': '#2563EB',
                },
            },
            boxShadow: {
                glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                card: '0 4px 24px -4px rgba(30, 58, 138, 0.12)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
            },
            keyframes: {
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
