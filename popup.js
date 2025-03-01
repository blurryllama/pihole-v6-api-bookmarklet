document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  browser.storage.sync.get(['baseUrl', 'password'], function(items) {
    if (items.baseUrl) {
      document.getElementById('baseUrl').value = items.baseUrl;
    }
    if (items.password) {
      document.getElementById('password').value = items.password;
    }
  });

  // Add event listeners to buttons
  document.getElementById('enableBtn').addEventListener('click', function() {
    updatePiholeStatus(true);
  });

  document.getElementById('disableBtn').addEventListener('click', function() {
    updatePiholeStatus(false);
  });
});

function updatePiholeStatus(blockingStatus) {
  // Get values from form
  const baseUrl = document.getElementById('baseUrl').value.trim();
  const password = document.getElementById('password').value.trim();
  const durationSelect = document.getElementById('duration');
  const timerDuration = blockingStatus ? null : parseInt(durationSelect.value);

  // Validate inputs
  if (!baseUrl) {
    showStatus('Please enter your Pi-hole URL', 'error');
    return;
  }

  if (!password) {
    showStatus('Please enter your Pi-hole password', 'error');
    return;
  }

  // Save settings
  browser.storage.sync.set({
    baseUrl: baseUrl,
    password: password
  });

  // Format URLs
  const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const authUrl = `${formattedBaseUrl}/api/auth`;
  const blockingUrl = `${formattedBaseUrl}/api/dns/blocking`;

  console.log('authUrl', authUrl);
  console.log('blockingUrl', blockingUrl);  


  // Show loading status
  showStatus('Connecting to Pi-hole...', '');

  // Authentication payload
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
      throw new Error(`Authentication failed: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Extract the session ID from the response
    const sid = data.session?.sid;
    
    if (!sid) {
      throw new Error('Session ID not found in response');
    }
    
    // Now make the request to the blocking API
    return setBlockingStatus(blockingUrl, sid, blockingStatus, timerDuration);
  })
  .then(blockingData => {
    const action = blockingStatus ? 'enabled' : 'disabled';
    let message = `Pi-hole blocking has been ${action}`;
    
    // Add timer information if disabling with a timer
    if (!blockingStatus && timerDuration > 0) {
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
    
    showStatus(`${message}!`, 'success');
  })
  .catch(error => {
    console.error('Operation failed:', error);
    showStatus(`Error: ${error.message}`, 'error');
  });
}

// Function to set blocking status
function setBlockingStatus(blockingUrl, sid, blocking, timer) {
  const blockingPayload = {
    blocking: blocking,
    timer: timer === 0 ? null : timer
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
      throw new Error(`Blocking API error: ${response.status}`);
    }
    return response.json();
  });
}

// Function to display status messages
function showStatus(message, type) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.style.display = 'block';
  
  // Remove all classes and add the appropriate one
  statusElement.className = 'status';
  if (type) {
    statusElement.classList.add(type);
  }
} 