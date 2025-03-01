# Pi-hole v6 API Bookmarklet

This repository provides a simple way to control your Pi-hole v6 using bookmarklets. You can quickly enable or disable Pi-hole blocking with a single click from your browser.

## How to Use

### Step 1: Customize the Code

1. Copy the JavaScript code from `api-call-sample.js` to a text editor
2. Update the following configuration variables:
   - `baseUrl`: Your Pi-hole IP address or domain (e.g., `'https://192.168.1.1'` or `'http://pi.hole'`)
   - `password`: Your Pi-hole password or app password
   - `timerDuration`: How long to disable Pi-hole (in seconds), or set to `null` for permanent change
   - `blockingStatus`: Set to `true` to enable blocking or `false` to disable blocking
   - `includeLogout`: Set to `true` to logout the session after the API call (default is `false`)
   - `includeSuccessAlert`: Set to `true` to show a success alert message (default is `true`)
   - `includeErrorAlert`: Set to `true` to show an error alert message if the operation fails (default is `true`)

### Step 2: Create the Bookmarklet

1. Go to [Bookmarkleter](https://chriszarate.github.io/bookmarkleter/) (or similar tool)
2. Paste your customized JavaScript code into the text area
3. Configure the options:
   - Check "URL-encode reserved characters"
   - Check "Wrap in an IIFE"
   - Optionally check "Mangle variables and remove dead code" to reduce size
4. Click "Bookmarklet" to generate the bookmarklet code

### Step 3: Add to Your Browser

1. Create a new bookmark in your browser
2. Give it a name like "Disable Pi-hole 1hr" or "Enable Pi-hole"
3. Instead of a URL, paste the generated bookmarklet code
4. Save the bookmark

Now you can click the bookmark anytime to toggle your Pi-hole's blocking status!

## Creating Multiple Bookmarklets

Create multiple bookmarklets changing the `blockingStatus` and `timerDuration` values.

1. **Enable Pi-hole**: Set `blockingStatus: true` and `timerDuration: null`
2. **Disable Pi-hole 1hr**: Set `blockingStatus: false` and `timerDuration: 3600` (or your preferred duration)
3. **Disable Pi-hole 10min**: Set `blockingStatus: false` and `timerDuration: 600` (or your preferred duration)
4. **Disable Pi-hole 1day**: Set `blockingStatus: false` and `timerDuration: 86400` (or your preferred duration)

## Alert Messages

When `includeSuccessAlert` is set to `true`, the bookmarklet will display an alert message after successfully changing the Pi-hole blocking status. If a timer duration is specified, the alert will include how long Pi-hole will be disabled.

For example:
- With `timerDuration: null`: "Pi-hole blocking has been disabled!"
- With `timerDuration: 3600`: "Pi-hole blocking has been disabled for 1 hour!"

## Console Output

The bookmarklet logs information to your browser's console during execution. This can be helpful for troubleshooting or verifying that operations completed successfully. To view these logs, open your browser's developer tools (usually by pressing F12 or right-clicking and selecting "Inspect") and navigate to the Console tab.

The following information is logged:
- Authentication status and response data
- Session ID acquisition
- Blocking status update confirmation
- Logout status (if `includeLogout` is enabled)
- Any errors that occur during execution

If you're experiencing issues with the bookmarklet, checking the console output can provide valuable information about what might be going wrong.

## Session Management

The `includeLogout` option controls whether the bookmarklet logs out the session after making the API call:

- When set to `false` (default), the session remains active
- When set to `true`, the bookmarklet will attempt to logout the session after changing the blocking status

**Note:** The logout feature may cause errors in some environments depending on where you run the bookmarklet from. If you experience issues, set `includeLogout` to `false`.

## Security Note

The bookmarklet contains your Pi-hole password. Be cautious about sharing your browser with others or syncing bookmarks across devices.

## References

- [Bookmarkleter Tool](https://chriszarate.github.io/bookmarkleter/)
- [Pi-hole Documentation](https://docs.pi-hole.net/)