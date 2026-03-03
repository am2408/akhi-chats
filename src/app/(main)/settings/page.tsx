import React from 'react';

const SettingsPage = () => {
    return (
        <div className="settings-container">
            <h1 className="settings-title">User Settings</h1>
            <div className="settings-options">
                <div className="setting-option">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" placeholder="Enter your username" />
                </div>
                <div className="setting-option">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" placeholder="Enter your email" />
                </div>
                <div className="setting-option">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="Change your password" />
                </div>
                <div className="setting-option">
                    <label htmlFor="notifications">Notifications</label>
                    <input type="checkbox" id="notifications" />
                </div>
                <button className="save-settings-button">Save Changes</button>
            </div>
        </div>
    );
};

export default SettingsPage;