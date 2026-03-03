import React from 'react';

const FriendsPage = () => {
    return (
        <div className="friends-page">
            <h1 className="text-2xl font-bold">Friends List</h1>
            <ul className="friends-list">
                {/* Placeholder for friends list items */}
                <li className="friend-item">Friend 1</li>
                <li className="friend-item">Friend 2</li>
                <li className="friend-item">Friend 3</li>
            </ul>
        </div>
    );
};

export default FriendsPage;