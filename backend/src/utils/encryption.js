const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

/**
 * Encrypt a message
 * @param {string} text - Text to encrypt
 * @returns {object} - Encrypted data with iv
 */
exports.encrypt = (text) => {
  try {
    // Use environment key or generate a random key
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt a message
 * @param {object} encrypted - Object containing iv and encryptedData
 * @returns {string} - Decrypted text
 */
exports.decrypt = (encrypted) => {
  try {
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const iv = Buffer.from(encrypted.iv, 'hex');
    const encryptedText = Buffer.from(encrypted.encryptedData, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
};

/**
 * Generate a hash for a given text
 * @param {string} text - Text to hash
 * @returns {string} - Hashed text
 */
exports.hash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};
