import React, { useState } from 'react';

/**
 * A modal dialog for adding a friend by their numeric ID.
 * @param {object} props
 * @param {object} props.user - The current user's data.
 * @param {function} props.onClose - Function to call to close the modal.
 * @param {function} props.onAddFriend - Function to call with the friend's ID.
 * @param {string} [props.error] - An error message from the parent component.
 */
const AddFriendModal = ({ user, onClose, onAddFriend, error: serverError }) => {
  const [friendId, setFriendId] = useState('');
  const [clientError, setClientError] = useState('');

  const handleAdd = () => {
    if (!friendId.trim()) {
      setClientError('Please enter a friend ID.');
      return;
    }
    if (friendId.trim() === user.numericId) {
      setClientError("You can't add yourself as a friend.");
      return;
    }
    // The actual logic is in App.jsx, this just passes the ID up
    onAddFriend(friendId.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4">
        <h2 className="text-2xl font-bold mb-4">Add a Friend</h2>

        <div className="mb-6 bg-gray-100 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Your Unique ID is:</p>
          <p className="text-2xl font-mono font-bold text-indigo-600 tracking-widest">{user.numericId}</p>
          <p className="text-xs text-gray-500 mt-1">Share this ID with a friend to let them add you.</p>
        </div>

        <div className="mb-4">
          <label htmlFor="friendId" className="block text-sm font-medium text-gray-700">
            Friend's ID
          </label>
          <input
            type="text"
            id="friendId"
            value={friendId}
            onChange={(e) => {
              setFriendId(e.target.value);
              setClientError('');
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your friend's 6-digit ID"
          />
        </div>

        {(clientError || serverError) && (
          <p className="text-red-500 text-sm mb-4">{clientError || serverError}</p>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Friend
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;
