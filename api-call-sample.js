// Bookmarklet code to make API calls to Pi-hole
(function() {
  // Configuration
  const baseUrl = '[your-pi-hole-ip-or-domain-here]'; // const baseUrl = 'https://192.168.1.1';
  const authUrl = `${baseUrl}/api/auth`;
  const blockingUrl = `${baseUrl}/api/dns/blocking`;
  const password = '[your-password-here]'; // const password = 'YourComplexAppPassw0rd';
  const timerDuration = 3600; // Timer duration in seconds (1 hour = 3600 seconds), set to null to change status permanently
  const blockingStatus = false; // true to enable blocking, false to disable
  
  // Create the authentication payload
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
    alert(`Pi-hole blocking has been ${action}!`);
  })
  .catch(error => {
    console.error('Operation failed:', error);
    alert('Operation failed: ' + error.message);
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
