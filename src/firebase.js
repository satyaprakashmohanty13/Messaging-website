import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, runTransaction, update, serverTimestamp, get, push } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQ4sTdy1dC4IyMJFC9Yz3bVEBSEU_sbHI",
  authDomain: "messaging-website-8cee3.firebaseapp.com",
  databaseURL: "https://messaging-website-8cee3-default-rtdb.firebaseio.com",
  projectId: "messaging-website-8cee3",
  storageBucket: "messaging-website-8cee3.firebasestorage.app",
  messagingSenderId: "1017918066104",
  appId: "1:1017918066104:web:823f87c4b2c3d4929ed34d",
  measurementId: "G-Q07MV0TB0H"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getDatabase(app);

/**
 * Creates a user profile in the database upon first sign-in.
 * Generates a unique, 6-digit numeric ID using a transaction.
 * @param {import('firebase/auth').User} user The user object from Firebase Auth.
 */
export const createUserProfile = async (user) => {
  const counterRef = ref(db, 'counters/users');
  let numericId;

  // Run a transaction to get a new unique ID.
  // This is a server-safe operation that prevents race conditions.
  await runTransaction(counterRef, (currentValue) => {
    // Initialize the counter if it doesn't exist.
    // Start from 100000 to ensure a 6-digit ID.
    const newValue = (currentValue || 100000) + 1;
    numericId = newValue;
    return newValue;
  });

  if (!numericId) {
    throw new Error("Failed to generate numeric ID.");
  }

  // Prepare the data for an atomic multi-path update.
  const userProfile = {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
    numericId: numericId.toString(),
  };

  const updates = {};
  updates[`/users/${user.uid}`] = userProfile;
  updates[`/ids/${numericId}`] = user.uid; // Reverse lookup for adding friends

  // Perform the atomic write to both paths.
  await update(ref(db), updates);
};

/**
 * Adds a friend by their numeric ID and creates a new conversation room.
 * @param {object} currentUserData - The current user's profile data from the DB.
 * @param {string} friendNumericId - The numeric ID of the friend to add.
 * @returns {Promise<string>} The ID of the newly created room.
 */
export const addFriendByNumericId = async (currentUserData, friendNumericId) => {
  // 1. Find the friend's UID from their numeric ID.
  const idRef = ref(db, `ids/${friendNumericId}`);
  const idSnapshot = await get(idRef);

  if (!idSnapshot.exists()) {
    throw new Error("User with this ID does not exist.");
  }

  const friendUid = idSnapshot.val();
  const currentUid = currentUserData.uid;

  if (friendUid === currentUid) {
    throw new Error("You cannot add yourself as a friend.");
  }

  // Check if they are already friends
  const friendCheckRef = ref(db, `users/${currentUid}/friends/${friendUid}`);
  const friendCheckSnap = await get(friendCheckRef);
  if(friendCheckSnap.exists()) {
    throw new Error("This user is already your friend.");
  }

  // 2. Fetch the friend's profile
  const friendProfileRef = ref(db, `users/${friendUid}`);
  const friendProfileSnap = await get(friendProfileRef);
  if (!friendProfileSnap.exists()) {
    throw new Error("Could not find the friend's profile data.");
  }
  const friendData = friendProfileSnap.val();

  // 3. Create a deterministic room ID.
  const roomId = currentUid < friendUid ? `${currentUid}_${friendUid}` : `${friendUid}_${currentUid}`;

  // 4. Prepare the data for atomic write.
  const conversationForCurrentUser = {
    roomId,
    lastMessage: "",
    lastTime: serverTimestamp(),
    unreadCount: 0,
    with: {
      uid: friendData.uid,
      displayName: friendData.displayName,
      photoURL: friendData.photoURL,
      numericId: friendData.numericId,
    }
  };

  const conversationForFriend = {
    roomId,
    lastMessage: "",
    lastTime: serverTimestamp(),
    unreadCount: 0,
    with: {
      uid: currentUserData.uid,
      displayName: currentUserData.displayName,
      photoURL: currentUserData.photoURL,
      numericId: currentUserData.numericId,
    }
  };

  const updates = {};
  updates[`/users/${currentUid}/conversations/${roomId}`] = conversationForCurrentUser;
  updates[`/users/${friendUid}/conversations/${roomId}`] = conversationForFriend;
  updates[`/users/${currentUid}/friends/${friendUid}`] = true;
  updates[`/users/${friendUid}/friends/${currentUid}`] = true;

  // 5. Perform atomic write.
  await update(ref(db), updates);

  return roomId;
};


export const sendMessage = async (roomId, fromUid, text) => {
  if (!text.trim()) return;

  const room_parts = roomId.split('_');
  const user1_uid = room_parts[0];
  const user2_uid = room_parts[1];

  // 1. Create the new message
  const messagesRef = ref(db, `rooms/${roomId}/messages`);
  const newMessage = {
    fromUid,
    text,
    timestamp: serverTimestamp(),
  };

  // 2. Prepare the updates for conversation metadata
  const updates = {};
  const lastMessageUpdate = {
    lastMessage: text,
    lastTime: serverTimestamp(),
    // We could also increment unread count here for the other user
  };

  updates[`/users/${user1_uid}/conversations/${roomId}/lastMessage`] = text;
  updates[`/users/${user1_uid}/conversations/${roomId}/lastTime`] = serverTimestamp();

  updates[`/users/${user2_uid}/conversations/${roomId}/lastMessage`] = text;
  updates[`/users/${user2_uid}/conversations/${roomId}/lastTime`] = serverTimestamp();


  // 3. Push the new message and update the conversation metadata atomically
  const newMessageRef = push(messagesRef);
  updates[`/rooms/${roomId}/messages/${newMessageRef.key}`] = newMessage;

  await update(ref(db), updates);
};

export { auth, db };
