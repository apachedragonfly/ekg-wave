ekg-wave-simulator/
│
├── public/                   # Static assets served as-is
│   └── favicon.ico
│
├── src/                      # Application source code
│   ├── assets/               # Images, icons, fonts
│   │   └── logo.svg
│   │
│   ├── components/           # Reusable UI components
│   │   ├── SliderControl.tsx
│   │   ├── RhythmToggle.tsx
│   │   └── WaveformCanvas.tsx
│   │
│   ├── context/              # React Context for global state
│   │   └── SimulatorContext.tsx
│   │
│   ├── services/             # Logic and utilities for waveform generation
│   │   ├── waveformGenerator.ts
│   │   └── rhythmProfiles.ts
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── useEKGSimulator.ts
│   │
│   ├── pages/                # Top-level route views
│   │   └── SimulatorPage.tsx
│   │
│   ├── App.tsx               # Root app component
│   ├── main.tsx              # Entry point for React
│   └── index.css             # Global styles (Tailwind or custom)
│
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json             # TypeScript config
└── vite.config.ts            # Vite config
