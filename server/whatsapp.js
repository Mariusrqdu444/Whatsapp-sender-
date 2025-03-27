const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Global variables
let client = null;
let qrCode = null;
let pairingCode = null;
let connectionStatus = 'disconnected';

// Initialize WhatsApp client
const initializeWhatsApp = async (credsJson = null) => {
  try {
    console.log('Initializing WhatsApp client...');
    
    // Setup auth folder
    const authFolder = path.join(__dirname, '..', 'auth');
    if (!fs.existsSync(authFolder)) {
      fs.mkdirSync(authFolder, { recursive: true });
    }
    
    // Handle creds.json if provided
    if (credsJson) {
      const credsFile = path.join(authFolder, 'creds.json');
      fs.writeFileSync(credsFile, credsJson);
      console.log('Using provided credentials file');
    }
    
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    
    client = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: Browsers.macOS('Desktop'),
      syncFullHistory: false
    });
    
    client.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        qrCode = qr;
        console.log('QR Code received, scan with WhatsApp mobile app');
        qrcode.generate(qr, { small: true });
      }
      
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Connection closed due to:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect);
        connectionStatus = 'disconnected';
        
        if (shouldReconnect) {
          initializeWhatsApp();
        }
      } else if (connection === 'open') {
        console.log('WhatsApp connection established!');
        connectionStatus = 'connected';
      }
    });
    
    client.ev.on('creds.update', saveCreds);
    
    return client;
  } catch (error) {
    console.error('Error initializing WhatsApp:', error);
    connectionStatus = 'disconnected';
    throw error;
  }
};

// Generate pairing code for mobile authentication
const generatePairingCode = async (phoneNumber) => {
  try {
    if (!client) {
      await initializeWhatsApp();
    }
    
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }
    
    // Wait for connection to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let code = await client.requestPairingCode(phoneNumber);
    pairingCode = code;
    console.log(`Pairing code for ${phoneNumber}: ${code}`);
    return code;
  } catch (error) {
    console.error('Error generating pairing code:', error);
    throw error;
  }
};

// Send message to WhatsApp contact or group
const sendWhatsAppMessage = async ({ target, targetType, message, delay = 1, retry = false, maxRetries = 3 }) => {
  try {
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }
    
    if (!target || !message) {
      throw new Error('Target and message are required');
    }
    
    // Format phone number
    if (!target.includes('@')) {
      if (!target.startsWith('+')) {
        target = '+' + target;
      }
      
      target = targetType === 'group' 
        ? `${target.replace('+', '')}@g.us` 
        : `${target.replace('+', '')}@s.whatsapp.net`;
    }
    
    console.log(`Sending message to ${target} (delay: ${delay}s)`);
    
    let attempts = 0;
    let success = false;
    
    while (!success && attempts < (retry ? maxRetries : 1)) {
      attempts++;
      try {
        await client.sendMessage(target, { text: message });
        console.log(`Message sent to ${target} successfully`);
        success = true;
      } catch (err) {
        console.error(`Attempt ${attempts} failed for ${target}:`, err);
        if (retry && attempts < maxRetries) {
          console.log(`Retrying in ${delay} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay * 1000));
        } else {
          throw err;
        }
      }
    }
    
    return { success, target };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

// Disconnect WhatsApp client
const disconnectWhatsApp = async () => {
  try {
    if (client) {
      await client.logout();
      client = null;
      qrCode = null;
      pairingCode = null;
      connectionStatus = 'disconnected';
      console.log('WhatsApp client disconnected');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    throw error;
  }
};

// Get WhatsApp connection status
const getWhatsAppStatus = () => {
  return {
    status: connectionStatus,
    qrCode: qrCode,
    pairingCode: pairingCode
  };
};

module.exports = {
  initializeWhatsApp,
  sendWhatsAppMessage,
  disconnectWhatsApp,
  getWhatsAppStatus,
  generatePairingCode
};