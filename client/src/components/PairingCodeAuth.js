import React from 'react';

function PairingCodeAuth({ pairingCode, onCheckStatus }) {
  return (
    <div className="card">
      <h2>Pair with WhatsApp</h2>
      
      <div className="pairing-instructions">
        <p>Follow these steps to pair with WhatsApp:</p>
        <ol>
          <li>Open WhatsApp on your phone</li>
          <li>Tap on <strong>Menu</strong> or <strong>Settings</strong></li>
          <li>Tap <strong>Linked Devices</strong></li>
          <li>Tap <strong>Link a Device</strong></li>
          <li>When prompted for a QR code, tap <strong>Link with phone number instead</strong></li>
          <li>Enter this 8-digit pairing code:</li>
        </ol>
      </div>
      
      <div className="code-display">
        <h3>{pairingCode}</h3>
      </div>
      
      <p>
        Once entered, WhatsApp will connect automatically. If you can't enter the code, 
        you can <strong>refresh</strong> to generate a new one.
      </p>
      
      <button 
        className="btn btn-primary check-status-btn" 
        onClick={onCheckStatus}
      >
        Check Connection Status
      </button>
    </div>
  );
}

export default PairingCodeAuth;