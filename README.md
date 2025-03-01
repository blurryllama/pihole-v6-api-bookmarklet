# Pi-hole v6 Controller Browser Extension

A browser extension that allows you to control your Pi-hole v6 blocking status directly from your browser. This extension works with Chrome, Edge, and Firefox.

## Features

- Enable/disable Pi-hole DNS blocking with a single click
- Set custom disable duration (permanent, 5 minutes, 10 minutes, 30 minutes, 1 hour, 2 hours, or 1 day)
- Securely store your Pi-hole URL and password in your browser's storage
- Works with Pi-hole v6 API

## Installation

### Chrome and Edge

1. Download or clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now be installed and visible in your browser toolbar

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Navigate to the extension folder and select the `manifest.json` file
5. The extension should now be installed and visible in your browser toolbar

## Usage

1. Click on the Pi-hole v6 Controller icon in your browser toolbar
2. Enter your Pi-hole URL (e.g., `http://pi.hole` or the IP address of your Pi-hole server)
3. Enter your Pi-hole password
4. Select a disable duration from the dropdown menu (only applies when disabling)
5. Click "Enable Blocking" to enable Pi-hole DNS blocking
6. Click "Disable Blocking" to disable Pi-hole DNS blocking for the selected duration

## Development

### Debugging with VS Code

This extension includes VS Code launch configurations for debugging in Chrome, Edge, and Firefox.

#### Prerequisites

Install the following VS Code extensions:
- [JavaScript Debugger (ms-vscode.js-debug)](https://marketplace.visualstudio.com/items?itemName=ms-vscode.js-debug)
- [Firefox Debugger (firefox-devtools.vscode-firefox-debug)](https://marketplace.visualstudio.com/items?itemName=firefox-devtools.vscode-firefox-debug)

#### Available Debug Configurations

- **Debug Extension in Chrome**: Launches Chrome with the extension loaded (Program Files path)
- **Debug Extension in Chrome (x86)**: Alternative for Chrome installed in Program Files (x86)
- **Debug Extension in Chrome (LocalAppData)**: Alternative for Chrome installed in the user's AppData folder
- **Debug Extension in Edge**: Launches Edge with the extension loaded
- **Debug Extension in Firefox**: Launches Firefox with the extension loaded
- **Debug Popup**: Opens the popup.html file directly in Chrome for easier UI debugging
- **Attach to Background Script**: Attaches to the background script for debugging
- **Debug Extension & Attach to Background**: Compound configuration that launches Chrome and attaches to the background script

#### Troubleshooting Chrome Path Issues

If you encounter an error like "Unable to find chrome version", you may need to modify the `runtimeExecutable` path in the `.vscode/launch.json` file to match your Chrome installation path:

1. Run the included `find-chrome-path.bat` file (on Windows) to locate your Chrome installation
2. Open `.vscode/launch.json`
3. Find the Chrome configuration section
4. Update the `runtimeExecutable` path to match your Chrome installation:
   - Standard path: `"${env:ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe"`
   - Alternative path: `"${env:ProgramFiles(x86)}\\Google\\Chrome\\Application\\chrome.exe"`
   - Local AppData path: `"${env:LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe"`
   - Or use the full absolute path: `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`

You can also try one of the alternative Chrome configurations that are already set up:
- "Debug Extension in Chrome (x86)" - Uses Program Files (x86) path
- "Debug Extension in Chrome (LocalAppData)" - Uses the AppData/Local path

#### How to Debug

1. Open the extension in VS Code
2. Set breakpoints in your JavaScript files
3. Press F5 or select a debug configuration from the Run and Debug panel
4. The browser will launch with the extension loaded
5. Interact with the extension to trigger your breakpoints

## Building for Distribution

### Chrome Web Store (Chrome and Edge)

1. Zip the contents of the extension folder
2. Submit the zip file to the Chrome Web Store Developer Dashboard

### Firefox Add-ons (AMO)

1. Zip the contents of the extension folder
2. Submit the zip file to the Firefox Add-ons Developer Hub

## Technical Details

This extension uses:
- Manifest V3 for Chrome, Edge, and Firefox
- Browser API polyfill to ensure compatibility across browsers
- Pi-hole v6 API for authentication and controlling blocking status

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Pi-hole team for creating an excellent DNS-level ad blocker
- Browser extension communities for guidance on cross-browser compatibility