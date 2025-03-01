import React, { useState, useEffect } from 'react';
import { DurationOption, StatusMessage } from '../types';
import { authenticate, setBlockingStatus, formatDuration, logout } from '../services/piholeService';
import { saveSettings, loadSettings } from '../services/storageService';
import './Popup.css';

const Popup: React.FC = () => {
  // State for form inputs
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [duration, setDuration] = useState<number>(3600); // Default: 1 hour
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for status message
  const [status, setStatus] = useState<StatusMessage>({ text: '', type: '' });
  
  // Duration options
  const durationOptions: DurationOption[] = [
    { value: 0, label: 'Permanent' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' },
    { value: 7200, label: '2 hours' },
    { value: 86400, label: '1 day' },
    { value: 604800, label: '1 week' }
  ];
  
  // Load saved settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await loadSettings();
        setBaseUrl(settings.baseUrl);
        setPassword(settings.password);
      } catch (error) {
        console.error('Failed to load settings:', error);
        showStatus('Failed to load saved settings', 'error');
      }
    };
    
    fetchSettings();
  }, []);
  
  // Show status message
  const showStatus = (text: string, type: StatusMessage['type']) => {
    setStatus({ text, type });
  };
  
  // Handle Pi-hole status update
  const updatePiholeStatus = async (blocking: boolean) => {
    // Validate inputs
    if (!baseUrl.trim()) {
      showStatus('Please enter your Pi-hole URL', 'error');
      return;
    }
    
    if (!password.trim()) {
      showStatus('Please enter your Pi-hole password', 'error');
      return;
    }
    
    // Validate URL format
    let url;
    try {
      url = new URL(baseUrl.trim());
      // Make sure protocol is http or https
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch (error) {
      showStatus('Please enter a valid URL (e.g., http://pi.hole or http://192.168.1.100)', 'error');
      return;
    }
    
    // Save settings
    try {
      await saveSettings({
        baseUrl: baseUrl.trim(),
        password
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      showStatus('Failed to save settings', 'error');
      return;
    }
    
    // Show loading status
    setIsLoading(true);
    showStatus('Connecting to Pi-hole...', '');
    
    try {
      // Authenticate
      const authResponse = await authenticate(baseUrl, password);
      
      if (!authResponse.session?.sid) {
        throw new Error('Session ID not found in response');
      }
      
      const sid = authResponse.session.sid;
      
      // Set blocking status
      const timerDuration = blocking ? null : (duration === 0 ? null : duration);
      await setBlockingStatus(baseUrl, sid, blocking, timerDuration);
      
      // Logout after setting blocking status
      await logout(baseUrl, sid);
      
      // Show success message
      const action = blocking ? 'enabled' : 'disabled';
      let message = `Pi-hole blocking has been ${action}`;
      
      // Add timer information if disabling with a timer
      if (!blocking && timerDuration) {
        message += ` for ${formatDuration(timerDuration)}`;
      }
      
      showStatus(`${message}!`, 'success');
    } catch (error) {
      console.error('Operation failed:', error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showStatus(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Port configuration tooltip content
  const portConfigTooltip = `
    If you upgraded from Pi-hole 5 or below, lighttpd might be running on port 80 
    with Pi-hole on port 8080. In this case, the extension cannot connect unless you 
    have an SSL certificate set up for Pi-hole. To fix this, you can:
    1. Stop lighttpd: sudo service lighttpd stop
    2. Uninstall lighttpd: sudo apt remove lighttpd
    3. Set Pi-hole to port 80: sudo pihole-FTL --config webserver.port 80
  `;
  
  return (
    <div className="container">
      <h2>Pi-hole v6 Controller</h2>
      
      <div className="form-group">
        <label htmlFor="baseUrl">Pi-hole URL:</label>
        <div className="input-with-tooltip">
          <input
            type="text"
            id="baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://pi.hole or IP address"
            disabled={isLoading}
          />
          <div className="tooltip-icon" data-tooltip={portConfigTooltip}>ⓘ</div>
        </div>
        <small className="form-hint">
          Use http:// unless you have a valid SSL certificate
        </small>
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your Pi-hole password"
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="duration">Disable Duration:</label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          disabled={isLoading}
        >
          {durationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="buttons">
        <button
          className="enable-btn"
          onClick={() => updatePiholeStatus(true)}
          disabled={isLoading}
        >
          Enable Blocking
        </button>
        <button
          className="disable-btn"
          onClick={() => updatePiholeStatus(false)}
          disabled={isLoading}
        >
          Disable Blocking
        </button>
      </div>
      
      {status.text && (
        <div className={`status ${status.type}`}>
          {status.text}
        </div>
      )}
    </div>
  );
};

export default Popup; 