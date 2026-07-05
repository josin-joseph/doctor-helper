/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        blue:   { 50:'#EFF6FF', 100:'#DBEAFE', 200:'#BFDBFE', 500:'#3B82F6', 600:'#2563EB', 700:'#1D4ED8', 800:'#1E40AF' },
        green:  { 50:'#ECFDF5', 600:'#059669', 800:'#065F46' },
        red:    { 50:'#FEF2F2', 600:'#DC2626', 800:'#991B1B' },
        amber:  { 50:'#FFFBEB', 600:'#D97706', 800:'#92400E' },
        purple: { 50:'#F5F3FF', 600:'#7C3AED', 800:'#4C1D95' },
      },
      borderRadius: { xl:'12px', '2xl':'16px', '3xl':'20px' },
      animation: {
        'fade-up': 'fadeUp 0.25s ease-out',
        'spin-slow': 'spin 0.7s linear infinite',
      },
      keyframes: {
        fadeUp: { from:{opacity:'0',transform:'translateY(10px)'}, to:{opacity:'1',transform:'translateY(0)'} },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(37,99,235,0.08), 0 1px 3px rgba(0,0,0,0.06)',
        modal: '0 24px 64px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};