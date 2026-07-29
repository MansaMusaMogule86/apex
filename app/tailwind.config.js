/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // APEX design tokens (design.md §3)
        surface: '#FFFFFF',
        sunken: '#F3F3EE',
        ink: {
          900: '#171816',
          700: '#3D3E3A',
          500: '#6E6F68',
          400: '#9B9C94',
          // ink (dark) zone tokens
          bg: '#101311',
          surface: '#171B18',
          raised: '#1E2320',
          line: '#262C28',
          text: '#F4F4F0',
          muted: '#9BA19B',
        },
        line: {
          DEFAULT: '#E7E7E0',
          strong: '#D8D8CF',
        },
        palm: {
          700: '#0A4A3B',
          600: '#0B5D4A',
          400: '#3FA984',
          100: '#E7F1ED',
          50: '#F2F7F5',
        },
        gold: {
          600: '#A97B1F',
          500: '#C08A2D',
          400: '#D9A441',
          100: '#F7EFDD',
        },
        red: {
          600: '#B4372A',
          100: '#F9E9E6',
        },
        amber: {
          600: '#A36A0F',
          100: '#F8F0DC',
        },
        teal: {
          600: '#1F6E6B',
        },
        wa: {
          green: '#1FA855',
        },
        mail: {
          slate: '#5B6B7A',
        },
        terracotta: '#C0563B',
        olive: '#7A8C3F',
        bronze: '#8C6D4F',
        // shadcn mappings
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundColor: {
        base: '#FAFAF7',
        surface: '#FFFFFF',
        sunken: '#F3F3EE',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        micro: ['11px', { lineHeight: '16px', letterSpacing: '0.07em' }],
      },
      transitionDuration: {
        120: '120ms',
        140: '140ms',
        180: '180ms',
        450: '450ms',
      },
      maxWidth: {
        container: '1160px',
        app: '1560px',
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        e1: '0 1px 2px rgba(16,19,17,.04), 0 2px 6px rgba(16,19,17,.05)',
        e2: '0 12px 32px -12px rgba(16,19,17,.22)',
        e3: '0 24px 64px -16px rgba(16,19,17,.30)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        "skyline-drift": {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        "nav-drop": {
          from: { transform: 'translateY(-64px)' },
          to: { transform: 'translateY(0)' },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".55", transform: "scale(.8)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        marquee: 'marquee 28s linear infinite',
        "skyline-drift": 'skyline-drift 60s linear infinite',
        "nav-drop": 'nav-drop 500ms cubic-bezier(.16,1,.3,1) 200ms both',
        "pulse-dot": 'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
