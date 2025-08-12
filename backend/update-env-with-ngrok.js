const fs = require('fs');
const path = require('path');
const http = require('http');

class SimpleEnvUpdater {
    constructor() {
        this.envPath = path.join(__dirname, '.env');
    }

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
    }

    async getNgrokUrl() {
        this.log('🔍 Đang lấy URL từ ngrok API...');
        
        return new Promise((resolve, reject) => {
            const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const tunnels = JSON.parse(data);
                        const httpsTunnel = tunnels.tunnels.find(tunnel => 
                            tunnel.proto === 'https' && tunnel.config.addr.includes('5000')
                        );
                        
                        if (httpsTunnel) {
                            const url = httpsTunnel.public_url;
                            this.log(`✅ Tìm thấy ngrok URL: ${url}`);
                            resolve(url);
                        } else {
                            reject(new Error('Không tìm thấy HTTPS tunnel cho port 5000'));
                        }
                    } catch (error) {
                        reject(new Error(`Lỗi parse JSON: ${error.message}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(new Error(`Lỗi kết nối ngrok API: ${error.message}\nĐảm bảo ngrok đang chạy: ngrok http 5000`));
            });
            
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout khi lấy ngrok URL'));
            });
        });
    }

    updateEnvFile(ngrokUrl) {
        this.log('📝 Đang cập nhật file .env...');
        
        try {
            let envContent = fs.readFileSync(this.envPath, 'utf8');
            
            // Backup original file
            const backupPath = `${this.envPath}.backup.${Date.now()}`;
            fs.writeFileSync(backupPath, envContent);
            this.log(`💾 Đã backup file .env gốc tại: ${backupPath}`);
            
            // Update MOMO_REDIRECT_URL
            const redirectUrlPattern = /MOMO_REDIRECT_URL\s*=\s*.*/;
            const newRedirectUrl = `MOMO_REDIRECT_URL=${ngrokUrl}/api/payment/momo/return`;
            
            if (redirectUrlPattern.test(envContent)) {
                envContent = envContent.replace(redirectUrlPattern, newRedirectUrl);
                this.log('✅ Đã cập nhật MOMO_REDIRECT_URL');
            } else {
                envContent += `\n${newRedirectUrl}`;
                this.log('➕ Đã thêm MOMO_REDIRECT_URL');
            }
            
            // Update MOMO_IPN_URL
            const ipnUrlPattern = /MOMO_IPN_URL\s*=\s*.*/;
            const newIpnUrl = `MOMO_IPN_URL=${ngrokUrl}/api/payment/momo/ipn`;
            
            if (ipnUrlPattern.test(envContent)) {
                envContent = envContent.replace(ipnUrlPattern, newIpnUrl);
                this.log('✅ Đã cập nhật MOMO_IPN_URL');
            } else {
                envContent += `\n${newIpnUrl}`;
                this.log('➕ Đã thêm MOMO_IPN_URL');
            }
            
            // Write updated content
            fs.writeFileSync(this.envPath, envContent);
            
            this.log('🎉 Đã cập nhật file .env thành công!');
            this.log(`🔗 Redirect URL: ${ngrokUrl}/api/payment/momo/return`);
            this.log(`🔗 IPN URL: ${ngrokUrl}/api/payment/momo/ipn`);
            this.log('');
            this.log('📋 BƯỚC TIẾP THEO:');
            this.log('1. Restart backend server để load .env mới');
            this.log('2. Chạy test: node test-momo-integration.js');
            this.log('3. Thử thanh toán với QR code mới');
            
            return true;
        } catch (error) {
            this.log(`❌ Lỗi cập nhật .env: ${error.message}`);
            return false;
        }
    }

    async run() {
        try {
            this.log('🚀 Bắt đầu cập nhật .env với ngrok URL...');
            
            // Get ngrok URL
            const ngrokUrl = await this.getNgrokUrl();
            
            // Update .env file
            const success = this.updateEnvFile(ngrokUrl);
            
            if (success) {
                this.log('✅ Hoàn thành!');
            } else {
                throw new Error('Không thể cập nhật .env');
            }
            
        } catch (error) {
            this.log(`❌ Lỗi: ${error.message}`);
            this.log('');
            this.log('🔧 CÁCH KHẮC PHỤC:');
            this.log('1. Đảm bảo ngrok đang chạy: D:\\Official_Project\\Project_UniPlan\\dowload\\ngrok-v3-stable-windows-amd64\\ngrok.exe http 5000');
            this.log('2. Kiểm tra ngrok web interface: http://127.0.0.1:4040');
            this.log('3. Chạy lại script này: node update-env-with-ngrok.js');
            process.exit(1);
        }
    }
}

// Run the updater
if (require.main === module) {
    const updater = new SimpleEnvUpdater();
    updater.run();
}

module.exports = SimpleEnvUpdater;
