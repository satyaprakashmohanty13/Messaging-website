# Firebase Realtime Messaging App

This is a single-page messaging web application built with React and Firebase. It allows users to sign in with their Google account, add friends using a unique numeric ID, and engage in real-time 1:1 chats.

## Features

- **Authentication:** Secure sign-in with Google using Firebase Authentication.
- **Real-time Chat:** Instant messaging powered by Firebase Realtime Database.
- **Unique User IDs:** Each user gets a short, collision-safe, 6-digit numeric ID.
- **Friend System:** Users can add friends by ID to start conversations.
- **Secure by Default:** Uses Firebase Security Rules to protect user data.
- **Responsive UI:** A clean, mobile-friendly interface built with Tailwind CSS.

## Tech Stack

- **Frontend:** React (v18+)
- **Backend:** Firebase
  - Firebase Authentication
  - Firebase Realtime Database
  - Firebase Hosting
- **Styling:** Tailwind CSS

---

## How It Works

### Unique Numeric ID Generation

A key feature of this application is providing each user with a short, unique numeric ID that they can share with friends. Generating these IDs without collisions is critical.

This project solves this problem using a **Firebase Realtime Database transaction**.

1.  A global counter is stored in the database at the path `/counters/users`.
2.  When a new user signs up, the `createUserProfile` function is triggered.
3.  This function executes a `runTransaction` operation on the `/counters/users` path.
4.  A transaction is a server-safe operation that prevents race conditions. If multiple users sign up at the exact same time, Firebase's backend ensures that the transaction is executed atomically for each user, one after another.
5.  Inside the transaction, we read the current counter value (or initialize it to `100000` for the first user), increment it by one, and return the new value. This new value becomes the user's unique `numericId`.
6.  This ID is then saved to the user's profile at `/users/{uid}/numericId` and a reverse mapping is created at `/ids/{numericId}` to allow for easy lookups when adding a friend.

This method guarantees that every user receives a unique, sequential ID in a scalable and safe manner.

---

## Firebase Setup

Before you can run this application, you need to create a Firebase project and configure it.

1.  **Create a Firebase Project:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Click "Add project" and follow the on-screen instructions.

2.  **Enable Authentication:**
    - In your project, go to the **Authentication** section.
    - Click the **Sign-in method** tab and enable the **Google** provider. Provide a project support email.

3.  **Set up Realtime Database:**
    - Go to the **Realtime Database** section.
    - Click "Create Database" and choose a location.
    - Start in **locked mode**. The `database.rules.json` file in this project should be deployed to secure your data.

4.  **Register a Web App:**
    - Go to Project Overview and click the **Web** icon (`</>`).
    - Register the app and copy the `firebaseConfig` object.

5.  **Configure Firebase in the App:**
    - The Firebase configuration is located in `src/firebase.js`.
    - For this project, the provided config has been hardcoded. For your own version, you should replace it with your own `firebaseConfig` object.
    - **Best Practice:** For production apps, use environment variables (e.g., a `.env` file) to store these keys and prevent them from being committed to source control.

---

## Local Development

1.  **Clone the repository and navigate into it.**
2.  **Install dependencies:** `npm install`
3.  **Run the app:** `npm start`
    - The application will be running at `http://localhost:3000`.

---

## Deployment

This app is configured for deployment with Firebase Hosting.

1.  **Install Firebase CLI:** `npm install -g firebase-tools`
2.  **Login to Firebase:** `firebase login`
3.  **Link the project:** The `.firebaserc` file is already configured with the project ID. If you are using a different Firebase project, run `firebase use --add` and select your project.
4.  **Deploy:**
    - **Build the React app:** `npm run build`
    - **Deploy to Firebase:** `firebase deploy`
    - This command will deploy the hosting configuration in `firebase.json`, the security rules in `database.rules.json`, and the built application from the `build/` directory.

Your app will be live at `https://<your-project-id>.web.app`.

---

## Production Considerations & Limitations

-   **Security Rules Caveat:** The current security rules for `/users/{uid}` allow any authenticated user to read a user's profile data. This was necessary to allow the client-side "add friend" logic to work. However, this exposes the list of a user's friends and conversations (though not the message content itself).
    -   **Recommendation:** In a production environment, you should make `/users/{uid}` readable only by the owner (`".read": "auth.uid === $uid"`) and move the "add friend" logic to a **Cloud Function**. The Cloud Function would run with admin privileges, allowing it to securely read any user's profile and create the conversation entries for both users.

-   **Message Pagination:** The application currently fetches the last 50 messages in a conversation using `limitToLast(50)`. This is a basic form of pagination to prevent loading thousands of messages at once.
    -   **Recommendation:** For a more robust solution, implement infinite scrolling where older messages are fetched as the user scrolls to the top of the chat window.

-   **Data Retention:** This application stores messages indefinitely.
    -   **Recommendation:** For a production app, consider implementing a data retention policy. You could use a scheduled Cloud Function to periodically delete messages older than a certain age (e.g., 90 days) to manage storage costs and user privacy.

-   **Error Handling:** The app has basic error handling for adding friends, but it could be improved with more user-friendly feedback, such as toast notifications instead of just console logs or simple text errors.
