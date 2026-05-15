<div align="center">

# Open Component Studio
### Truly Open • Forever Free • Local First

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)

**The premier AI studio for high-fidelity UI generation—completely private and powered by your own keys.**

[Launch Studio](https://open-component.vercel.app) • [View Pitch Report](./PITCH_REPORT.md) • [Documentation](#setup)

</div>

---

## 🎬 The Demo


https://github.com/user-attachments/assets/1fb8d24e-dd9a-4493-a01f-f3d82de6d502


## 💎 Why Open Component?

Most AI tools focus on building "whole apps" behind expensive subscriptions and cloud-locked code. **Open Component Studio** is different. We are 100% focused on the **Art of the Component**.

- **BYOK Architecture**: Bring your own API keys. Supports Gemini, Claude, GPT-4, Groq, and more.
- **Local-First Privacy**: Your prompts, designs, and keys are stored in *your* browser's IndexedDB. No backend, no tracking.
- **Magic Tweaks**: Refine CSS and logic in real-time. Patch generated code without full reloads.
- **Quietly Editorial**: Every component adheres to a professional, minimalist aesthetic by default.

---

## 🛠 Features

### 🎨 Design System Orchestration
Define your project's soul once. The AI generates a unique, cohesive set of design tokens (colors, typography, motion) that govern every component you build.

### ⚡ Universal AI Connectivity
Switch between providers on the fly. Compare outputs from Claude 3.5 Sonnet, Gemini 1.5 Pro, and GPT-4o, or run 100% offline using **Ollama** or **LM Studio**.

### 🪄 Magic Refinement
Don't like the border radius? Want to change the accent color? Use the visual Tweak Panel to modify the component's CSS variables instantly.

### 📦 Pro Export
Download clean, production-ready React code styled with Tailwind CSS and animated with GSAP.

---

## 🚀 Setup

### Prerequisites
- Node.js (v18+)
- An API Key from [Google AI Studio](https://aistudio.google.com/), [Anthropic](https://console.anthropic.com/), or [OpenAI](https://platform.openai.com/).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/open-component.git
   cd open-component
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` and enter your API keys in the **Settings** menu.

---

## 🏗 Tech Stack

- **Core**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, CSS Variables
- **Animations**: GSAP (GreenSock)
- **AI Orchestration**: Vercel AI SDK
- **Persistence**: IndexedDB (Local-first)

---

## 🤝 Contributing

We welcome contributions! Whether it's adding new AI providers, improving the "Anti-Slop" guardrails, or refining the UI, feel free to open a PR.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
Built with ❤️ for the open-source community.
</div>
