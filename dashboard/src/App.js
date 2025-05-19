import React, { useEffect, useState } from 'react';
import { ping, runPhishing, runLateral, getTimeline, login, register, logout, getAIEvasion, getEventSummary, exportEvents } from './api';

// Added comment to force Docker build

const primaryBlue = '#1976d2';
const secondaryBlue = '#2196f3';
const darkBlue = '#0d47a1';
const primaryMagenta = '#e91e63';
const secondaryMagenta = '#f06292';
const darkMagenta = '#c2185b';
const grayBackground = '#f4f6fa';
const lightGrayBorder = '#eee';
const mediumGrayBorder = '#ccc';
const darkGrayText = '#333';
const mediumGrayText = '#555';
const lightGrayText = '#777';

const cardStyle = {
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: '24px',
  margin: '20px auto',
  maxWidth: 900,
};

const buttonStyle = {
  background: primaryBlue,
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '10px 20px',
  margin: '0 8px 0 0',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 16,
  transition: 'background 0.2s',
  flexShrink: 0,
};

const buttonAltStyle = {
  ...buttonStyle,
  background: primaryMagenta,
};

const logoutButtonStyle = {
  ...buttonStyle,
  background: darkMagenta,
  float: 'right',
  margin: 0,
};

const inputStyle = {
  width: '100%',
  marginBottom: 12,
  padding: '10px',
  borderRadius: 4,
  border: `1px solid ${mediumGrayBorder}`,
  boxSizing: 'border-box',
};

const errorStyle = {
  color: 'red',
  marginTop: 15,
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 500,
};

const preStyle = {
  background: '#f5f5f5',
  padding: 8,
  borderRadius: 4,
  fontSize: 13,
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
};

const tableHeaderStyle = {
  padding: '12px 8px',
  borderBottom: `2px solid ${secondaryBlue}`,
  textAlign: 'left',
  backgroundColor: '#e3eafc',
};

const tableCellStyle = {
  padding: '12px 8px',
  verticalAlign: 'top',
  borderBottom: `1px solid ${lightGrayBorder}`,
  wordBreak: 'break-word',
};

const tableRowStyle = (eventType) => ({
  background: eventType === 'response' ? '#ffebee' : eventType === 'detection' ? '#e0f2f7' : '#fff',
  transition: 'background 0.2s',
  '&:hover': {
    background: eventType === 'response' ? '#ffdddd' : eventType === 'detection' ? '#ccecfb' : '#f0f0f0',
  }
});

