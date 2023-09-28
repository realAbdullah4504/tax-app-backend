const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');
const apiRoutes = require('./routes/apiRoutes');
const userRoutes = require('./routes/userRoutes');
const { PORT, NODE_ENV } = require('../config/vars');
const cryptoService = require('./services/cryptoService');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cors());

connectDB();

const ENABLE_ENCRYPTION = NODE_ENV === 'production';

app.get('/api/config', (req, res) => {
  res.json({
    ENABLE_ENCRYPTION,
  });
});

app.get('/api/get-server-public-key', (req, res) => {
  const serverPublicKey = cryptoService.getServerPublicKey();
  res.json({ serverPublicKey });
});

app.use('/api', async (req, res, next) => {
  if (ENABLE_ENCRYPTION) {
    const clientPublicKey = req.headers['agency-tax-number'];

    if (req.body && clientPublicKey) {
      cryptoService.setSharedSecret(clientPublicKey);
    }

    if (req.body && req.body.encryptedData && req.body.iv) {
      try {
        const decryptedData = cryptoService.decrypt(
          req.body.encryptedData,
          req.body.iv,
          clientPublicKey
        );
        req.body = decryptedData;
      } catch (error) {
        console.error('Decryption error:', error);
        return res.status(400).json({ error: 'Decryption error' });
      }
    }
    next();
  } else {
    next();
  }
});

// Middleware to encrypt response data
app.use('/api', (req, res, next) => {
  const originalJson = res.json.bind(res); // Keep the original function

  res.json = function (data) {
    if (ENABLE_ENCRYPTION) {
      const clientPublicKey = req.headers['agency-tax-number'];
      if (clientPublicKey) {
        const encryptedResponse = cryptoService.encrypt(JSON.stringify(data), clientPublicKey);
        originalJson({
          encryptedData: encryptedResponse.encryptedData,
          iv: encryptedResponse.iv,
        });
      } else {
        originalJson(data);
      }
    } else {
      originalJson(data);
    }
  };

  next();
});
// Define your API routes
app.use('/api', apiRoutes);
app.use('/api/v1/users', userRoutes);

// Apply your errorHandler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
