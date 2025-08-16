import React from 'react';

/**
 * Displays the list of user's conversations.
 * @param {object} props
 * @param {Array} props.conversations - The list of conversations, sorted by last message time.
 * @param {object} props.selectedConversation - The currently selected conversation.
 * @param {function} props.onSelectConversation - Function to call when a conversation is selected.
 */
const ChatList = ({ conversations, selectedConversation, onSelectConversation }) => {

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        {conversations && conversations.length > 0 ? (
          <ul>
            {conversations.map((convo) => (
              <li
                key={convo.roomId}
                onClick={() => onSelectConversation(convo)}
                className={`p-4 border-b border-gray-200 hover:bg-gray-100 cursor-pointer ${selectedConversation?.roomId === convo.roomId ? 'bg-indigo-100' : ''}`}
              >
                <div className="flex items-center">
                  <img src={convo.with.photoURL} alt="avatar" className="w-12 h-12 rounded-full mr-3" />
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{convo.with.displayName}</span>
                      <span className="text-xs text-gray-500">{formatDate(convo.lastTime)}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {convo.lastMessage || 'No messages yet...'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center text-gray-500 mt-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-4 font-semibold">No chats yet</p>
            <p className="mt-1 text-sm">Add a friend to start a conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
