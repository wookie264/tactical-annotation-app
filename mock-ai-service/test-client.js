const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testMockAIService() {
  console.log('🧪 Testing Mock AI Service...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check Response:', healthData);
    console.log('');

    // Test 2: Single AI Analysis
    console.log('2. Testing Single AI Analysis...');
    const analysisResponse = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_path: '/uploads/sample-match.mp4',
        analysis_type: 'tactical_football'
      })
    });
    const analysisData = await analysisResponse.json();
    console.log('✅ AI Analysis Response:', JSON.stringify(analysisData, null, 2));
    console.log('');

    // Test 3: Formation Analysis
    console.log('3. Testing Formation Analysis...');
    const formationResponse = await fetch(`${BASE_URL}/analyze/formation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_path: '/uploads/sample-match.mp4'
      })
    });
    const formationData = await formationResponse.json();
    console.log('✅ Formation Analysis Response:', JSON.stringify(formationData, null, 2));
    console.log('');

    // Test 4: Pressing Analysis
    console.log('4. Testing Pressing Analysis...');
    const pressingResponse = await fetch(`${BASE_URL}/analyze/pressing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_path: '/uploads/sample-match.mp4'
      })
    });
    const pressingData = await pressingResponse.json();
    console.log('✅ Pressing Analysis Response:', JSON.stringify(pressingData, null, 2));
    console.log('');

    // Test 5: Batch Analysis
    console.log('5. Testing Batch Analysis...');
    const batchResponse = await fetch(`${BASE_URL}/analyze/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videos: [
          '/uploads/match1.mp4',
          '/uploads/match2.mp4',
          '/uploads/match3.mp4'
        ]
      })
    });
    const batchData = await batchResponse.json();
    console.log('✅ Batch Analysis Response:', JSON.stringify(batchData, null, 2));
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the Mock AI Service is running on http://localhost:3001');
    console.log('   Run: cd mock-ai-service && npm start');
  }
}

// Run the tests
testMockAIService(); 