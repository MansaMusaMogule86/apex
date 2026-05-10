# APEX Executive Demo Mode Architecture

## Purpose
APEX Executive Demo Mode turns the command center into a guided, cinematic, live-operational experience suitable for investor demos, board presentations, and strategic partner walkthroughs.

## Implemented Runtime Components
- `src/components/command-center/demo/ExecutiveDemoModeProvider.tsx`
  - Global demo state (`enabled`, `autoplay`, `phase`, `signalDensity`, `kpiVelocity`)
  - Scenario graph and route orchestration
  - Live KPI modulation via `live-intelligence-store`
  - Timed autoplay route sequencing with prefetch
- `src/components/command-center/demo/DemoModeAtmosphere.tsx`
  - Ambient cinematic overlay (scanline, glow, pulse particles)
  - Urgency-aware visual tone (`steady`, `surge`, `critical`)
- `src/components/command-center/CommandCenterShell.tsx`
  - Provider wiring and route continuity transitions
  - Shell-level atmosphere injection
- `src/components/command-center/CommandCenterTopBar.tsx`
  - Executive controls for Demo Mode and Autoplay
  - Active scenario, phase, and stream status visibility
- `src/components/command-center/IntelligenceRail.tsx`
  - Scenario lifecycle feed and dynamic reprioritization lane

## Section Coverage

### 1) Live Command Center Atmosphere
- Global atmosphere overlays and urgency-tinted glow.
- Subtle, low-noise pulse motion to preserve calm institutional visual rhythm.

### 2) Streaming Signal Visuals
- Signal density and KPI velocity are continuously modulated.
- Shell transitions now include continuity animation to keep operational flow.

### 3) Executive Urgency System
- Central urgency phase model drives visual and KPI intensity.
- `steady -> surge -> critical` cadence updates tactical perception.

### 4) AI Orchestration Visualization
- Scenario feed in rail exposes orchestration lane progression.
- Alerts are generated as autoplay advances through strategic phases.

### 5) Command Center Transitions
- Route-aware enter/exit transitions in shell `main` preserve context.
- Autoplay transitions are deterministic and presentation-safe.

### 6) Live KPI System
- Per-domain KPI runtime drift, queue depth, and event rate are modulated by demo phase.
- Existing domain screens consume this runtime through `useLiveIntelligence`.

### 7) Executive Rail Evolution
- Rail includes scenario lifecycle entries and lane jump controls.
- Reprioritization is visible as active scenario changes.

### 8) Ambient Intelligence Engine
- Scanline and glow layers are shell-level, not screen-level, for consistency.
- Visuals are phase-aware and coordinated by single source of truth.

### 9) Demo Mode Orchestration
- Autoplay cycles through strategic route scenarios on interval.
- Routes are prefetched before autoplay begins to reduce navigation friction.
- Works without user interaction when enabled.

### 10) Performance + Optimization
- Effects are interval-based with bounded work.
- Route prefetch reduces transition latency.
- `prefers-reduced-motion` disables scanline animation.
- Atmosphere rendering is CSS/motion-light and pointer-events disabled.

## Presentation Operating Instructions
1. Open command center.
2. Enable `Demo on` in the top bar.
3. Enable `Autoplay on` for hands-free narrative flow.
4. Observe scenario progression in Intelligence Rail.
5. Disable autoplay to take manual control and jump lanes from rail.

## Next Enhancements (Optional)
- Add chapterized voiceover cue hooks for each scenario.
- Introduce per-screen GSAP timeline adapters for domain-specific hero moments.
- Add "Demo Script" JSON for custom client-specific walkthroughs.
