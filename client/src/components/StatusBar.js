import React from 'react';
import { FaCircle } from 'react-icons/fa';

function StatusBar({ connectionState, isMessaging }) {
  const getStatusText = () => {
    if (isMessaging) return 'Sending Messages';
    
    switch (connectionState) {
      case 'connected':
        return 'Connected to WhatsApp';
      case 'connecting':
        return 'Connecting to WhatsApp...';
      case 'disconnected':
      default:
        return 'Disconnected from WhatsApp';
    }
  };
  
  const getStatusClass = () => {
    if (isMessaging) return 'connected';
    return connectionState;
  };

  return (
    <div className="status-bar">
      <div className="status-indicator">
        <span className={`status-dot ${getStatusClass()}`}></span>
        <span className="status-text">{getStatusText()}</span>
      </div>
      <div className="status-info">
        {isMessaging && <span>Messaging in progress...</span>}
      </div>
    </div>
  );
}

export default StatusBar;