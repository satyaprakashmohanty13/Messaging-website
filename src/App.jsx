import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { onValue, ref, get } from 'firebase/database';
import { auth, db, createUserProfile, addFriendByNumericId } from './firebase';

import Login from './components/Login';
import Header from './components/Header';
import ChatList from './components/ChatList';
import ChatView from './components/ChatView';
import AddFriendModal from './components/AddFriendModal';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
          try {
            await createUserProfile(currentUser);
          } catch (error) {
            console.error("Failed to create user profile:", error);
          }
        }

        const dbUserSnapshot = await get(userRef);
        if (dbUserSnapshot.exists()) {
          setUserData(dbUserSnapshot.val());
        }
        setUser(currentUser);

      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for real-time updates to conversations
  useEffect(() => {
    if (!userData) return;

    const conversationsRef = ref(db, `users/${userData.uid}/conversations`);
    const unsubscribe = onValue(conversationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const conversationsData = snapshot.val();
        const conversationsList = Object.values(conversationsData)
          .sort((a, b) => b.lastTime - a.lastTime); // Sort by most recent
        setConversations(conversationsList);
      } else {
        setConversations([]);
      }
    });

    return () => unsubscribe();
  }, [userData]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setConversations([]);
      setSelectedConversation(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleAddFriend = async (friendId) => {
    if (!userData) return;
    setModalError(''); // Clear previous errors
    try {
      const newRoomId = await addFriendByNumericId(userData, friendId);
      console.log("Friend added! New room ID:", newRoomId);
      // The conversation listener (to be added next) will automatically update the list.
      // We can optionally select the new chat here.
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding friend:", error);
      setModalError(error.message);
    }
  };

  const openAddFriendModal = () => {
    setModalError('');
    setIsModalOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {!user || !userData ? (
        <Login />
      ) : (
        <>
          <Header
            user={userData}
            onSignOut={handleSignOut}
            onAddFriend={openAddFriendModal}
          />
          <main className="flex flex-grow overflow-hidden">
            <div className="w-full md:w-1/3 lg:w-1/4 h-full flex-shrink-0">
              <ChatList
                user={userData}
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
              />
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4 h-full">
              <ChatView
                user={userData}
                conversation={selectedConversation}
              />
            </div>
          </main>
          {isModalOpen && (
            <AddFriendModal
              user={userData}
              onClose={() => setIsModalOpen(false)}
              onAddFriend={handleAddFriend}
              error={modalError}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
