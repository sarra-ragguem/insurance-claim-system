const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { Pool } = require('pg');

const PORT = 4002;

// Database connection pool (connects to shared PostgreSQL)
const pool = new Pool({
    user: process.env.DB_USER || 'insurance_admin',
    password: process.env.DB_PASSWORD || 'password123',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'insurance_db',
    port: 5432,
});

// Load the proto file
const PROTO_PATH = path.join(__dirname, 'policy.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const policyProto = grpc.loadPackageDefinition(packageDefinition).policy;

// Wait for database to be ready
async function waitForDatabase() {
    let retries = 10;
    while (retries > 0) {
        try {
            await pool.query('SELECT 1');
            console.log('✅ Connected to PostgreSQL database');
            return true;
        } catch (err) {
            console.log(`⏳ Waiting for database... (${retries} retries left)`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    throw new Error('Could not connect to database');
}

// Calculate days until expiry
function getDaysUntilExpiry(endDate) {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// gRPC Service Implementation - Now queries the database
const policyService = {
    // Validate if policy covers the claim type
    ValidatePolicy: async (call, callback) => {
        const { policy_id, claim_type, amount_requested } = call.request;
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 gRPC Request Received - Policy Validation');
        console.log('   Policy ID:', policy_id);
        console.log('   Claim Type:', claim_type);
        console.log('   Amount Requested:', amount_requested);

        try {
            const result = await pool.query(
                'SELECT * FROM policies WHERE policy_id = $1',
                [policy_id]
            );

            if (result.rows.length === 0) {
                const response = {
                    is_covered: false,
                    is_within_limit: false,
                    policy_status: 'NOT_FOUND',
                    coverage_limit: 0,
                    deductible: 0,
                    message: `Policy ${policy_id} not found in the system`,
                    validation_code: 'ERR_POLICY_NOT_FOUND'
                };
                console.log('📤 gRPC Response:', response.message);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                callback(null, response);
                return;
            }

            const policy = result.rows[0];

            if (policy.status !== 'ACTIVE') {
                const response = {
                    is_covered: false,
                    is_within_limit: false,
                    policy_status: policy.status,
                    coverage_limit: parseFloat(policy.max_coverage),
                    deductible: parseFloat(policy.deductible_percentage),
                    message: `Policy is ${policy.status}. Cannot process claims.`,
                    validation_code: 'ERR_POLICY_' + policy.status
                };
                console.log('📤 gRPC Response:', response.message);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                callback(null, response);
                return;
            }

            const isCovered = policy.covered_claims.includes(claim_type.toUpperCase());
            const isWithinLimit = amount_requested <= parseFloat(policy.max_coverage);
            const deductibleAmount = amount_requested * (parseFloat(policy.deductible_percentage) / 100);

            let message = '';
            let validationCode = '';

            if (!isCovered) {
                message = `Claim type ${claim_type} is not covered by this ${policy.policy_type} policy`;
                validationCode = 'ERR_NOT_COVERED';
            } else if (!isWithinLimit) {
                message = `Amount ${amount_requested} exceeds coverage limit of ${policy.max_coverage}`;
                validationCode = 'ERR_EXCEEDS_LIMIT';
            } else {
                message = `Policy validated successfully. Claim type ${claim_type} is covered.`;
                validationCode = 'VALIDATED_' + Date.now();
            }

            const response = {
                is_covered: isCovered,
                is_within_limit: isWithinLimit,
                policy_status: policy.status,
                coverage_limit: parseFloat(policy.max_coverage),
                deductible: deductibleAmount,
                message: message,
                validation_code: validationCode
            };

            console.log('📤 gRPC Response:');
            console.log('   Is Covered:', response.is_covered);
            console.log('   Within Limit:', response.is_within_limit);
            console.log('   Message:', response.message);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            callback(null, response);
        } catch (err) {
            console.error('❌ Database error:', err.message);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Database error: ' + err.message
            });
        }
    },

    // Get detailed policy information
    GetPolicyDetails: async (call, callback) => {
        const { policy_id } = call.request;
        
        console.log('📥 gRPC Request - Get Policy Details:', policy_id);
        
        try {
            const result = await pool.query(
                'SELECT * FROM policies WHERE policy_id = $1',
                [policy_id]
            );

            if (result.rows.length === 0) {
                callback({
                    code: grpc.status.NOT_FOUND,
                    message: `Policy ${policy_id} not found`
                });
                return;
            }

            const policy = result.rows[0];
            callback(null, {
                policy_id: policy.policy_id,
                holder_name: policy.holder_name,
                policy_type: policy.policy_type,
                covered_claims: policy.covered_claims,
                max_coverage: parseFloat(policy.max_coverage),
                deductible_percentage: parseFloat(policy.deductible_percentage),
                start_date: policy.start_date.toISOString().split('T')[0],
                end_date: policy.end_date.toISOString().split('T')[0],
                status: policy.status
            });
        } catch (err) {
            console.error('❌ Database error:', err.message);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Database error: ' + err.message
            });
        }
    },

    // Check policy status
    CheckPolicyStatus: async (call, callback) => {
        const { policy_id } = call.request;
        
        console.log('📥 gRPC Request - Check Policy Status:', policy_id);
        
        try {
            const result = await pool.query(
                'SELECT * FROM policies WHERE policy_id = $1',
                [policy_id]
            );

            if (result.rows.length === 0) {
                callback(null, {
                    policy_id: policy_id,
                    status: 'NOT_FOUND',
                    expiry_date: '',
                    days_until_expiry: 0,
                    message: `Policy ${policy_id} does not exist`
                });
                return;
            }

            const policy = result.rows[0];
            const daysUntilExpiry = getDaysUntilExpiry(policy.end_date);

            callback(null, {
                policy_id: policy_id,
                status: policy.status,
                expiry_date: policy.end_date.toISOString().split('T')[0],
                days_until_expiry: daysUntilExpiry,
                message: policy.status === 'ACTIVE' 
                    ? `Policy is active. ${daysUntilExpiry} days until expiry.`
                    : `Policy is ${policy.status}`
            });
        } catch (err) {
            console.error('❌ Database error:', err.message);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Database error: ' + err.message
            });
        }
    }
};

// Start the gRPC server
async function startServer() {
    try {
        await waitForDatabase();
        
        const server = new grpc.Server();
        server.addService(policyProto.PolicyService.service, policyService);
        
        server.bindAsync(
            `0.0.0.0:${PORT}`,
            grpc.ServerCredentials.createInsecure(),
            (error, port) => {
                if (error) {
                    console.error('❌ Failed to start gRPC server:', error);
                    return;
                }
                
                console.log('📋 ════════════════════════════════════════════');
                console.log('   POLICY VALIDATION SERVICE (gRPC)');
                console.log('   Database: PostgreSQL (shared)');
                console.log('════════════════════════════════════════════');
                console.log(`🚀 gRPC Server running on port ${port}`);
                console.log(`📄 Proto file: policy.proto`);
                console.log('════════════════════════════════════════════');
                console.log('Available Methods:');
                console.log('  - ValidatePolicy(policy_id, claim_type, amount)');
                console.log('  - GetPolicyDetails(policy_id)');
                console.log('  - CheckPolicyStatus(policy_id)');
                console.log('════════════════════════════════════════════\n');
            }
        );
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

startServer();
