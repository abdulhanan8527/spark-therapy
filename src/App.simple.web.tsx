import React from 'react';
import { View, Text } from 'react-native';

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>SPARK Therapy Services</Text>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 }}>Web Application Loaded Successfully!</Text>
      <Text style={{ fontSize: 14, color: '#999' }}>Backend API: http://localhost:5001</Text>
    </View>
  );
};

export default App;