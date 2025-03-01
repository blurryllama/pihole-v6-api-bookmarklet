import { AuthResponse, BlockingResponse } from '../types';

/**
 * Authenticate with the Pi-hole API
 * @param baseUrl The base URL of the Pi-hole instance
 * @param password The Pi-hole password
 * @returns A promise that resolves to the authentication response
 */
export const authenticate = async (baseUrl: string, password: string): Promise<AuthResponse> => {
  try {
    // Ensure the baseUrl is properly formatted
    let formattedBaseUrl = baseUrl.trim();
    if (!formattedBaseUrl.startsWith('http://') && !formattedBaseUrl.startsWith('https://')) {
      formattedBaseUrl = 'http://' + formattedBaseUrl;
    }
    formattedBaseUrl = formattedBaseUrl.endsWith('/') ? formattedBaseUrl.slice(0, -1) : formattedBaseUrl;
    const authUrl = `${formattedBaseUrl}/api/auth`;
    
    // Make direct API call
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.timeout = 10000;
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          } else if (xhr.status === 0) {
            reject(new Error('Connection failed. Check if Pi-hole is running and accessible.'));
          } else {
            reject(new Error(`Authentication failed: ${xhr.status} ${xhr.statusText}`));
          }
        }
      };
      
      xhr.onerror = function() {
        console.error('XHR error during authentication');
        reject(new Error('Connection failed. XHR error.'));
      };
      
      xhr.ontimeout = function() {
        reject(new Error('Connection timed out. Check if Pi-hole is running and accessible.'));
      };
      
      // Use POST method with proper headers
      xhr.open('POST', authUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');
      xhr.send(JSON.stringify({ password }));
    });
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    throw error;
  }
};

/**
 * Set the blocking status of the Pi-hole
 * @param baseUrl The base URL of the Pi-hole instance
 * @param sid The session ID from authentication
 * @param blocking Whether blocking should be enabled
 * @param timer The duration in seconds for which blocking should be disabled (null for permanent)
 * @returns A promise that resolves to the blocking response
 */
export const setBlockingStatus = async (
  baseUrl: string,
  sid: string,
  blocking: boolean,
  timer: number | null
): Promise<BlockingResponse> => {
  try {
    // Ensure the baseUrl is properly formatted
    let formattedBaseUrl = baseUrl.trim();
    if (!formattedBaseUrl.startsWith('http://') && !formattedBaseUrl.startsWith('https://')) {
      formattedBaseUrl = 'http://' + formattedBaseUrl;
    }
    formattedBaseUrl = formattedBaseUrl.endsWith('/') ? formattedBaseUrl.slice(0, -1) : formattedBaseUrl;
    const blockingUrl = `${formattedBaseUrl}/api/dns/blocking`;
    
    // Make direct API call
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.timeout = 10000;
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          } else if (xhr.status === 0) {
            reject(new Error('Connection failed. Check if Pi-hole is running and accessible.'));
          } else {
            reject(new Error(`Blocking API error: ${xhr.status} ${xhr.statusText}`));
          }
        }
      };
      
      xhr.onerror = function() {
        console.error('XHR error during blocking status update');
        reject(new Error('Connection failed. Check if Pi-hole is running and accessible.'));
      };
      
      xhr.ontimeout = function() {
        reject(new Error('Connection timed out. Check if Pi-hole is running and accessible.'));
      };
      
      // Use POST method with proper headers
      xhr.open('POST', blockingUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-FTL-SID', sid);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');
      xhr.send(JSON.stringify({
        blocking,
        timer: timer === 0 ? null : timer
      }));
    });
  } catch (error) {
    console.error('Blocking status error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      throw new Error(`Blocking status update failed: ${error.message}`);
    }
    
    throw error;
  }
};

/**
 * Format a duration in seconds to a human-readable string
 * @param seconds The duration in seconds
 * @returns A human-readable string representation of the duration
 */
export const formatDuration = (seconds: number): string => {
  if (seconds >= 86400) {
    return `${Math.floor(seconds / 86400)} day(s)`;
  } else if (seconds >= 3600) {
    return `${Math.floor(seconds / 3600)} hour(s)`;
  } else if (seconds >= 60) {
    return `${Math.floor(seconds / 60)} minute(s)`;
  } else {
    return `${seconds} second(s)`;
  }
};

/**
 * Logout from the Pi-hole API session
 * @param baseUrl The base URL of the Pi-hole instance
 * @param sid The session ID from authentication
 * @returns A promise that resolves when logout is successful
 */
export const logout = async (baseUrl: string, sid: string): Promise<void> => {
  try {
    // Ensure the baseUrl is properly formatted
    let formattedBaseUrl = baseUrl.trim();
    if (!formattedBaseUrl.startsWith('http://') && !formattedBaseUrl.startsWith('https://')) {
      formattedBaseUrl = 'http://' + formattedBaseUrl;
    }
    formattedBaseUrl = formattedBaseUrl.endsWith('/') ? formattedBaseUrl.slice(0, -1) : formattedBaseUrl;
    const logoutUrl = `${formattedBaseUrl}/api/auth?sid=${encodeURIComponent(sid)}`;
    
    // Make direct API call
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.timeout = 10000;
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 204) {
            // 204 No Content is the expected successful response
            resolve();
          } else if (xhr.status === 0) {
            reject(new Error('Connection failed. Check if Pi-hole is running and accessible.'));
          } else {
            reject(new Error(`Logout failed: ${xhr.status} ${xhr.statusText}`));
          }
        }
      };
      
      xhr.onerror = function() {
        console.error('XHR error during logout');
        reject(new Error('Connection failed. XHR error.'));
      };
      
      xhr.ontimeout = function() {
        reject(new Error('Connection timed out. Check if Pi-hole is running and accessible.'));
      };
      
      // Use DELETE method
      xhr.open('DELETE', logoutUrl, true);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');
      xhr.send();
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
    
    throw error;
  }
}; 