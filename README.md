# Right Side Launcher

A premium, highly customizable, Niagara-style application launcher for Windows. Built with Electron, React, and Framer Motion.

## 🚀 Key Highlights

- **Design Systems (Theme Packs):** Instant presets for professional aesthetics:
  - **Material You (MD3):** Dynamic tonal surfaces, adaptive highlights, and rounded typography.
  - **Fluent (Win 11):** Modern glassmorphism with standard Windows 11 aesthetics.
  - **macOS / iOS:** High-blur glass effects with 20px rounded corners and large icons.
  - **Aero (Win 7):** Classic high-transparency and high-blur nostalgia.
  - **Metro (Win 10):** Sharp, high-contrast, solid color tiles.
  - **Cyberpunk:** High-saturation, skew-animated neon aesthetic.
- **Niagara-Style Interactions:** High-performance, physics-based effects that respond naturally to your cursor:
  - **Fisheye Wave:** Items expand and "fan out" around the cursor.
  - **3D Carousel:** A cylindrical rotation effect.
  - **Skew:** Dynamic 3D tilting as you seek.
  - **Highlight:** Spotlight focus that dims non-target items.
- **Interactive Sizing:** Real-time window resizing by dragging the inner edge of the panel.
- **Pinned Apps:** Keep your most-used applications at the top with a simple right-click pin system.
- **Intelligent Autohide:** Full-screen invisible mouse tracking ensures the launcher hides reliably and never gets "stuck."
- **Global Hotkey:** Toggle visibility from anywhere using `Alt + Space`.

## 🛠 Tech Stack

- **Framework:** Electron
- **UI:** React (Context API for state management)
- **Animations:** Framer Motion (Physics-based springs)
- **Bundler:** Vite
- **Language:** TypeScript

## ⚙️ Advanced Customization

Accessible through the tabbed Settings menu (⚙):
- **Visuals:** Fine-tune blur, saturation, opacity, corner radius, and font styles (Modern, Pixel, Mono, Rounded).
- **Interaction:** Adjust animation stiffness, item spacing, and motion effects.
- **Layout:** Change screen anchor (Left/Right), panel width, and trigger zone thickness.

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/thejaustin/right-side-launcher.git
   ```
2. Install dependencies:
   ```bash
   cd right-side-launcher
   npm install
   ```
3. Run in development:
   ```bash
   npm run dev
   ```

## ⌨️ Keybindings

- **Alt + Space:** Toggle Launcher Visibility
- **Mouse Wheel:** Scroll App List
- **Right Click:** Pin/Unpin Apps

## License

MIT