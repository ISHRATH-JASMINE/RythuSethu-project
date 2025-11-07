import axios from 'axios';

const testLogin = async () => {
  try {
    console.log('🔐 Testing login via API...\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ramesh.kumar@rythusetu.com',
      password: 'dealer123'
    });
    
    console.log('✅ Login successful!');
    console.log('\n📋 Response:');
    console.log('Token:', response.data.token?.substring(0, 20) + '...');
    console.log('User:', response.data.user?.name);
    console.log('Role:', response.data.user?.role);
    console.log('Email:', response.data.user?.email);
    console.log('\n✅ You can now login to the application!');
    
  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testLogin();
