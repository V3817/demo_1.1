# WebRev AI - AI Website Auditor & Redesigner

WebRev AI is a sophisticated tool that audits websites for UI/UX, SEO, and Performance, and generates **Interactive Live Redesigns** using AI.

## 🚀 Key Features

*   **AI Audit Engine**: Analyzes HTML structure, content, and meta tags (`cheerio` + `llama-3.3-70b`).
*   **Interactive Redesign**: Generates a live visual preview of a redesigned version of the site. You can refine it with natural language (e.g., "Make it dark mode", "Add a chatbot").
*   **Visual Preview**: Renders a Hero Section, Feature Grid, and Testimonials using the AI's design system.
*   **PDF Export**: Native browser-based high-fidelity PDF report generation.
*   **Audit History**: Locally saves previous audits for quick access.
*   **Technical Roadmap**: Generates a step-by-step migration plan and tech stack recommendation.
*   **Hardened Security**: Includes Rate Limiting, Input Validation (Zod), and Error Boundaries.

## 🛠️ Tech Stack

*   **Framework**: Next.js 15 (App Router)
*   **Styling**: TailwindCSS + Shadcn UI
*   **AI Model**: Groq (`llama-3.3-70b-versatile`)
*   **Validation**: Zod
*   **Icons**: Lucide React

## 🏃‍♂️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd webrev-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    npm install --legacy-peer-deps
    ```

3.  **Environment Setup:**
    Create a `.env.local` file (or just rely on the hardcoded key for dev):
    ```env
    GROQ_API_KEY=gsk_...
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) (or port 3001/3002 if 3000 is taken).

## 📝 Usage Guide

1.  **Login**:
    *   The app is protected. Use one of the **3 Demo Users**:
    *   **Admin**: `admin@webrev.ai` / `admin123`
    *   **User1**: `user1@webrev.ai` / `user123`
    *   **User2**: `user2@webrev.ai` / `user2123`
2.  **Enter URL**: Type any website URL (e.g., `https://www.rabitat.com`) and click **Analyze Site**.
3.  **View Audit**: See scores for UI, SEO, and Performance.
4.  **Explore Redesign**: Scroll down to "Proposed Redesign".
    *   **Customize**: Type instructions like "Make it minimalist" or "Use blue branding" in the input box to instantly update the design.
4.  **Check Roadmap**: Review the technical steps to implement the changes.
5.  **Export/Save**:
    *   Click **"Print / Save PDF"** to download a report.
    *   Click the **History Icon** (top left) to see past scans.

## 🛡️ Architecture & Safety

*   **Client-Side Safety**: Dashboard is wrapped in a Global Error Boundary to prevent crashes.
*   **API Security**:
    *   **Rate Limiting**: Limits requests per IP (in-memory for MVP).
    *   **Input Validation**: All API inputs and AI outputs are validated against strict Zod schemas.
    *   **Scraper Guardrails**: Limits payload size (2MB) and timeouts (15s) to prevent DOS.

## 🚢 Deployment

Efficiently deployable to **Vercel**:
1.  Push to GitHub.
2.  Import project in Vercel.
3.  Add `GROQ_API_KEY` in Vercel Environment Variables.
4.  Deploy!
# demo_1.1
