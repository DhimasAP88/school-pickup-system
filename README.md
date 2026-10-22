# 🏫 Smart School Pickup Management System
A unified, **real-time** school dismissal and student pickup queue system integrated with a **Lobby TV Monitor Display**, **Security Gate Guard Portal**, **Homeroom Teacher Dismissal Portal**, and an **Automated School Bell & Text-to-Speech (TTS) Voice Announcer**.
Engineered to resolve gate congestion during school dismissal hours while ensuring a safe, organized, and transparent coordination flow between security guards, teachers, and waiting parents.
---
## 🌟 Key Features
### 1. 👮‍♂️ Security Gate Portal (3-Segment License Plate Input)
* **Standard Vehicle Registration Format**: Plate input is split into three dedicated segments:
  * `[ Region Code (Letters) ]` — `[ Police Number (Digits) ]` — `[ Series Suffix (Letters) ]`
* **Smart Auto-Focus Transition**: Automatically jumps to the next input field as characters are completed or upon pressing space/enter. Pressing backspace on an empty field navigates back.
* **Sibling Multi-Child Support**: Multiple students in different classes/grades can be linked to a single license plate.
* **Dismissal Time Discrepancy Selector**: If an older sibling and a younger sibling have different dismissal times (e.g., Grade 1 dismisses at 12:30 PM, Grade 4 at 02:00 PM), guards can select or uncheck specific children so only the eligible student is called.
### 2. 📺 Lobby TV Monitor Display (Main Kiosk Screen)
* **High-Visibility Kiosk Layout**: High-contrast, large-card typography designed for 10-foot viewing on large LCD/LED displays in waiting lounges or school lobbies.
* **Live Counting Stopwatch Timer**: Tracks elapsed waiting time in real time (`mm:ss`) starting from the exact second the car arrives at the gate.
* **Dynamic Color-Coded Status**:
  * 🟢 **Green** (< 5 mins): Newly arrived at the gate.
  * 🟡 **Amber** (5 – 10 mins): Student currently making their way to the pickup area.
  * 🔴 **Pulsing Red** (> 10 mins): Overdue wait time — alerts duty teachers to check on the student.
* **Digital Clock & Synchronized Calendar**: Accurate local time display.
### 3. 🔔 Automated School Bell Chime & Voice Announcer (TTS)
* Plays a dual-tone airport/school chime via the **Web Audio API** before voice playback starts.
* Fully automated Indonesian/English voice announcements using the browser's native **Web Speech API** (zero third-party API costs or subscription fees):
  > *"Attention. The parents of Muhammad Farhan from Class 4B and Aisyah Zahira from Class 1A have arrived at the pickup gate."*
### 4. 👩‍🏫 Homeroom Teacher Portal (Student Release)
* **Class Filter**: Teachers can filter the live queue by their assigned classroom (e.g., Class 1A only).
* **1-Click Dismissal (`✅ Picked Up / Complete`)**: As soon as the teacher escorts the child to their parents:
  * The student card is automatically removed from the Lobby TV screen in real time.
  * The system records the total wait duration and logs the dismissal into the daily archive.
### 5. 📊 Pickup History & Analytics (Daily Logs)
* Comprehensive audit trail tracking Arrival Time, Release Time, Total Wait Duration, License Plate, and Teacher in charge.
* Summary KPI cards: Total Students Picked Up, Average Wait Time, Shortest Wait, and Longest Queue Duration.
* **Export to CSV / Excel**: One-click download for administrative review and transportation logistics reporting.
* ### 6. 📂 Student Database & Spreadsheet Importer
* Manual CRUD management for students, parent contacts, and vehicle associations.
* **Bulk Spreadsheet Import**: Copy and paste tabular data directly from Google Sheets or Excel (CSV/TSV format) to register hundreds of students instantly.
* Downloadable CSV template included.
### 7. ⚡ Supabase Realtime Synchronization (WebSocket)
* Instant multi-device sync (< 100 ms) via Supabase Realtime replication. Changes submitted on the guard's tablet immediately update the lobby TV and classroom phones without page reloads.
---
## 🛠️ Tech Stack
* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Database & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL & Realtime WebSocket)
* **Audio Engine**: Web Audio API (Chime Synthesis) & Web Speech API (Text-to-Speech)
* **Icons**: [Lucide React](https://lucide.dev/)
---
## 🚀 Local Installation & Setup
### 1. Clone the Repository
```bash
git clone https://gitlab.com/USERNAME/school-pickup-system.git
cd school-pickup-system
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure Environment Variables
Create a `.env.local` file in the root project directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
### 4. Set Up the Supabase Database
1. Open your project dashboard at [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** tab $\rightarrow$ click **`+ New query`**.
3. Copy the entire contents of [`supabase-schema.sql`](./supabase-schema.sql) from this repository, paste it into the editor, and click **Run**.
### 5. Run the Application
```bash
# Development Mode
npm run dev
# Or Production Build
npm run build
npm start
```
Open your browser and navigate to `http://localhost:3000`.
---
## 🌐 Deployment Guide (Vercel)
This application can be deployed for free on **Vercel**:
1. Push your code to your GitLab or GitHub repository.
2. Log in to [vercel.com](https://vercel.com) using your GitLab account.
3. Click **Add New Project** $\rightarrow$ select `school-pickup-system`.
4. In the **Environment Variables** section, add:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Your application will be live in ~1 minute!
> **Important**: Always access the deployed application via **HTTPS** (automatically provided by Vercel) to ensure browser security policies allow automated Web Speech API (Text-to-Speech) audio playback on tablets and mobile devices.
---
## 📁 Project Structure
```text
├── src/
│   ├── app/
│   │   ├── globals.css         # Global Tailwind styles & scrollbar configs
│   │   ├── layout.tsx          # Root HTML layout and metadata
│   │   └── page.tsx            # Main application shell & realtime state orchestrator
│   ├── components/
│   │   ├── TvDisplayView.tsx      # Lobby TV Screen (Live Stopwatch & Student Cards)
│   │   ├── SecurityGateView.tsx   # Security Gate (3-Segment Plate Input & Sibling Selector)
│   │   ├── TeacherPortalView.tsx  # Teacher Portal (Classroom Filter & Dismissal Action)
│   │   ├── DailyLogsView.tsx      # Daily pickup records, metrics & CSV export
│   │   └── DataManagementView.tsx # Student database manager & Excel/CSV bulk importer
│   ├── lib/
│   │   ├── audio-announcer.ts  # Web Audio chime generator + Web Speech TTS engine
│   │   ├── mock-data.ts        # Seed data and offline local fallback
│   │   └── supabase.ts         # Supabase client initialization
│   └── types/
│       └── index.ts            # TypeScript interfaces and shared types
├── supabase-schema.sql         # Idempotent PostgreSQL schema & Realtime publication script
├── tailwind.config.js
└── package.json
```
---
## 📄 License
This project is licensed under the [MIT License](LICENSE). Feel free to use, customize, and deploy it for educational institutions and schools.
