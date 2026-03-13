/**
 * SOAP Client Test - Identity Verification Service
 * 
 * Run: node test-client.js
 */

const soap = require('soap');

const WSDL_URL = 'http://localhost:4001/soap/identity?wsdl';

async function testIdentityVerification() {
    console.log('🧪 ════════════════════════════════════════════');
    console.log('   TESTING SOAP IDENTITY SERVICE');
    console.log('════════════════════════════════════════════\n');

    try {
        const client = await soap.createClientAsync(WSDL_URL);
        
        // Test Case 1: Valid Identity
        console.log('📋 Test 1: Valid Identity (Should PASS)');
        console.log('─────────────────────────────────────────');
        const validResult = await client.verifyIdentityAsync({
            nationalId: '12345678',
            fullName: 'Ahmed Ben Ali',
            dateOfBirth: '1990-05-15'
        });
        console.log('Result:', JSON.stringify(validResult[0], null, 2));
        console.log('\n');

        // Test Case 2: Invalid National ID
        console.log('📋 Test 2: Invalid National ID (Should FAIL)');
        console.log('─────────────────────────────────────────');
        const invalidIdResult = await client.verifyIdentityAsync({
            nationalId: '99999999',
            fullName: 'Unknown Person',
            dateOfBirth: '1990-01-01'
        });
        console.log('Result:', JSON.stringify(invalidIdResult[0], null, 2));
        console.log('\n');

        // Test Case 3: Name Mismatch
        console.log('📋 Test 3: Name Mismatch (Should FAIL)');
        console.log('─────────────────────────────────────────');
        const nameMismatchResult = await client.verifyIdentityAsync({
            nationalId: '12345678',
            fullName: 'Wrong Name',
            dateOfBirth: '1990-05-15'
        });
        console.log('Result:', JSON.stringify(nameMismatchResult[0], null, 2));
        console.log('\n');

        // Test Case 4: DOB Mismatch
        console.log('📋 Test 4: Date of Birth Mismatch (Should FAIL)');
        console.log('─────────────────────────────────────────');
        const dobMismatchResult = await client.verifyIdentityAsync({
            nationalId: '12345678',
            fullName: 'Ahmed Ben Ali',
            dateOfBirth: '1995-01-01'
        });
        console.log('Result:', JSON.stringify(dobMismatchResult[0], null, 2));
        console.log('\n');

        console.log('✅ All tests completed!');
        console.log('════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testIdentityVerification();
