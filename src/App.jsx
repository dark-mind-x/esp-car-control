import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';

const MQTT_BROKER = 'wss://broker.hivemq.com:8884/mqtt';
const MQTT_TOPIC = 'esp8266/car/command/voicecar01';

export default function App() {
  const [client, setClient] = useState(null);
  const [status, setStatus] = useState('Connecting to Cloud...');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on('connect', () => {
      setStatus('Connected to Cloud! Ready');
    });

    mqttClient.on('error', (err) => {
      setStatus('Cloud Connection Error');
      console.error(err);
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, []);

  const sendCmd = (cmd) => {
    if (!client || !client.connected) {
      alert('Not connected to cloud broker yet!');
      return;
    }
    setStatus(`Publishing: ${cmd.toUpperCase()}`);
    client.publish(MQTT_TOPIC, cmd);
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('Listening... Speak Now');
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      if (text.includes('forward') || text.includes('go')) sendCmd('forward');
      else if (text.includes('back') || text.includes('reverse')) sendCmd('backward');
      else if (text.includes('left')) sendCmd('left');
      else if (text.includes('right')) sendCmd('right');
      else if (text.includes('stop')) sendCmd('stop');
    };

    recognition.start();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>CLOUD MQTT VOICE CAR</h1>
        <div style={styles.statusBadge}>{status}</div>
      </div>

      <div style={styles.micContainer}>
        <button onClick={toggleMic} style={{ ...styles.micBtn, ...(isListening ? styles.micListening : {}) }}>
          🎤
        </button>
        <div style={styles.micLabel}>{isListening ? 'Listening...' : 'Tap Mic & Speak'}</div>
      </div>

      <div style={styles.dpad}>
        <button style={{ ...styles.btn, gridColumn: 2, gridRow: 1 }} onClick={() => sendCmd('forward')}>▲ FORWARD</button>
        <button style={{ ...styles.btn, gridColumn: 1, gridRow: 2 }} onClick={() => sendCmd('left')}>◄ LEFT</button>
        <button style={{ ...styles.btn, gridColumn: 2, gridRow: 2, background: '#ea580c' }} onClick={() => sendCmd('stop')}>STOP</button>
        <button style={{ ...styles.btn, gridColumn: 3, gridRow: 2 }} onClick={() => sendCmd('right')}>RIGHT ►</button>
        <button style={{ ...styles.btn, gridColumn: 2, gridRow: 3 }} onClick={() => sendCmd('backward')}>▼ BACK</button>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '100vh', padding: '24px' },
  header: { textAlign: 'center' },
  title: { fontSize: '22px', color: '#38bdf8' },
  statusBadge: { marginTop: '12px', padding: '8px 20px', backgroundColor: '#1e293b', borderRadius: '999px', color: '#facc15', fontSize: '14px' },
  micContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  micBtn: { width: '110px', height: '110px', borderRadius: '50%', background: '#ef4444', border: 'none', fontSize: '40px', cursor: 'pointer' },
  micListening: { background: '#22c55e', transform: 'scale(1.08)' },
  micLabel: { marginTop: '10px', color: '#94a3b8' },
  dpad: { display: 'grid', gridTemplateColumns: 'repeat(3, 95px)', gridTemplateRows: 'repeat(3, 75px)', gap: '12px' },
  btn: { border: 'none', borderRadius: '16px', backgroundColor: '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};
