# Cricket Oracle

Predict cricket match results and climb the global leaderboard using AI-powered insights.

## Getting Started

1.  **Local Development**: Run `npm run dev` to start the development server at `http://localhost:9002`.
2.  **Configuration**: Ensure your Firebase project is set up and the `src/firebase/config.ts` matches your project settings.

## Deployment

The easiest way to publish this app is using **Firebase App Hosting**, which is specifically designed for Next.js applications.

### Option 1: Firebase App Hosting (Recommended)
1.  Push your code to a GitHub repository.
2.  Go to the [Firebase Console](https://console.firebase.google.com/) and navigate to **App Hosting**.
3.  Click **Get Started** and connect your GitHub repository.
4.  Firebase will automatically detect the Next.js framework and handle the build and deployment process.
5.  **Environment Variables**: Add your `GEMINI_API_KEY` in the Firebase Console under the App Hosting backend settings to enable AI features.

### Option 2: Firebase CLI
If you prefer using the terminal:
1.  Install the Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize App Hosting: `firebase apphosting:backends:create`
4.  Follow the prompts to link your repository and deploy.

## Finding Your Public URL
Once your deployment is successful:
1.  Go to the **App Hosting** section of your Firebase Console.
2.  Select your backend.
3.  You will see a **Domain** or **URL** listed (e.g., `your-app-id.web.app`). This is your public link!
4.  You can also connect a custom domain in the **Settings** tab of your App Hosting backend.

## Core Features
- **AI Predictions**: Leveraging Google Gemini via Genkit to provide probability-based match forecasts.
- **Universal Guest Account**: A shared community profile allowing anonymous users to compete collectively.
- **Pro Profiles**: Secure, passwordless email login for users to maintain their own unique ranking.
- **Real-time Leaderboard**: Dynamic rankings based on prediction accuracy and total points earned.
- **Match Cutoffs**: Automated system that locks predictions 1 hour before match start times.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Email Link & Anonymous)
- **AI**: Genkit with Gemini 2.5 Flash
- **Styling**: Tailwind CSS & ShadCN UI
