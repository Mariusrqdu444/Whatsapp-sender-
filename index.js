require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const morgan = require('morgan');
const multer = require('multer');
const whatsapp = require('./server/whatsapp');

// Create the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Configure file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// API routes
app.get('/api/status', (req, res) => {
  const status = whatsapp.getWhatsAppStatus();
  res.json(status);
});

app.post('/api/pairing', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    console.log(`Generating pairing code for phone: ${phoneNumber}`);
    const pairingCode = await whatsapp.generatePairingCode(phoneNumber);
    console.log(`Generated pairing code: ${pairingCode}`);
    
    res.json({ pairingCode });
  } catch (error) {
    console.error('Error generating pairing code:', error);
    res.status(500).json({ error: 'Failed to generate pairing code', details: error.message });
  }
});

app.post('/api/start', upload.fields([
  { name: 'messageFile', maxCount: 1 },
  { name: 'credsFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      userPhone,
      targetType,
      targetPhones,
      messageInputType,
      messageText,
      messageDelay,
      enableRetry,
      maxRetries
    } = req.body;
    
    // Get uploaded files
    const messageFile = req.files?.messageFile?.[0];
    const credsFile = req.files?.credsFile?.[0];
    
    console.log('Starting WhatsApp session with params:', {
      userPhone,
      targetType,
      targetPhonesCount: targetPhones ? targetPhones.split(',').length : 0,
      messageInputType,
      hasMessageFile: !!messageFile,
      hasCredsFile: !!credsFile,
      messageDelay
    });
    
    let credsJson = null;
    if (credsFile) {
      credsJson = fs.readFileSync(credsFile.path, 'utf8');
    }
    
    // Initialize WhatsApp
    await whatsapp.initializeWhatsApp(credsJson);
    
    // Prepare message content
    let messageContent = messageText;
    if (messageInputType === 'file' && messageFile) {
      messageContent = fs.readFileSync(messageFile.path, 'utf8');
    }
    
    // Send messages to all target phones
    const targets = targetPhones.split(',').map(p => p.trim());
    
    for (const target of targets) {
      try {
        await whatsapp.sendWhatsAppMessage({
          target,
          targetType,
          message: messageContent,
          delay: parseInt(messageDelay, 10) || 1,
          retry: enableRetry === 'true',
          maxRetries: parseInt(maxRetries, 10) || 3
        });
      } catch (error) {
        console.error(`Error sending to ${target}:`, error);
      }
    }
    
    res.json({ success: true, message: 'Started WhatsApp messaging session' });
  } catch (error) {
    console.error('Error starting WhatsApp session:', error);
    res.status(500).json({ error: 'Failed to start WhatsApp session', details: error.message });
  }
});

app.post('/api/stop', async (req, res) => {
  try {
    await whatsapp.disconnectWhatsApp();
    res.json({ success: true, message: 'WhatsApp session stopped' });
  } catch (error) {
    console.error('Error stopping WhatsApp session:', error);
    res.status(500).json({ error: 'Failed to stop WhatsApp session', details: error.message });
  }
});

// Serve static files from the React app
// IMPORTANT: We use 'client/build' as the static directory, which must exist
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start the server - IMPORTANT: Listen on 0.0.0.0 to allow external connections
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});