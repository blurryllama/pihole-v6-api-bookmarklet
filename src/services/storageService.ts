import browser from 'webextension-polyfill';
import { PiholeSettings } from '../types';

// Generate a unique salt for this extension instance
const generateSalt = async (): Promise<Uint8Array> => {
  const result = await browser.storage.local.get('salt');
  if (result.salt) {
    return Uint8Array.from(atob(result.salt), c => c.charCodeAt(0));
  }
  const newSalt = crypto.getRandomValues(new Uint8Array(16));
  await browser.storage.local.set({ salt: btoa(String.fromCharCode(...newSalt)) });
  return newSalt;
};

/**
 * Gets or generates an encryption key for the extension
 * @returns A promise that resolves to the encryption key
 */
export const getEncryptionKey = async (): Promise<CryptoKey> => {
  try {
    // Try to get the existing encryption key
    const result = await browser.storage.local.get('encryptionKey');
    
    if (result.encryptionKey) {
      try {
        // Get the salt
        const salt = await generateSalt();
        
        // Convert the stored base64 key to raw bytes
        const keyData = Uint8Array.from(atob(result.encryptionKey), c => c.charCodeAt(0));
        
        // Import the key for PBKDF2
        const pbkdf2Key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'PBKDF2' },
          false,
          ['deriveBits', 'deriveKey']
        );
        
        // Derive the final encryption key using PBKDF2
        return crypto.subtle.deriveKey(
          {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
          },
          pbkdf2Key,
          { name: 'AES-GCM', length: 256 },
          false, // Not extractable
          ['encrypt', 'decrypt']
        );
      } catch (error) {
        console.error('Error importing existing key:', error);
        // If there's an error with the existing key, generate a new one
        await browser.storage.local.remove('encryptionKey');
        return getEncryptionKey();
      }
    } else {
      // Generate a new encryption key if one doesn't exist
      const baseKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true, // Extractable
        ['encrypt', 'decrypt']
      );
      
      // Export the key as raw bytes
      const exportedKey = await crypto.subtle.exportKey('raw', baseKey);
      const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
      
      // Store the key as base64
      await browser.storage.local.set({ encryptionKey: base64Key });
      
      // Get the salt
      const salt = await generateSalt();
      
      // Import the key for PBKDF2
      const pbkdf2Key = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(exportedKey),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      // Derive the final encryption key using PBKDF2
      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        pbkdf2Key,
        { name: 'AES-GCM', length: 256 },
        false, // Not extractable
        ['encrypt', 'decrypt']
      );
    }
  } catch (error) {
    console.error('Error in getEncryptionKey:', error);
    
    // Fallback to a simpler key generation approach if the above fails
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
};

/**
 * Encrypts a string using AES-GCM algorithm
 * @param text The text to encrypt
 * @returns A promise that resolves to the encrypted text as a base64 string
 */
export const encryptText = async (text: string): Promise<string> => {
  if (!text) return '';
  
  try {
    // Get the encryption key
    const encryptionKey = await getEncryptionKey();
    
    // Convert the text to an array buffer
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Generate a random initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      encryptionKey,
      data
    );
    
    // Combine the IV and encrypted data and convert to base64
    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encryptedData), iv.length);
    
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Encryption error:', error);
    // Return the original text if encryption fails
    // This is a fallback to ensure the app continues to work
    return btoa(text);
  }
};

/**
 * Decrypts a string that was encrypted with AES-GCM
 * @param encryptedText The encrypted text as a base64 string
 * @returns A promise that resolves to the decrypted text
 */
export const decryptText = async (encryptedText: string): Promise<string> => {
  if (!encryptedText) return '';
  
  try {
    // Get the encryption key
    const encryptionKey = await getEncryptionKey();
    
    // Convert the base64 string back to an array buffer
    const encryptedData = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    
    // Extract the IV and the actual encrypted data
    const iv = encryptedData.slice(0, 12);
    const data = encryptedData.slice(12);
    
    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      encryptionKey,
      data
    );
    
    // Convert the decrypted data back to a string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    
    // Try to handle the case where the text might be a base64-encoded plaintext
    // (fallback from encryption failure)
    try {
      return atob(encryptedText);
    } catch (e) {
      // If that fails too, return empty string
      return '';
    }
  }
};

/**
 * Save Pi-hole settings to browser storage
 * @param settings The settings to save
 * @returns A promise that resolves when the settings are saved
 */
export const saveSettings = async (settings: PiholeSettings): Promise<void> => {
  try {
    // Encrypt the password before saving
    const encryptedPassword = await encryptText(settings.password);
    
    await browser.storage.sync.set({
      baseUrl: settings.baseUrl,
      password: encryptedPassword
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    // Fallback: save without encryption if encryption fails
    await browser.storage.sync.set({
      baseUrl: settings.baseUrl,
      password: btoa(settings.password) // Simple base64 encoding as fallback
    });
  }
};

/**
 * Load Pi-hole settings from browser storage
 * @returns A promise that resolves to the loaded settings
 */
export const loadSettings = async (): Promise<PiholeSettings> => {
  try {
    const result = await browser.storage.sync.get(['baseUrl', 'password']);
    
    // Decrypt the password if it exists
    let decryptedPassword = '';
    if (result.password) {
      try {
        decryptedPassword = await decryptText(result.password);
      } catch (error) {
        console.error('Error decrypting password:', error);
        // Try simple base64 decoding as fallback
        try {
          decryptedPassword = atob(result.password);
        } catch (e) {
          // If that fails too, use empty string
          decryptedPassword = '';
        }
      }
    }
    
    return {
      baseUrl: result.baseUrl || '',
      password: decryptedPassword
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      baseUrl: '',
      password: ''
    };
  }
}; 