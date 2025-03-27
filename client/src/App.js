import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp } from 'react-icons/fa';
import './App.css';
import MessageForm from './components/MessageForm';
import StatusBar from './components/StatusBar';
import LogSection from './components/LogSection';
import PairingCodeAuth from './components/PairingCodeAuth';

function App() {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [isMessaging, setIsMessaging] = useState(false);
  const [logs, setLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [authStep, setAuthStep] = useState('phone');
  const [formData, setFormData] = useState({
    userPhone: '',
    targetType: 'individual',
    targetPhones: '',
    messageInputType: 'text',
    messageText: '',
    messageDelay: 1,
    enableRetry: false,
    maxRetries: 3,
  });
  
  const [credsFile, setCredsFile] = useState(null);
  const [messageFile, setMessageFile] = useState(null);
  
  // Fetch WhatsApp status on mount and every 5 seconds
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const checkStatus = async () => {
    try {
      const response = await axios.get('/api/status');
      setConnectionState(response.data.status);
      
      // If we're connected, move to messaging step
      if (response.data.status === 'connected' && authStep !== 'messaging') {
        setAuthStep('messaging');
        addLog('Connected to WhatsApp', 'success');
      }
      
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    }
  };
  
  const generatePairingCode = async () => {
    try {
      if (!formData.userPhone) {
        showError('Please enter your phone number');
        return;
      }
      
      addLog(`Generating pairing code for ${formData.userPhone}...`, 'info');
      
      const response = await axios.post('/api/pairing', {
        phoneNumber: formData.userPhone
      });
      
      setPairingCode(response.data.pairingCode);
      setAuthStep('pairing');
      addLog(`Generated pairing code: ${response.data.pairingCode}`, 'success');
      
    } catch (error) {
      console.error('Error generating pairing code:', error);
      showError(error.response?.data?.error || 'Failed to generate pairing code');
    }
  };
  
  const startMessaging = async () => {
    try {
      if (isMessaging) {
        showError('Already sending messages');
        return;
      }
      
      if (!validateForm()) {
        return;
      }
      
      setIsMessaging(true);
      addLog('Starting WhatsApp messaging session...', 'info');
      
      const formDataObj = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });
      
      // Add files if present
      if (credsFile) {
        formDataObj.append('credsFile', credsFile);
      }
      
      if (messageFile && formData.messageInputType === 'file') {
        formDataObj.append('messageFile', messageFile);
      }
      
      const response = await axios.post('/api/start', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      addLog('WhatsApp messaging session started', 'success');
      addLog(`Sending messages to ${formData.targetPhones.split(',').length} recipients`, 'info');
      
    } catch (error) {
      console.error('Error starting WhatsApp session:', error);
      showError(error.response?.data?.error || 'Failed to start WhatsApp session');
      setIsMessaging(false);
    }
  };
  
  const stopMessaging = async () => {
    try {
      setIsMessaging(false);
      addLog('Stopping WhatsApp messaging session...', 'info');
      
      const response = await axios.post('/api/stop');
      
      addLog('WhatsApp messaging session stopped', 'success');
      
    } catch (error) {
      console.error('Error stopping WhatsApp session:', error);
      showError(error.response?.data?.error || 'Failed to stop WhatsApp session');
    }
  };
  
  const validateForm = () => {
    if (!formData.targetPhones) {
      showError('Please enter target phone numbers');
      return false;
    }
    
    if (formData.messageInputType === 'text' && !formData.messageText) {
      showError('Please enter a message text');
      return false;
    }
    
    if (formData.messageInputType === 'file' && !messageFile) {
      showError('Please upload a message file');
      return false;
    }
    
    return true;
  };
  
  const addLog = (message, type = 'info') => {
    setLogs(prevLogs => [
      { message, type, timestamp: new Date() },
      ...prevLogs
    ]);
  };
  
  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared', 'info');
  };
  
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
    addLog(`Error: ${message}`, 'error');
  };
  
  const hideErrorModal = () => {
    setShowErrorModal(false);
  };
  
  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="logo">
            <FaWhatsapp /> <h1>WhatsApp Sender</h1>
          </div>
        </div>
      </header>
      
      <main className="container">
        <StatusBar
          connectionState={connectionState}
          isMessaging={isMessaging}
        />
        
        {authStep === 'phone' && (
          <div className="card">
            <h2>Enter Your Phone Number</h2>
            <p>We'll generate a pairing code you can use to authenticate WhatsApp without scanning a QR code.</p>
            
            <div className="form-group">
              <label>Your Phone Number (with country code)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. +14155552671"
                value={formData.userPhone}
                onChange={(e) => setFormData({...formData, userPhone: e.target.value})}
              />
            </div>
            
            <button className="btn btn-primary" onClick={generatePairingCode}>
              Generate Pairing Code
            </button>
          </div>
        )}
        
        {authStep === 'pairing' && (
          <PairingCodeAuth
            pairingCode={pairingCode}
            onCheckStatus={checkStatus}
          />
        )}
        
        {authStep === 'messaging' && (
          <MessageForm
            formData={formData}
            setFormData={setFormData}
            credsFile={credsFile}
            setCredsFile={setCredsFile}
            messageFile={messageFile}
            setMessageFile={setMessageFile}
            startMessaging={startMessaging}
            stopMessaging={stopMessaging}
            isMessaging={isMessaging}
          />
        )}
        
        <LogSection
          logs={logs}
          clearLogs={clearLogs}
        />
        
        {showErrorModal && (
          <div className="error-modal">
            <div className="error-modal-content">
              <h3>Error</h3>
              <p>{errorMessage}</p>
              <button className="btn btn-primary" onClick={hideErrorModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 WhatsApp Sender</p>
        </div>
      </footer>
    </div>
  );
}

export default App;