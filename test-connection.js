const http = require('http');

console.log('🔍 Testing connection to http://localhost:8081...\n');

// Test 1: Check if port 8081 is listening
const testPort = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8081', (res) => {
      console.log(`✅ Port 8081 is accessible`);
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers['content-type'])}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ Cannot connect to port 8081`);
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ Timeout connecting to port 8081`);
      req.destroy();
      resolve(false);
    });
  });
};

// Test 2: Check backend API (port 5001)
const testBackend = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5001/api/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Backend API is accessible`);
        console.log(`   Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`   Response: ${JSON.stringify(json, null, 2)}`);
        } catch (e) {
          console.log(`   Response: ${data}`);
        }
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Cannot connect to backend API`);
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ Timeout connecting to backend API`);
      req.destroy();
      resolve(false);
    });
  });
};

// Run tests
(async () => {
  console.log('🧪 Running connection tests...\n');
  
  const portOk = await testPort();
  console.log();
  const backendOk = await testBackend();
  
  console.log('\n' + '='.repeat(50));
  if (portOk && backendOk) {
    console.log('🎉 All tests passed! Your development environment is ready.');
    console.log('\n📱 To run the app:');
    console.log('   1. Open Expo Go on your phone');
    console.log('   2. Scan the QR code from the Metro bundler');
    console.log('   3. Or press "w" in the terminal to open in web browser');
    console.log('\n🌐 Access URLs:');
    console.log('   • Metro Bundler: http://localhost:8081');
    console.log('   • Backend API: http://localhost:5001/api');
    console.log('   • Backend Health: http://localhost:5001/api/health');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
    if (!portOk) {
      console.log('\n💡 Try running: npm run dev');
    }
    if (!backendOk) {
      console.log('\n💡 Try running: npm run backend');
    }
  }
  console.log('='.repeat(50));
})();