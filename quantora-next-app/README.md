# Quantora Analytics - Next.js 15+ Enterprise Platform

Welcome to **Quantora Analytics**, a world-class, production-grade open-access digital research ecosystem, public intelligence platform, and collaborative innovation network.

Developed in New Delhi, India, this platform democratizes research and public macro intelligence by enabling students, independent analysts, and academics to publish, download, and review macroeconomic and scientific papers without barriers.

---

## 🚀 Key Modules Built

1. **Cinematic Hero Portal (`/`):** Full-screen landing page featuring glowing canvas network diagrams, live sector performance indicators, active multi-asset tickers, and pioneering contributor profiles.
2. **Dynamic Research Library (`/library`):** Searchable index with dynamic categorization filter hooks, tabbed index toggles (Verified Research vs. Unreviewed Public Index), and floating badge indicators.
3. **AI Semantic Search Toggle:** Toggle conceptual concept scans powered by custom vector representations.
4. **Google Gemini AI Assistant (`/ai-assistant`):** Implements an OpenAI-style chatbot workspace deeply integrated with Google Gemini AI (`GEMINI_API_KEY`) for summarizing papers, simplifying theories, and generating ideas. Includes bulletproof local mock fallbacks.
5. **Macro Insights Feed (`/insights`):** Social intelligence stream supporting instant analytical opinion postings, trending macroeconomic hashtags, and live peer upvotes.
6. **Open R&D Lab (`/rnd-lab`):** Innovation challenge marketplace featuring sponsored challenges (WEF Rare-Earth Logistics, NABARD agricultural lines audit, Quantora Graph Transformers) where researchers can form teams and submit deployed codebases.
7. **Institutional Autonomy Dashboard:** Live statistical indices validating platform metrics (Uploads, Review queues, active analysts).
8. **Knowledge Accessibility Suite:** Browser-native Text-to-Speech (TTS) abstract reading panel and a simulated lexical matrix translation terminal to compile abstracts in Hindi, German, and more.

---

## 🛠️ Tech Stack Architecture

* **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons, Framer Motion animations.
* **Database ORM:** Prisma Client caching connections across hot-reloading loops.
* **Database Engine:** SQLite (Local Dev fallback `.db`) & PostgreSQL (Supabase ready).
* **AI Integration:** Google Gemini AI API SDK (`@google/generative-ai`) and dynamic NLP tag matching.
* **Authentication:** Clerk & next-auth compatible structure.

---

## ⚙️ Quick Start Installation

Follow these three commands to run the entire enterprise suite locally:

### 1. Configure the Environment
Copy the example environment settings:
```bash
cp .env.example .env
```
Inside your new `.env` file, optionally supply your custom `GEMINI_API_KEY` (registered via [Google AI Studio](https://aistudio.google.com/)). If left empty, the application gracefully activates elegant local mock AI fallbacks to run offline instantly.

### 2. Push the Database Schema
Generate the ORM mappings and initialize your local SQLite database in one command:
```bash
npx prisma db push
```
This creates the file `/prisma/dev.db` instantly with zero manual SQL configuration.

### 3. Launch Deployed Environment
Start your local Next.js App Router hot-reload server:
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to explore the system!

---

## 📄 License & Autonomy
Quantora Analytics operates under the MIT Open-Source License. Engineered under an environmentally responsible glassmorphic dark-theme optimizing session carbon footprints.
