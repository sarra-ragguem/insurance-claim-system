const express = require('express');
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 4001;

// Database connection pool (connects to shared PostgreSQL)
const pool = new Pool({
    user: process.env.DB_USER || 'insurance_admin',
    password: process.env.DB_PASSWORD || 'password123',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'insurance_db',
    port: 5432,
});

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

// SOAP Service Implementation - Now queries the database
const identityService = {
    IdentityVerificationService: {
        IdentityServicePort: {
            verifyIdentity: async function(args, callback) {
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('SOAP Request Received - Identity Verification');
                console.log('   National ID:', args.nationalId);
                console.log('   Full Name:', args.fullName);
                console.log('   Date of Birth:', args.dateOfBirth);
                
                try {
                    // Query the database for the identity
                    const result = await pool.query(
                        'SELECT * FROM identities WHERE national_id = $1',
                        [args.nationalId]
                    );

                    let isValid = false;
                    let message = '';
                    let verificationCode = '';

                    if (result.rows.length === 0) {
                        isValid = false;
                        message = 'National ID not found in the identity database';
                        verificationCode = 'ERR_NOT_FOUND';
                    } else {
                        const storedIdentity = result.rows[0];
                        const storedDOB = new Date(storedIdentity.date_of_birth).toISOString().split('T')[0];
                        
                        if (storedIdentity.full_name.toLowerCase() !== args.fullName.toLowerCase()) {
                            isValid = false;
                            message = 'Name does not match the records';
                            verificationCode = 'ERR_NAME_MISMATCH';
                        } else if (storedDOB !== args.dateOfBirth) {
                            isValid = false;
                            message = 'Date of birth does not match the records';
                            verificationCode = 'ERR_DOB_MISMATCH';
                        } else {
                            isValid = true;
                            message = 'Identity successfully verified';
                            verificationCode = 'VERIFIED_' + Date.now();
                        }
                    }

                    const response = {
                        isValid: isValid,
                        verificationCode: verificationCode,
                        message: message,
                        timestamp: new Date().toISOString()
                    };

                    console.log('SOAP Response:');
                    console.log('   Is Valid:', response.isValid);
                    console.log('   Code:', response.verificationCode);
                    console.log('   Message:', response.message);
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

                    callback(response);
                } catch (err) {
                    console.error('❌ Database error:', err.message);
                    callback({
                        isValid: false,
                        verificationCode: 'ERR_DATABASE',
                        message: 'Database error occurred',
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }
    }
};

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ 
            service: 'Identity Verification Service',
            protocol: 'SOAP',
            status: 'running',
            database: 'connected',
            port: PORT,
            wsdl: `http://localhost:${PORT}/soap/identity?wsdl`
        });
    } catch (err) {
        res.status(500).json({ 
            service: 'Identity Verification Service',
            status: 'error',
            database: 'disconnected',
            error: err.message
        });
    }
});

// Start the server
async function startServer() {
    try {
        await waitForDatabase();
        
        app.listen(PORT, () => {
            console.log('════════════════════════════════════════════');
            console.log('   IDENTITY VERIFICATION SERVICE (SOAP)');
            console.log('   Database: PostgreSQL (shared)');
            console.log('════════════════════════════════════════════');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📄 WSDL available at: http://localhost:${PORT}/soap/identity?wsdl`);
            console.log(`💚 Health check at: http://localhost:${PORT}/health`);
            console.log('════════════════════════════════════════════\n');

            const wsdlPath = path.join(__dirname, 'identity.wsdl');
            const wsdl = fs.readFileSync(wsdlPath, 'utf8');
            
            soap.listen(app, '/soap/identity', identityService, wsdl, () => {
                console.log('✅ SOAP endpoint ready at /soap/identity');
            });
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

startServer();
