import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { sendMessage } from '../firebase';

/**
 * Displays the main chat window for a selected conversation.
 * @param {object} props
 * @param {object} props.user - The current user's data.
 * @param {object} props.conversation - The selected conversation object.
 */
const ChatView = ({ user, conversation }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const messagesRef = ref(db, `rooms/${conversation.roomId}/messages`);
    const messagesQuery = query(messagesRef, limitToLast(50));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        setMessages(Object.values(messagesData));
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    try {
      await sendMessage(conversation.roomId, user.uid, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Select a chat to start messaging</p>
          <p className="mt-2 text-sm">Or, add a new friend to create a new chat!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <header className="flex items-center p-4 border-b border-gray-200 flex-shrink-0">
        <img src={conversation.with.photoURL} alt="avatar" className="w-10 h-10 rounded-full mr-4" />
        <h2 className="text-lg font-semibold">{conversation.with.displayName}</h2>
      </header>

      {/* Message List */}
      <main className="flex-grow p-4 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="text-center">Loading messages...</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.fromUid === user.uid ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.fromUid === user.uid ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Message Input Form */}
      <footer className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="ml-4 flex-shrink-0 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatView;
