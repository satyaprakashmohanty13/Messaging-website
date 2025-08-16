import React from 'react';

/**
 * The main header of the application.
 * @param {object} props
 * @param {object} props.user - The user data from the database.
 * @param {function} props.onSignOut - Function to call when the sign-out button is clicked.
 * @param {function} props.onAddFriend - Function to call to open the Add Friend modal.
 */
const Header = ({ user, onSignOut, onAddFriend }) => {
  return (
    <header className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-md flex-shrink-0">
      <h1 className="text-xl font-bold">Chatter</h1>
      <div className="flex items-center">
        <button
          onClick={onAddFriend}
          className="mr-6 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Add Friend
        </button>
        <div className="text-right mr-4">
          <div className="font-semibold">{user.displayName}</div>
          <div className="text-xs text-indigo-200">ID: {user.numericId}</div>
        </div>
        <img
          src={user.photoURL}
          alt="User Avatar"
          className="w-10 h-10 rounded-full border-2 border-indigo-200"
        />
        <button
          onClick={onSignOut}
          title="Sign Out"
          className="ml-4 p-2 rounded-full hover:bg-indigo-700 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
