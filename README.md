# Pi-hole v6 Controller Browser Extension

A browser extension to control your Pi-hole v6 blocking status directly from your browser. This extension has been updated to use React with TypeScript and is **ONLY compatible with Pi-hole v6 and newer versions**.

## Features

- Enable/disable Pi-hole blocking
- Set custom disable duration
- Save Pi-hole URL and password
- Modern React-based UI
- TypeScript for type safety
- Secure encryption of sensitive user data
- Support for Pi-hole v6 API authentication pattern
- **Exclusively designed for Pi-hole v6 and newer**

## Security Features

### Encryption of User Data

This extension implements robust encryption to protect your Pi-hole credentials:

- Uses the Web Crypto API with AES-GCM encryption algorithm
- Generates a unique encryption key for each extension installation
- Securely stores the encryption key using browser storage
- Implements PBKDF2 key derivation with a unique salt for enhanced security
- Encrypts your Pi-hole password before storing it in browser storage

### Pi-hole v6 API Authentication

The extension uses the updated authentication pattern for Pi-hole v6:

1. **Login Process**:
   - Authenticates with the Pi-hole API using a POST request to `/api/auth`
   - Receives a session ID (SID) that's used for subsequent API calls
   - Includes proper headers and error handling for reliable connections

2. **API Interaction**:
   - Uses the session ID in the `X-FTL-SID` header for authenticated requests
   - Communicates with the blocking API at `/api/dns/blocking`
   - Supports custom disable durations with proper timer formatting

3. **Logout Process**:
   - Properly terminates the session with a DELETE request to `/api/auth`
   - Ensures your Pi-hole session is securely closed when done
   - 

## Important Note for Pi-hole Compatibility

**This extension is ONLY compatible with Pi-hole v6 and newer versions.** It will not work with Pi-hole v5 or earlier as it uses the new API authentication pattern introduced in Pi-hole v6.

If you've upgraded from Pi-hole 5 or below to Pi-hole 6, you might encounter connection issues with this extension. This is because:

- In Pi-hole 5 and below, the web interface typically ran on port 80
- After upgrading to Pi-hole 6, lighttpd might still be running on port 80, while the Pi-hole web interface runs on port 8080

In this configuration, the extension cannot connect to Pi-hole unless you have a valid SSL certificate set up for your Pi-hole. To resolve this issue, you can:

1. Stop the lighttpd service:
   ```bash
   sudo service lighttpd stop
   ```

2. Uninstall lighttpd:
   ```bash
   sudo apt remove lighttpd
   ```

3. Configure Pi-hole to use port 80 :
   ```bash
   sudo pihole-FTL --config webserver.port 80
   ```

This will allow the extension to connect directly to your Pi-hole on the standard HTTP port.

## Development

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Setup

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Development Build

To build the extension in development mode with watch mode:

```bash
npm start
# or
yarn start
```

This will create a `dist` folder with the extension files and watch for changes.

### Production Build

To build the extension for production:

```bash
npm run build
# or
yarn build
```

## Loading the Extension

### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` folder

### Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select any file in the `dist` folder

## Usage

1. Click on the Pi-hole extension icon in your browser toolbar
2. Enter your Pi-hole URL (e.g., `http://pi.hole` or the IP address)
3. Enter your Pi-hole password
4. Select a disable duration (if needed)
5. Click "Enable Blocking" or "Disable Blocking" as needed

## Technical Details

This extension uses:

- React for the UI
- TypeScript for type safety
- Webpack for bundling
- Browser extension polyfill for cross-browser compatibility
- Web Crypto API for secure encryption
- XMLHttpRequest for direct API communication

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

This extension is designed to work **exclusively with Pi-hole v6 and newer versions** and uses the new API authentication pattern introduced in Pi-hole v6 to control blocking status.