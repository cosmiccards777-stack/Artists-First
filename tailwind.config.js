/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                brand: {
                    teal: '#0d9488', // Teal-600
                    light: '#f0fdfa', // Teal-50
                    dark: '#134e4a', // Teal-900
                }
            }
        },
    },
    plugins: [],
}
