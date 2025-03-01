/**
 * Browser API Compatibility Layer
 * 
 * This script provides a unified 'browser' object that works across
 * Chrome, Edge, and Firefox extensions.
 */

(function() {
  // Create a global 'browser' object that maps to the appropriate browser API
  window.browser = (function() {
    // Firefox already has a 'browser' object
    if (typeof browser !== 'undefined') {
      return browser;
    }
    
    // Chrome and Edge use the 'chrome' object
    if (typeof chrome !== 'undefined') {
      return {
        // Storage API
        storage: {
          sync: {
            get: function(keys, callback) {
              return chrome.storage.sync.get(keys, callback);
            },
            set: function(items, callback) {
              return chrome.storage.sync.set(items, callback);
            }
          },
          local: {
            get: function(keys, callback) {
              return chrome.storage.local.get(keys, callback);
            },
            set: function(items, callback) {
              return chrome.storage.local.set(items, callback);
            }
          }
        },
        
        // Runtime API
        runtime: {
          onInstalled: {
            addListener: function(callback) {
              return chrome.runtime.onInstalled.addListener(callback);
            }
          },
          getManifest: function() {
            return chrome.runtime.getManifest();
          }
        }
      };
    }
    
    // If neither browser nor chrome is defined, log an error
    console.error('No compatible browser API found');
    return {};
  })();
})(); 