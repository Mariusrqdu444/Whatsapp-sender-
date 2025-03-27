import React from 'react';

function LogSection({ logs, clearLogs }) {
  const formatTimestamp = (date) => {
    return date.toLocaleTimeString();
  };

  return (
    <div className="logs-section card">
      <div className="logs-header">
        <h3>Activity Log</h3>
        <button className="btn btn-secondary" onClick={clearLogs}>
          Clear Logs
        </button>
      </div>
      <div className="logs-body">
        {logs.length === 0 ? (
          <p>No activity logs yet.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.type}`}>
              <span className="log-timestamp">[{formatTimestamp(log.timestamp)}]</span>
              {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LogSection;