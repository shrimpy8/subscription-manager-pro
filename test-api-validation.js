#!/usr/bin/env node

// Quick API validation test script
const baseUrl = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing API Validation...\n');

  // Test 1: Valid request
  console.log('✅ Test 1: Valid subscription creation');
  try {
    const validResponse = await fetch(`${baseUrl}/api/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Subscription',
        category: 'AI Tools',
        cost: 29.99,
        billingCycle: 'Monthly',
        startDate: '2024-01-01',
        renewalDate: '2024-02-01'
      })
    });
    const validData = await validResponse.json();
    console.log('Status:', validResponse.status);
    console.log('Response:', JSON.stringify(validData, null, 2));
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n❌ Test 2: Invalid request (should return 400)');
  try {
    const invalidResponse = await fetch(`${baseUrl}/api/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '', // Invalid: empty string
        category: 'InvalidCategory', // Invalid: not in enum
        cost: 'not-a-number', // Invalid: not a number
        billingCycle: 'InvalidCycle' // Invalid: not in enum
      })
    });
    const invalidData = await invalidResponse.json();
    console.log('Status:', invalidResponse.status);
    console.log('Response:', JSON.stringify(invalidData, null, 2));
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n❌ Test 3: Invalid action');
  try {
    const actionResponse = await fetch(`${baseUrl}/api/subscriptions/sub-123/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'invalid-action' // Invalid: not in allowed actions
      })
    });
    const actionData = await actionResponse.json();
    console.log('Status:', actionResponse.status);
    console.log('Response:', JSON.stringify(actionData, null, 2));
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testAPI();
