import React from 'react';
import { FiUpload, FiSend, FiStopCircle } from 'react-icons/fi';

function MessageForm({
  formData,
  setFormData,
  credsFile,
  setCredsFile,
  messageFile,
  setMessageFile,
  startMessaging,
  stopMessaging,
  isMessaging
}) {
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleCredsFileChange = (e) => {
    if (e.target.files.length > 0) {
      setCredsFile(e.target.files[0]);
    }
  };
  
  const handleMessageFileChange = (e) => {
    if (e.target.files.length > 0) {
      setMessageFile(e.target.files[0]);
    }
  };

  return (
    <div className="message-form card">
      <h2>Send WhatsApp Messages</h2>
      
      <form onSubmit={(e) => { e.preventDefault(); startMessaging(); }}>
        <div className="form-group">
          <label>Target Type</label>
          <select
            name="targetType"
            className="form-control"
            value={formData.targetType}
            onChange={handleFormChange}
            disabled={isMessaging}
          >
            <option value="individual">Individual Contact</option>
            <option value="group">Group</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Target Phone Numbers (comma separated, with country code)</label>
          <textarea
            name="targetPhones"
            className="form-control"
            placeholder="e.g. +14155552671,+14155552672"
            value={formData.targetPhones}
            onChange={handleFormChange}
            disabled={isMessaging}
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label>Message Input Type</label>
          <select
            name="messageInputType"
            className="form-control"
            value={formData.messageInputType}
            onChange={handleFormChange}
            disabled={isMessaging}
          >
            <option value="text">Text Input</option>
            <option value="file">Text File</option>
          </select>
        </div>
        
        {formData.messageInputType === 'text' ? (
          <div className="form-group">
            <label>Message Text</label>
            <textarea
              name="messageText"
              className="form-control"
              placeholder="Enter your message here..."
              value={formData.messageText}
              onChange={handleFormChange}
              disabled={isMessaging}
              rows={5}
            />
          </div>
        ) : (
          <div className="form-group">
            <label>Message Text File (text file with message content)</label>
            <div className="file-input-wrapper">
              <button className="btn btn-secondary" disabled={isMessaging}>
                <FiUpload /> Choose Message File
              </button>
              <input
                type="file"
                accept=".txt"
                onChange={handleMessageFileChange}
                disabled={isMessaging}
              />
            </div>
            {messageFile && (
              <div className="file-name">Selected: {messageFile.name}</div>
            )}
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label>Delay Between Messages (seconds)</label>
            <input
              type="number"
              name="messageDelay"
              className="form-control"
              min="1"
              max="60"
              value={formData.messageDelay}
              onChange={handleFormChange}
              disabled={isMessaging}
            />
          </div>
          
          <div className="form-group">
            <label>WhatsApp Credentials (optional)</label>
            <div className="file-input-wrapper">
              <button className="btn btn-secondary" disabled={isMessaging}>
                <FiUpload /> Choose Creds File
              </button>
              <input
                type="file"
                accept=".json"
                onChange={handleCredsFileChange}
                disabled={isMessaging}
              />
            </div>
            {credsFile && (
              <div className="file-name">Selected: {credsFile.name}</div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label style={{display: 'flex', alignItems: 'center'}}>
              <input
                type="checkbox"
                name="enableRetry"
                checked={formData.enableRetry}
                onChange={handleFormChange}
                disabled={isMessaging}
                style={{marginRight: '10px'}}
              />
              Enable Retry for Failed Messages
            </label>
          </div>
          
          {formData.enableRetry && (
            <div className="form-group">
              <label>Maximum Retry Attempts</label>
              <input
                type="number"
                name="maxRetries"
                className="form-control"
                min="1"
                max="10"
                value={formData.maxRetries}
                onChange={handleFormChange}
                disabled={isMessaging}
              />
            </div>
          )}
        </div>
        
        <div className="button-group">
          {!isMessaging ? (
            <button type="submit" className="btn btn-primary">
              <FiSend /> Start Sending Messages
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-danger"
              onClick={stopMessaging}
            >
              <FiStopCircle /> Stop Sending Messages
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MessageForm;