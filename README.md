
# 🔮 Quizzle

Welcome to Quizzle! A fun, interactive, and open-source platform for hosting real-time quizzes for your events, meetups, or classrooms. Think "Kahoot-style," but 100% yours.

Built with **React** (Vite), **Supabase**, and **Tailwind CSS**.
## Features
* **✨ Create Quizzes:** An intuitive UI to create quizzes with multiple-choice questions.
* **🚀 Host Live Sessions:** Generate a unique PIN for your event.
* **📱 Player-Ready:** Participants join from their mobile phones using the PIN.
* **📊 Real-time Leaderboards:** Watch the scores change live after each question.
* **🏆 Animated Podium:** A fun, animated winner-reveal screen to celebrate the top 3.
* **🔒 Supabase Backend:** All powered by a fast, reliable, and scalable Supabase backend.
## 🚀 Getting Started (Self-Hosting)
You can easily host your own instance of Quizzle for your events.
### Prerequisites
* **Node.js** (v18 or later)
* **`npm`** (or `yarn` / `pnpm`)
* A **Supabase Account** (a free one is perfect to start)

### 1. Set up your Supabase Project
Your Supabase project will store all your quizzes, questions, and player data.
1. **Create a Project:** Go to [supabase.com](https://supabase.com) and create a new project.
2. **Database Schema:** You need to create the database tables. Go to the **SQL Editor** in your new project and run the schema script located in `supabase/schema.sql` (Note: If this file doesn't exist, you'll need to create the tables manually. See `supabase/migrations` for guidance).
3. **Get API Keys:** Navigate to **Project Settings** > **API**. You will need three values:
   * `Project URL`
   * `Project API keys` (the `publishable key` and `project ID`)

### 2. Set up your Local Environment
1. **Clone the Repository:**
```
git clone https://github.com/AyushAwasthi2384/quizzle.git
cd quizzle
```
2. **Install Dependencies:**
```
npm install
```
3. **Create Environment File:**
Copy the example environment file.
```
cp .env.example .env
```
4. **Add Supabase Keys:**
Open the `.env` file you just created and add the keys from Step 1:

```
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
```
### 3. Run the App
You're all set! Start the development server:
```
npm run dev
```
Your Quizzle app should now be running locally, connected to your Supabase project.

## 🚢 Deployment
You can deploy this project to any platform that supports React/Vite applications (like Vercel, Netlify, or AWS Amplify).
**Crucial Step:** During deployment, you must set the `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables in your deployment platform's settings.
## 🤝 Contributing
We love contributions! This project is open-source and a great way to practice with React and Supabase and help us improve.
### Local Development for Contributors

Follow these steps to set up your local development environment to contribute:
1. **Fork** the repository.
2. **Clone** your fork:
```

git clone https://github.com/AyushAwasthi2384/quizzle.git
cd quizzle
```
3. **Install** dependencies:
```
npm i
```
4. **Run** the development server:
```
npm run dev
```

### Contribution Flow
1. Create a new branch for your feature (`git checkout -b feat/my-cool-feature`).
2. Make your changes and commit them with a clear message.
3. Push your branch to your fork (`git push origin feat/my-cool-feature`).
4. Open a **Pull Request** from your fork to the main `quizzle` repository.
5. We'll review and approve it!

## 🛠 Tech Stack
* **Framework:** [React](https://react.dev/) (via [Vite](https://vitejs.dev/))
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Backend:** [Supabase](https://supabase.com/) (Database, Auth, Realtime)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