function App() {
  const [backendMsg, setBackendMsg] = useState('');
  const [attackResult, setAttackResult] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [aiEvasion, setAIEvasion] = useState(1);
  const [auth, setAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [eventSummary, setEventSummary] = useState({});
  const [exportStatus, setExportStatus] = useState('');

  useEffect(() => {
    ping().then(data => setBackendMsg(data.message)).catch(err => {
      console.error("Ping failed:", err);
      setBackendMsg('Backend unreachable');
    });
  }, []);

  useEffect(() => {
    if (auth) {
      fetchTimeline();
      fetchEventSummary();
      // Fetch periodically
      const intervalId = setInterval(() => {
        fetchTimeline();
        fetchEventSummary();
      }, 10000); // Fetch every 10 seconds
      return () => clearInterval(intervalId); // Cleanup on unmount or auth change
    }
  }, [auth]);

  const fetchTimeline = async () => {
    try {
      const data = await getTimeline();
      console.log("Timeline data received:", data); // Log received data
      setTimeline(data);
    } catch (e) {
      console.error("Failed to fetch timeline:", e);
      if (e.response && e.response.status === 401) {
         setAuth(false);
      }
      setTimeline([]);
    }
  };

   const fetchEventSummary = async () => {
    try {
      const data = await getEventSummary();
      console.log("Event summary data received:", data);
      setEventSummary(data);
    } catch (e) {
      console.error("Failed to fetch event summary:", e);
      if (e.response && e.response.status === 401) {
         setAuth(false);
      }
      setEventSummary({});
    }
  };

  const handlePhishing = async () => {
    setAttackResult(null); // Clear previous result
    try {
      const res = await runPhishing('victim@example.com');
      setAttackResult(res);
      fetchTimeline();
      fetchEventSummary();
    } catch (err) {
      console.error("Phishing attack failed:", err);
       if (err.response && err.response.status === 401) {
         setAuth(false);
      }
      setAttackResult({ error: "Failed to run phishing attack." });
    }
  };

  const handleLateral = async () => {
     setAttackResult(null); // Clear previous result
    try {
      const res = await runLateral('target_host');
      setAttackResult(res);
      fetchTimeline();
      fetchEventSummary();
    } catch (err) {
       console.error("Lateral movement attack failed:", err);
        if (err.response && err.response.status === 401) {
         setAuth(false);
      }
      setAttackResult({ error: "Failed to run lateral movement attack." });
    }
  };

  const handleAIEvasionChange = (event) => {
    setAIEvasion(Number(event.target.value));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.log("Attempting login with:", { username, password });
    try {
      const res = await login(username, password);
      if (res.success) {
        setAuth(true);
        setError('');
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError('Login failed. Please check credentials and try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    console.log("Attempting registration with:", { username, password });
    try {
      const res = await register(username, password);
      if (res.success) {
        setAuthMode('login');
        setError('Registration successful. Please log in.');
        setUsername('');
        setPassword('');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      setError('Registration failed. Please try again with a different username.');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await logout();
      if (res.success) {
        setAuth(false);
        setAuthMode('login'); // Return to login page after logout
        // Clear data on logout
        setTimeline([]);
        setEventSummary({});
      } else {
        console.error("Logout failed:", res.error);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleExportEvents = async () => {
    setExportStatus('Exporting...');
    try {
      const data = await exportEvents();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'asdf_events.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus('Export successful!');
    } catch (error) {
      console.error("Failed to export events:", error);
       if (error.response && error.response.status === 401) {
         setAuth(false);
      }
      setExportStatus('Export failed.');
    }
     // Clear status message after a few seconds
    setTimeout(() => setExportStatus(''), 5000);
  };

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: grayBackground, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ ...cardStyle, width: '100%', maxWidth: 400, margin: 0 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 24, color: darkGrayText }}>ASDF {authMode === 'login' ? 'Login' : 'Register'}</h2>
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
            <button type="submit" style={{ ...buttonStyle, width: '100%', margin: '15px 0 0 0' }} onMouseOver={e => e.target.style.background=secondaryBlue} onMouseOut={e => e.target.style.background=primaryBlue}>
              {authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ ...buttonAltStyle, width: '100%', marginTop: 15, background: secondaryMagenta }} onMouseOver={e => e.target.style.background=primaryMagenta} onMouseOut={e => e.target.style.background=secondaryMagenta}>
            {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
          {error && <div style={errorStyle}>{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: grayBackground, paddingBottom: '40px' }}>
      {/* Header Bar */}
      <div style={{ background: primaryBlue, color: '#fff', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>Adversarial Simulation & Detection Framework (ASDF)</div>
        <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
        <div style={{ ...cardStyle, width: '100%' }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, color: darkGrayText }}>Dashboard Overview</h2>
          <p style={{ margin: '0 0 8px 0' }}>Welcome! This dashboard visualizes attacks and detections in real time.</p>
          <p style={{ margin: '0 0 16px 0' }}><b>Backend status:</b> {backendMsg}</p>

          {/* Event Summary Statistics */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 10, color: darkGrayText }}>Event Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: darkBlue }}>{eventSummary.attack || 0}</div>
                <div style={{ fontSize: 14, color: mediumGrayText }}>Attacks</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: primaryMagenta }}>{eventSummary.detection || 0}</div>
                <div style={{ fontSize: 14, color: mediumGrayText }}>Detections</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: darkBlue }}>{eventSummary.response || 0}</div>
                <div style={{ fontSize: 14, color: mediumGrayText }}>Responses</div>
              </div>
              <div>
                 <div style={{ fontSize: 28, fontWeight: 700, color: aiEvasion > 1 ? 'orange' : 'green' }}>{aiEvasion}</div>
                 <div style={{ fontSize: 14, color: mediumGrayText }}>AI Evasion Level</div>
              </div>
            </div>
          </div>


          <div style={{ marginBottom: 16, display: 'flex', gap: '10px' }}>
            <button onClick={handlePhishing} style={buttonStyle} onMouseOver={e => e.target.style.background=secondaryBlue} onMouseOut={e => e.target.style.background=primaryBlue}>Simulate Phishing Attack</button>
            <button onClick={handleLateral} style={buttonAltStyle} onMouseOver={e => e.target.style.background=secondaryMagenta} onMouseOut={e => e.target.style.background=primaryMagenta}>Simulate Lateral Movement Attack</button>
          </div>
          {attackResult && (
            <div style={{ ...cardStyle, background: '#e3f2fd', margin: '20px 0 0 0', boxShadow: 'none', border: '1px solid #90caf9', padding: 16, maxWidth: '100%' }}>
              <h3 style={{ marginTop: 0, color: darkBlue }}>Last Attack/Detection/Response Result:</h3>
              <pre style={preStyle}>{JSON.stringify(attackResult, null, 2)}</pre>
            </div>
          )}
        </div>
        <div style={{ ...cardStyle, width: '100%', marginTop: 20 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, color: darkGrayText }}>Analytics and Visualizations</h2>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
             {/* Attack Types Distribution Chart */}
             </div>

           {/* Reporting / Export Button */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button onClick={handleExportEvents} style={buttonStyle} onMouseOver={e => e.target.style.background=secondaryBlue} onMouseOut={e => e.target.style.background=primaryBlue}>Export All Events (JSON)</button>
               {exportStatus && <p style={{ marginTop: 10, fontSize: 14, color: darkGrayText }}>{exportStatus}</p>}
            </div>

        </div>

        <h3>Event Timeline (Most Recent 50)</h3>
        {timeline.length > 0 ? (
          <div style={{ ...cardStyle, padding: '0', margin: '20px auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                 <th style={tableHeaderStyle}>Timestamp</th>
                <th style={tableHeaderStyle}>Type</th>
                <th style={tableHeaderStyle}>MITRE</th>
                <th style={tableHeaderStyle}>Data</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((event, index) => (
                <tr key={index} style={tableRowStyle(event.type)}>
                  <td style={tableCellStyle}>{new Date(event.timestamp).toLocaleString()}</td>
                  <td style={tableCellStyle}>{event.type}</td>
                  <td style={tableCellStyle}>
                     {event.mitre_technique ? (
                       <a href={`https://attack.mitre.org/techniques/${event.mitre_technique}`} target="_blank" rel="noopener noreferrer">
                         {event.mitre_technique}
                       </a>
                     ) : (
                       'N/A'
                     )}
                  </td>
                  <td style={tableCellStyle}>
                     {typeof event.data === 'object' ? (
                      <pre style={preStyle}>{JSON.stringify(event.data, null, 2)}</pre>
                    ) : (
                      String(event.data) // Ensure data is stringified for rendering
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           </div>
        ) : (
          <p style={{ ...cardStyle, textAlign: 'center' }}>No events in timeline yet.</p>
        )}

      </div>
    </div>
  );
}

export default App; 