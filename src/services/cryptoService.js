const crypto = require("crypto");

// Use ECDH with P-256 curve
const serverECDH = crypto.createECDH("prime256v1");
serverECDH.generateKeys(); // Generate keys once

const sessionMap = new Map(); // { clientPublicKey: {sharedSecret, timestamp} }

function getServerPublicKey() {
  return serverECDH.getPublicKey().toString("base64");
}

function setSharedSecret(clientPublicKeyBase64) {
    // Check if a session already exists for the given public key
    const existingSession = sessionMap.get(clientPublicKeyBase64);
  
    // Check the timestamp to see if the session has expired
    if (existingSession && (Date.now() - existingSession.timestamp <= 60 * 60 * 1000)) {
      return; // Do nothing, session is still valid
    }
  
    const clientPublicKeyBuffer = Buffer.from(clientPublicKeyBase64, "base64");
    const sharedSecret = serverECDH.computeSecret(clientPublicKeyBuffer);
    
    const timestamp = Date.now();
    sessionMap.set(clientPublicKeyBase64, { sharedSecret, timestamp });
  }
  
  function getSharedSecret(clientPublicKeyBase64) {
    const session = sessionMap.get(clientPublicKeyBase64);
    
    if (!session) {
      throw new Error("Session not found");
    }
    
    const { sharedSecret, timestamp } = session;
    if (Date.now() - timestamp > 60 * 60 * 1000) { // Expire session after 1 hour
        sessionMap.delete(clientPublicKeyBase64);
        throw new Error("Session expired");
    }
    
    return sharedSecret;
  }

function encrypt(data, clientPublicKeyBase64) {
    console.log("encrypted data called!")
  const sharedSecret = getSharedSecret(clientPublicKeyBase64);

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    sharedSecret.slice(0, 32),
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(data, "utf8"),
    cipher.final(),
  ]);
  return {
    iv: iv.toString("base64"),
    encryptedData: encrypted.toString("base64"),
  };
}

function decrypt(encryptedData, iv, clientPublicKeyBase64) {
  try {
    const sharedSecret = getSharedSecret(clientPublicKeyBase64);
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(sharedSecret, "base64"),
      Buffer.from(iv, "base64")
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, "base64")),
      decipher.final(),
    ]);
    const decryptedStr = decrypted.toString("utf8");
    return decryptedStr;
  } catch (error) {
    console.log("Decryption error:", error);
    throw error;
  }
}

module.exports = {
  getServerPublicKey,
  setSharedSecret,
  getSharedSecret,
  encrypt,
  decrypt,
};
