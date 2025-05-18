🛠️ EKG Web App Build Plan (LLM-Executable Tasks)
🧱 PHASE 1: Setup & Skeleton
1. Initialize Vite + React + TypeScript project
Start: Run npm create vite@latest ekg-wave-simulator -- --template react-ts

End: Project runs npm run dev, opens to “Hello World”

2. Clean up Vite boilerplate
Start: Default Vite files are present

End: Remove App.css, logo.svg, and edit App.tsx to say “EKG Simulator v0.1”

3. Install Tailwind CSS
Start: Plain CSS setup

End: Tailwind installed and working via index.css (verify with a bg-red-500 test)

4. Create SimulatorPage.tsx
Start: Only App.tsx exists

End: SimulatorPage.tsx created with text: "Simulator Ready" and rendered inside App.tsx

📐 PHASE 2: Layout + Canvas
5. Create <WaveformCanvas /> component
Start: Blank component

End: Renders 500x300 <canvas> with black background

6. Use useRef to attach canvas to DOM
Start: No drawing yet

End: Canvas context is acquired using useRef<HTMLCanvasElement>()

7. Draw static sine wave on canvas
Start: Empty canvas

End: Sine wave is rendered using ctx.lineTo(...)

8. Animate sine wave using requestAnimationFrame
Start: Static wave

End: Sine wave scrolls left like an ECG strip

🧠 PHASE 3: State Management
9. Create SimulatorContext.tsx
Start: No global state

End: Context provides:
{
  heartRate: number,
  rhythm: string,
  prInterval: number
}

10. Wrap <App /> with SimulatorProvider
Start: Context not used

End: <App /> can access SimulatorContext

11. Create custom hook useEKGSimulator()
Start: Manual state in each component

End: Central logic for syncing waveform to state (returns beat interval, waveform pattern)

12. Connect canvas to simulator state (e.g., heart rate)
Start: Fixed animation

End: Changing heartRate modifies animation speed

🎛️ PHASE 4: Controls
13. Create <SliderControl /> component
Start: No UI controls

End: Renders slider from 40–180 BPM, updates heartRate in context

14. Create <RhythmToggle /> component
Start: No rhythm selection

End: Dropdown for ["NSR", "AFib", "VTach"], updates rhythm in context

15. Render both controls above canvas in SimulatorPage.tsx
Start: Controls not visible

End: UI shows both slider and dropdown in column layout

16. Update canvas to change waveform based on rhythm
Start: Only NSR shown

End: Canvas renders a visibly different pattern for AFib or VTach using mock profiles

📊 PHASE 5: Waveform Logic
17. Create rhythmProfiles.ts
Start: All waveform logic inline

End: Define objects like:
{
  NSR: number[],
  AFib: number[],
  VTach: number[]
}

18. Create waveformGenerator.ts
Start: Canvas uses hardcoded values

End: Export a function:

generateWaveform(profile: number[], bpm: number): number[]

19. Use waveform generator in animation loop
Start: Wave drawn manually

End: Canvas uses generated waveform array, scrolls it frame-by-frame

🧪 PHASE 6: Enhancements
20. Add "Show Labels" toggle (P, QRS, T markers)
Start: No labels

End: UI toggle enables drawing letter labels above waveform

21. Add “Noise” toggle to simulate motion artifacts
Start: Clean wave only

End: Adds small jitter or wander if toggle is enabled

22. Add lead selector dropdown (Lead I, II, III)
Start: Single wave

End: Option to choose between mock leads with different amplitudes/forms

23. Style entire UI with Tailwind (clean dark/light theme)
Start: Default browser styling

End: Elegant UI, mobile responsive, dark/light toggle

🔄 PHASE 7: Testing & Export
24. Add export button to save waveform as PNG
Start: No output options

End: User clicks “Export Waveform” → triggers canvas toDataURL() download

25. Add reset button to restore defaults
Start: Must refresh to reset

End: Resets heart rate to 70, rhythm to NSR, and clears toggles

26. Host on Vercel
Start: Local only

End: App deployed and accessible at custom URL

