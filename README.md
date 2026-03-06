# WikipIA - The Fact-Checking Agency

[![Live Demo](https://img.shields.io/badge/View_Live-Vercel-%23007acc?style=for-the-badge&logo=vercel)](https://your-vercel-link.app)
[![Tech](https://img.shields.io/badge/AI-Gemini_3_Flash-orange?style=for-the-badge)](https://ai.google.dev/)
[![GitHub](https://img.shields.io/badge/Source_Code-GitHub-black?style=for-the-badge&logo=github)](https://github.com/KMV531/WikipIA)

**WikipIA** is a high-speed critical thinking game designed for students. In a 120-second sprint, players act as secret agents tasked with spotting "hallucinations" and fake news generated in real-time by AI based on their favorite topics.

![WikipIA Screenshot](./public/screenshot.png)

## Game Concept

- **JIT Generation**: The AI creates unique missions on-the-fly based on the theme selected by the student.
- **120s Sprint**: A global countdown to test reflexes, reading comprehension, and critical thinking.
- **Smart Verification**: A secondary AI engine analyzes user input to validate corrections, handling semantic variations and typos.
- **Zero Latency**: Implemented a background buffering system (Question Queuing) to ensure a seamless experience despite AI generation times.

## Tech Stack

| Technology       | Role                                     |
| ---------------- | ---------------------------------------- |
| **Next.js**      | Framework & API Routes                   |
| **Gemini**       | Live Generation & Verification (JIT)     |
| **Tailwind CSS** | Cyber-Agent UI & Responsive Design       |
| **MongoDB**      | Real-time Leaderboard & Data Persistence |
| **GSAP**         | Smooth UI transitions and Animations     |
| **Zustand**      | Global State Management                  |
| **Lucide React** | Professional Iconography                 |

## AI Pipeline (Prompt Engineering)

The project architecture features two distinct AI pipelines:

1. **The Generator**: A complex prompt utilizing **Negative Prompting** to avoid repetitive facts (e.g., banning common clichés) and forcing high-quality content diversity.
2. **The Auditor**: A semantic verification engine that compares the student's answer with the hidden truth to award points based on meaning rather than just keywords.

## The Team

This project was built by a team of three during the 2026 AI Hackathon at Efrei Bordeaux:

- **Vinny** ([@KMV531](https://github.com/KMV531))
  - _Lead UI/UX & Frontend Developer_
  - Designed the "Top Secret" interface, game logic, and the background buffering system.
- **Mathieu** ([@mattthieu195](https://github.com/mattthieu195))
  - _Prompt Engineer (Generation)_
  - Architected the mission generation engine and implemented diversity constraints.
- **Maxime** ([@MarmeMaxime](https://github.com/MarmeMaxime))
  - _Prompt Engineer (Verification)_
  - Developed the answer analysis system and semantic validation logic.

## Developer Setup

1. Clone the repository:

   ```bash
   git clone [https://github.com/KMV531/WikipIA.git](https://github.com/KMV531/WikipIA.git)
   ```

2. Install dependencies:

   ```bash
      npm install
   ```

3. Configure environment variables (.env):

   ```bash
   GEMINI_API_KEY=your_key_here
   MONGODB_URI=your_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
