// Bookmarklet code to make API calls to Pi-hole
(function() {
  // Configuration
  const baseUrl = '[your-pi-hole-ip-or-domain-here]'; // const baseUrl = 'https://192.168.1.1';
  const authUrl = `${baseUrl}/api/auth`;
  const blockingUrl = `${baseUrl}/api/dns/blocking`;
  const password = '[your-password-here]'; // const password = 'YourComplexAppPassw0rd';
  const timerDuration = 3600; // Timer duration in seconds (1 hour = 3600 seconds), set to null to change status permanently
  const blockingStatus = false; // true to enable blocking, false to disable
  const includeLogout = false; // set to true to logout the session authorized to make this call after the blocking status is set
  // *includeLogout may give you errors depending on where you run the bookmarklet from
  const includeSuccessAlert = true; // set to true to show an alert after the blocking status is set
  const includeErrorAlert = true; // set to true to show an alert after the blocking status is set

  const authPayload = {
    password: password
  };
  
  // Make the authentication POST request
  fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(authPayload)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Authentication successful:', data);
    
    // Extract the session ID from the response
    const sid = data.session?.sid;
    
    if (!sid) {
      throw new Error('Session ID not found in response');
    }
    
    // Now make the request to the blocking API
    return setBlockingStatus(sid, blockingStatus, timerDuration)
      .then(blockingData => {
        // Return both the blocking data and sid for the next step
        return { blockingData, sid };
      });
  })
  .then(({ blockingData, sid }) => {
    console.log('Blocking status updated:', blockingData);
    
    // Now logout by sending a DELETE request
    return logout(sid).then(() => blockingData);
  })
  .then(blockingData => {
    const action = blockingStatus ? 'enabled' : 'disabled';
    if (includeSuccessAlert) {
      let message = `Pi-hole blocking has been ${action}`;
      
      // Add timer information if disabling with a timer
      if (!blockingStatus && timerDuration !== null) {
        // Format the duration in a human-readable way
        let formattedDuration;
        if (timerDuration >= 86400) {
          formattedDuration = `${Math.floor(timerDuration / 86400)} day(s)`;
        } else if (timerDuration >= 3600) {
          formattedDuration = `${Math.floor(timerDuration / 3600)} hour(s)`;
        } else if (timerDuration >= 60) {
          formattedDuration = `${Math.floor(timerDuration / 60)} minute(s)`;
        } else {
          formattedDuration = `${timerDuration} second(s)`;
        }
        message += ` for ${formattedDuration}`;
      }
      
      alert(`${message}!`);
    }
  })
  .catch(error => {
    console.error('Operation failed:', error);
    if (includeErrorAlert) {
      alert('Operation failed: ' + error.message);
    }
  });
  
  // Function to set blocking status
  function setBlockingStatus(sid, blocking, timer) {
    const blockingPayload = {
      blocking: blocking,
      timer: timer
    };
    
    return fetch(blockingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FTL-SID': sid
      },
      body: JSON.stringify(blockingPayload)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Blocking API error! Status: ${response.status}`);
      }
      return response.json();
    });
  }
  
  // Function to logout
  function logout(sid) {
    if (!includeLogout) {
      return Promise.resolve();
    }
    
    const logoutUrl = `${baseUrl}/api/auth?sid=${encodeURIComponent(sid)}`;
    
    return fetch(logoutUrl, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.status === 204) {
        console.log('Logout successful (204 No Content)');
      } else {
        console.warn(`Logout returned unexpected status: ${response.status}`);
        // We don't throw here to avoid breaking the main flow
      }
    })
    .catch(error => {
      console.warn('Logout error:', error);
      // We don't rethrow to avoid breaking the main flow
    });
  }
})();
