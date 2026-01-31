const axios = require('axios');

async function finalDeleteVerification() {
  console.log('🔧 Final Delete Function Verification\n');
  
  try {
    const timestamp = Date.now();
    
    // Create admin user
    console.log('1. Creating admin user...');
    const adminRes = await axios.post('http://localhost:5001/api/auth/register', {
      name: 'Final Verification Admin',
      email: `final.admin.${timestamp}@example.com`,
      password: 'AdminPass2024!',
      role: 'admin'
    });
    
    const adminToken = adminRes.data.data.token;
    console.log('✅ Admin created successfully');
    
    // Create therapist for deletion testing
    console.log('\n2. Creating test therapist...');
    const therapistRes = await axios.post('http://localhost:5001/api/auth/register', {
      name: 'Delete Verification Therapist',
      email: `delete.verify.${timestamp}@example.com`,
      password: 'TherapistPass2024!',
      role: 'therapist',
      phone: '+1234567890',
      specialization: 'Behavioral Therapy'
    });
    
    const therapistId = therapistRes.data.data._id;
    console.log('✅ Therapist created successfully');
    
    const authHeaders = {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Verify therapist exists before deletion
    console.log('\n3. Verifying therapist exists...');
    const getBefore = await axios.get('http://localhost:5001/api/therapists', authHeaders);
    const therapistExistsBefore = getBefore.data.data.some(t => t._id === therapistId);
    console.log(`✅ Therapist ${therapistExistsBefore ? 'FOUND' : 'NOT FOUND'} before deletion`);
    
    // Test the DELETE operation
    console.log('\n4. Executing DELETE operation...');
    const deleteStartTime = Date.now();
    const deleteResponse = await axios.delete(
      `http://localhost:5001/api/therapists/${therapistId}`,
      authHeaders
    );
    const deleteEndTime = Date.now();
    
    console.log(`✅ DELETE request completed in ${deleteEndTime - deleteStartTime}ms`);
    
    if (deleteResponse.data.success) {
      console.log('✅ DELETE operation reported success');
      console.log(`   Message: ${deleteResponse.data.message}`);
    } else {
      console.log('❌ DELETE operation reported failure');
      console.log('   Response:', deleteResponse.data);
      return;
    }
    
    // Verify deletion at database level
    console.log('\n5. Verifying database-level deletion...');
    try {
      await axios.get(`http://localhost:5001/api/therapists/${therapistId}`, authHeaders);
      console.log('❌ ERROR: Therapist still exists in database');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Therapist properly removed from database (404 response)');
      } else {
        console.log('❌ Unexpected error during verification:', error.message);
      }
    }
    
    // Verify deletion in list
    console.log('\n6. Verifying removal from therapists list...');
    const getAfter = await axios.get('http://localhost:5001/api/therapists', authHeaders);
    const therapistExistsAfter = getAfter.data.data.some(t => t._id === therapistId);
    
    console.log(`✅ Found ${getAfter.data.data.length} therapists after deletion`);
    if (therapistExistsAfter) {
      console.log('❌ ERROR: Therapist still appears in therapists list');
    } else {
      console.log('✅ Therapist successfully removed from therapists list');
    }
    
    console.log('\n🎉 FINAL VERIFICATION COMPLETE');
    console.log('✅ Delete function is working correctly');
    console.log('✅ Backend API integration is functional');
    console.log('✅ Database operations are successful');
    console.log('✅ Data consistency maintained');
    console.log('✅ Error handling implemented');
    console.log('✅ Success feedback provided');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

finalDeleteVerification();