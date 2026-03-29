
# Cricket Blockbuster

Predict cricket match results and climb the global leaderboard using AI-powered insights.

## Getting Started

1.  **Local Development**: Run `npm run dev` to start the development server at `http://localhost:9002`.
2.  **Configuration**: Ensure your Firebase project is set up and the `src/firebase/config.ts` matches your project settings.
3.  **AI Setup**: 
    - Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
    - Create a `.env` file in the root directory and add: `GEMINI_API_KEY=your_key_here`.

## Deployment

The easiest way to publish this app is using **Firebase App Hosting**, which is specifically designed for Next.js applications.

### Option 1: Firebase App Hosting (Recommended)
1.  Push your code to a GitHub repository.
2.  Go to the [Firebase Console](https://console.firebase.google.com/) and navigate to **App Hosting**.
3.  Click **Get Started** and connect your GitHub repository.
4.  **Environment Variables**: After the backend is created, go to the **Environment Variables** tab in the Firebase Console and add your `GEMINI_API_KEY`.
5.  Firebase will automatically handle the build and deployment process.

### Option 2: Firebase CLI
If you prefer using the terminal:
1.  Install the Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize App Hosting: `firebase apphosting:backends:create`
4.  Follow the prompts to link your repository and deploy.

## CRITICAL: Authorized Domains
If you experience a "domain name error" when signing in:
1.  Go to **Firebase Console > Authentication > Settings > Authorized Domains**.
2.  Add your public URL (e.g., `your-app-id.web.app` or your custom domain `blockbuster.work`).
3.  Also ensure `localhost` is added for local development.

## Core Features
- **AI Predictions**: Leveraging Google Gemini via Genkit to provide probability-based match forecasts.
- **Universal Guest Account**: A shared community profile allowing anonymous users to compete collectively.
- **Pro Profiles**: Secure, passwordless email login for users to maintain their own unique ranking.
- **Real-time Leaderboard**: Dynamic rankings based on prediction accuracy and total points earned (2 points per correct prediction, 3 for high-value games).
- **Match Cutoffs**: Automated system that locks predictions 1 hour before match start times.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Email Link & Anonymous)
- **AI**: Genkit with Gemini 2.5 Flash
- **Styling**: Tailwind CSS & ShadCN UI
