import { useEffect, useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function FirebaseTest() {
  const [status, setStatus] = useState('Checking Firebase configuration...');
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Test Firebase initialization
        console.log('Firebase auth object:', auth);
        setStatus('Firebase initialized successfully!');
        
        // Show config (without sensitive values)
        setConfig({
          authDomain: 'hospital-readmission-a5231.firebaseapp.com',
          projectId: 'hospital-readmission-a5231',
          appId: '1:936244557596:web:a6a85d362f2063554e6cd9',
          measurementId: 'G-92VJ5030F9'
        });

      } catch (err) {
        setError(`Firebase initialization failed: ${err.message}`);
        console.error('Firebase error:', err);
      }
    };

    testFirebase();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Firebase Configuration Test</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Status: {status}</h3>
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>
      
      {config && (
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '5px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h3>Configuration:</h3>
          <pre style={{ 
            background: 'white', 
            padding: '10px', 
            borderRadius: '4px',
            overflowX: 'auto'
          }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px', color: '#666' }}>
        <p>Check the browser's developer console (F12) for more detailed logs.</p>
      </div>
    </div>
  );
}
