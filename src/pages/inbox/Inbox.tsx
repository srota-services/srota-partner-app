/**
 * Inbox page — notifications placeholder
 */
import React from 'react';
import '../../styles/pages/inbox/Inbox.css';

const Inbox: React.FC = () => {
  return (
    <div className="inbox-page">
      <div className="inbox-header">
        <h1 className="inbox-title">Inbox</h1>
        <p className="inbox-subtitle">Messages and notifications</p>
      </div>

      <div className="empty-state">
        <p className="empty-state-message">No messages yet.</p>
      </div>
    </div>
  );
};

export default Inbox;
