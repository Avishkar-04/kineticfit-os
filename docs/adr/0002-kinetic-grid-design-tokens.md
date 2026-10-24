# ADR 0002: Kinetic Grid Design Tokens and Color Governance

## Status
Accepted

## Context
The Stitch design export contains discrepancies between the YAML front-matter in `kinetic_grid/DESIGN.md` (e.g. background `#111319`, primary `#c3f400`, surface container high `#272a30`) and the descriptive prose in the same file (e.g. `#0c0f14`, `#ccff00`). The generated HTML aligns with the front-matter values.

## Decision
1. We establish the YAML front-matter tokens as the **authoritative color truth**.
2. We map these tokens into CSS custom variables with semantic aliases (`--kf-bg`, `--kf-surface-1`, `--kf-surface-2`, `--kf-surface-3`, `--kf-lime`, `--kf-cyan`, `--kf-danger`, `--kf-border`).
3. We preserve all behavioral design rules from the prose: 1px border framing over soft drop shadows, tonal elevation tiers, sharp 4px radius primitives and 8px cards, electric lime glow for focus/active states, and pills restricted to status chips and progress bars.
4. Tailwind CSS will consume these tokens via a centralized configuration package (`@kineticfit/config`).

## Consequences
- Pixel fidelity matching the Stitch screens.
- Centralized theme customization and runtime profile switching without CSS recompilation.
