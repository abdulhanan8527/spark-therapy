// Minimal web entry point without react-native-web dependencies
import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>SPARK Therapy Services</h1>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
          Web Application Loaded Successfully!
        </p>
        <p style={{ color: '#999', fontSize: '14px' }}>
          Backend API: http://localhost:5001
        </p>
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
          <p style={{ color: '#2e7d32', margin: 0 }}>✅ Application is running</p>
        </div>
      </div>
    </div>
  );
};

// Render the app
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.render(<App />, rootElement);
}

export default App;