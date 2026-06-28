const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, 'certs');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Check if certificates already exist
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.log('Generating SSL certificates...');
  
  try {
    // Generate self-signed certificate using Node.js built-in crypto
    const crypto = require('crypto');
    const { createCertificate } = require('pem');
    
    // Using pem package if available
    try {
      require.resolve('pem');
      console.log('Using pem package...');
      // If pem is installed, use it
      const pem = require('pem');
      pem.createCertificate({ days: 365, selfSigned: true }, (err, keys) => {
        if (err) throw err;
        fs.writeFileSync(keyPath, keys.serviceKey);
        fs.writeFileSync(certPath, keys.certificate);
        console.log('✅ Certificates generated successfully!');
        console.log(`Key: ${keyPath}`);
        console.log(`Cert: ${certPath}`);
      });
    } catch {
      // Fallback: use OpenSSL command
      console.log('Attempting to generate with OpenSSL...');
      try {
        execSync(`openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, {
          stdio: 'inherit'
        });
        console.log('✅ Certificates generated successfully!');
      } catch (err) {
        console.error('❌ Could not generate certificates. Please run:');
        console.error(`  openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes`);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
} else {
  console.log('✅ Certificates already exist!');
}
