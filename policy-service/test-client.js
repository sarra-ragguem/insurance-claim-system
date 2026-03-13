/**
 * gRPC Client Test - Policy Validation Service
 * 
 * Run: node test-client.js
 */

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'policy.proto');
const SERVER_ADDRESS = 'localhost:4002';

// Load proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const policyProto = grpc.loadPackageDefinition(packageDefinition).policy;

// Create client
const client = new policyProto.PolicyService(
    SERVER_ADDRESS,
    grpc.credentials.createInsecure()
);

async function testValidatePolicy(policyId, claimType, amount) {
    return new Promise((resolve, reject) => {
        client.ValidatePolicy({
            policy_id: policyId,
            claim_type: claimType,
            amount_requested: amount
        }, (error, response) => {
            if (error) reject(error);
            else resolve(response);
        });
    });
}

async function testGetPolicyDetails(policyId) {
    return new Promise((resolve, reject) => {
        client.GetPolicyDetails({ policy_id: policyId }, (error, response) => {
            if (error) reject(error);
            else resolve(response);
        });
    });
}

async function testCheckPolicyStatus(policyId) {
    return new Promise((resolve, reject) => {
        client.CheckPolicyStatus({ policy_id: policyId }, (error, response) => {
            if (error) reject(error);
            else resolve(response);
        });
    });
}

async function runTests() {
    console.log('🧪 ════════════════════════════════════════════');
    console.log('   TESTING gRPC POLICY SERVICE');
    console.log('════════════════════════════════════════════\n');

    try {
        // Test 1: Valid policy with covered claim type
        console.log('📋 Test 1: Valid Policy + Covered Claim (Should PASS)');
        console.log('─────────────────────────────────────────');
        const result1 = await testValidatePolicy('POL-001', 'AUTO', 5000);
        console.log('Result:', JSON.stringify(result1, null, 2));
        console.log('\n');

        // Test 2: Valid policy with uncovered claim type
        console.log('📋 Test 2: Valid Policy + Uncovered Claim (Should FAIL)');
        console.log('─────────────────────────────────────────');
        const result2 = await testValidatePolicy('POL-001', 'HEALTH', 5000);
        console.log('Result:', JSON.stringify(result2, null, 2));
        console.log('\n');

        // Test 3: Amount exceeds coverage limit
        console.log('📋 Test 3: Amount Exceeds Limit (Should FAIL)');
        console.log('─────────────────────────────────────────');
        const result3 = await testValidatePolicy('POL-001', 'AUTO', 100000);
        console.log('Result:', JSON.stringify(result3, null, 2));
        console.log('\n');

        // Test 4: Expired policy
        console.log('📋 Test 4: Expired Policy (Should FAIL)');
        console.log('─────────────────────────────────────────');
        const result4 = await testValidatePolicy('POL-004', 'HOME', 5000);
        console.log('Result:', JSON.stringify(result4, null, 2));
        console.log('\n');

        // Test 5: Non-existent policy
        console.log('📋 Test 5: Non-existent Policy (Should FAIL)');
        console.log('─────────────────────────────────────────');
        const result5 = await testValidatePolicy('POL-999', 'AUTO', 5000);
        console.log('Result:', JSON.stringify(result5, null, 2));
        console.log('\n');

        // Test 6: Get Policy Details
        console.log('📋 Test 6: Get Policy Details');
        console.log('─────────────────────────────────────────');
        const result6 = await testGetPolicyDetails('POL-005');
        console.log('Result:', JSON.stringify(result6, null, 2));
        console.log('\n');

        // Test 7: Check Policy Status
        console.log('📋 Test 7: Check Policy Status');
        console.log('─────────────────────────────────────────');
        const result7 = await testCheckPolicyStatus('POL-001');
        console.log('Result:', JSON.stringify(result7, null, 2));
        console.log('\n');

        console.log('✅ All tests completed!');
        console.log('════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

runTests();
