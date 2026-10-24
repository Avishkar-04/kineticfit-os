/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kf: {
          bg: '#111319',
          'surface-lowest': '#0b0e13',
          'surface-1': '#191c21',
          'surface-2': '#1d2025',
          'surface-3': '#272a30',
          'surface-elevated': '#32353b',
          'surface-bright': '#36393f',
          lime: '#c3f400',
          'lime-dim': '#abd600',
          'lime-dark': '#283500',
          cyan: '#00eefc',
          'cyan-dim': '#00dbe9',
          'cyan-dark': '#00363a',
          danger: '#ffb4ab',
          'danger-container': '#93000a',
          border: '#262f3e',
          'border-subtle': '#1d232f',
          outline: '#444933',
          text: '#e1e2ea',
          'text-muted': '#94a3b8',
          'text-steel': '#64748b'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        'lime-glow': '0 0 16px rgba(195, 244, 0, 0.15), inset 0 0 0 1px #c3f400',
        'lime-halo': '0 0 12px rgba(195, 244, 0, 0.2)',
        'cyan-glow': '0 0 12px rgba(0, 238, 252, 0.18)',
        'danger-glow': '0 0 16px rgba(255, 180, 171, 0.2)'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        pill: '9999px'
      }
    }
  },
  plugins: []
};
