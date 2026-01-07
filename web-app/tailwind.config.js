/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './app/(admin)/**/*.{js,ts,jsx,tsx,mdx}',
        './app/(public)/**/*.{js,ts,jsx,tsx,mdx}',
        './app/(client)/**/*.{js,ts,jsx,tsx,mdx}',
        './app/(counter)/**/*.{js,ts,jsx,tsx,mdx}',
        './app/(conductor)/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
