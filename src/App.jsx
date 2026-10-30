import React, { useState, useEffect } from 'react';
import './App.css'; // Optional: or use Tailwind classes

export default function App() {
  const [carIp, setCarIp] = useState('');
  const [status, setStatus] = useState('Ready for Command');
  const [isListening, setIsListening] = useState(false);

  // Load saved IP from localStorage on startup
  useEffect(() => {
    const savedIp = localStorage.getItem('esp_car_ip');
    if (savedIp) setCarIp(savedIp);
  }, []);

  const handleIpChange = (e) => {
    const ip = e.target.value.trim();
    setCarIp(ip);
    localStorage.setItem('esp_car_ip', ip);
  };

  const sendCmd = (cmd) => {
    if (!carIp) {
      alert('Please enter the ESP8266 Car IP address first!');
      return;
    }
    setStatus(`Action: ${cmd.toUpperCase()}`);
    // Sends secure HTTPS fetch to the ESP8266 local server
    fetch(`https://${carIp}/${cmd}`, { mode: 'no-cors' }).catch((err) => {
      console.error('Connection error:', err);
    });
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('Listening... Speak Now');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      setStatus(`Mic Error: ${e.error}`);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setStatus(`Heard: "${text}"`);

      if (text.includes('forward') || text.includes('go') || text.includes('ahead') || text.includes('start')) {
        sendCmd('forward');
      } else if (text.includes('back') || text.includes('reverse') || text.includes('backward')) {
        sendCmd('backward');
      } else if (text.includes('left')) {
        sendCmd('left');
      } else if (text.includes('right')) {
        sendCmd('right');
      } else if (text.includes('stop') || text.includes('halt') || text.includes('wait')) {
        sendCmd('stop');
      }
    };

    recognition.start();
  };

  return (
    <div style={styles.container}>
      {/* Header & IP Input */}
      <div style={styles.header}>
        <h1 style={styles.title}>NETLIFY VOICE CAR</h1>
        <input
          type="text"
          value={carIp}
          onChange={handleIpChange}
          placeholder="Enter Car IP (e.g. 192.168.43.50)"
          style={styles.ipInput}
        />
        <div style={styles.statusBadge}>{status}</div>
      </div>

      {/* Voice Recognition Button */}
      <div style={styles.micContainer}>
        <button
          onClick={toggleMic}
          style={{
            ...styles.micBtn,
            ...(isListening ? styles.micListening : {}),
          }}
        >
          <svg viewBox="0 0 24 24" style={styles.micIcon}>
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
          </svg>
        </button>
        <div style={styles.micLabel}>{isListening ? 'Listening...' : 'Tap Mic & Speak'}</div>
      </div>

      {/* D-Pad Grid Controls */}
      <div style={styles.dpad}>
        <button style={{ ...styles.btn, gridColumn: 2, gridRow: 1 }} onClick={() => sendCmd('forward')}>
          ▲ FORWARD
        </button>
        <button style={{ ...styles.btn, gridColumn: 1, gridRow: 2 }} onClick={() => sendCmd('left')}>
          ◄ LEFT
        </button>
        <button style={{ ...styles.btn, gridColumn: 2, gridRow: 2, background: '#ea580c', borderColor: '#fb923c' }} onClick={() => sendCmd('stop')}>
          STOP
        </button>
        <button style={{ ...styles.btn, gridColumn: 3, gridRow: 2 }} onClick={() => sendCmd('right')}>
          RIGHT ►
        </button>
        <button style={{ ...styles.btn, gridColumn: 2, gridRow: 3 }} onClick={() => sendCmd('backward')}>
          ▼ BACK
        </button>
      </div>
    </div>
  );
}

// Inline styles optimized for mobile viewports
const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '100vh',
    padding: '24px 16px',
    boxSizing: 'border-box',
    userSelect: 'none',
  },
  header: { textAlign: 'center', width: '100%' },
  title: { fontSize: '22px', fontWeight: '700', color: '#38bdf8', margin: '0 0 10px 0' },
  ipInput: {
    padding: '10px 14px',
    fontSize: '15px',
    borderRadius: '10px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#fff',
    textAlign: 'center',
    outline: 'none',
    width: '240px',
  },
  statusBadge: {
    display: 'inline-block',
    marginTop: '12px',
    padding: '8px 20px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#facc15',
  },
  micContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' },
  micBtn: {
    width: '115px',
    height: '115px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: '4px solid #fca5a5',
    boxShadow: '0 8px 25px rgba(239, 68, 68, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.15s, background 0.2s',
  },
  micListening: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    borderColor: '#86efac',
    boxShadow: '0 0 30px rgba(34, 197, 94, 0.7)',
    transform: 'scale(1.08)',
  },
  micIcon: { width: '50px', height: '50px', fill: '#ffffff' },
  micLabel: { marginTop: '10px', fontSize: '14px', color: '#94a3b8', fontWeight: '500' },
  dpad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 95px)',
    gridTemplateRows: 'repeat(3, 75px)',
    gap: '12px',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10px',
  },
  btn: {
    width: '100%',
    height: '100%',
    border: '2px solid #334155',
    borderRadius: '16px',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
};
