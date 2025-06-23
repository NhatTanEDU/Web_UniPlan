const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');

class NgrokEnvUpdater {
    constructor() {
        this.envPath = path.join(__dirname, '.env');
        this.ngrokPath = 'D:\\Official_Project\\Project_UniPlan\\dowload\\ngrok-v3-stable-windows-amd64\\ngrok.exe';
        this.port = 5000;
        this.ngrokProcess = null;
        this.backendProcess = null;
    }

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async killExistingProcesses() {
        this.log('🔄 Đang dừng các process cũ...');
        
        // Kill ngrok processes
        return new Promise((resolve) => {
            exec('taskkill /F /IM ngrok.exe', (error) => {
                if (error && !error.message.includes('not found')) {
                    this.log(`⚠️ Lỗi khi dừng ngrok: ${error.message}`);
                } else {
                    this.log('✅ Đã dừng ngrok cũ');
                }
                
                // Kill node processes on port 5000
                exec('netstat -ano | findstr :5000', (error, stdout) => {
                    if (stdout) {
                        const lines = stdout.split('\n');
                        lines.forEach(line => {
                            const parts = line.trim().split(/\s+/);
                            if (parts.length > 4) {
                                const pid = parts[parts.length - 1];
                                if (pid && pid !== '0') {
                                    exec(`taskkill /F /PID ${pid}`, () => {});
                                }
                            }
                        });
                    }
                    resolve();
                });
            });
        });
    }

    startNgrok() {
        return new Promise((resolve, reject) => {
            this.log('🚀 Đang khởi động ngrok...');
            
            // Start ngrok process
            this.ngrokProcess = spawn(this.ngrokPath, ['http', this.port.toString()], {
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: false
            });

            let ngrokStarted = false;

            this.ngrokProcess.stdout.on('data', (data) => {
                const output = data.toString();
                this.log(`[NGROK] ${output}`);
                
                if (output.includes('started tunnel') || output.includes('Session Status')) {
                    ngrokStarted = true;
                }
            });

            this.ngrokProcess.stderr.on('data', (data) => {
                const error = data.toString();
                this.log(`[NGROK ERROR] ${error}`);
                
                if (error.includes('bind: address already in use')) {
                    this.log('❌ Port 5000 đang được sử dụng');
                    reject(new Error('Port 5000 is in use'));
                }
            });

            this.ngrokProcess.on('error', (error) => {
                this.log(`❌ Lỗi khởi động ngrok: ${error.message}`);
                reject(error);
            });

            // Wait for ngrok to start
            setTimeout(() => {
                if (ngrokStarted || this.ngrokProcess.pid) {
                    this.log('✅ Ngrok đã khởi động');
                    resolve();
                } else {
                    reject(new Error('Ngrok failed to start'));
                }
            }, 5000);
        });
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
                            tunnel.proto === 'https' && tunnel.config.addr.includes(this.port.toString())
                        );
                        
                        if (httpsTunnel) {
                            const url = httpsTunnel.public_url;
                            this.log(`✅ Tìm thấy ngrok URL: ${url}`);
                            resolve(url);
                        } else {
                            reject(new Error('Không tìm thấy HTTPS tunnel'));
                        }
                    } catch (error) {
                        reject(new Error(`Lỗi parse JSON: ${error.message}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(new Error(`Lỗi kết nối ngrok API: ${error.message}`));
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
            
            // Update MOMO_REDIRECT_URL
            const redirectUrlPattern = /MOMO_REDIRECT_URL\s*=\s*.*/;
            const newRedirectUrl = `MOMO_REDIRECT_URL=${ngrokUrl}/api/payment/momo/return`;
            
            if (redirectUrlPattern.test(envContent)) {
                envContent = envContent.replace(redirectUrlPattern, newRedirectUrl);
            } else {
                envContent += `\n${newRedirectUrl}`;
            }
            
            // Update MOMO_IPN_URL
            const ipnUrlPattern = /MOMO_IPN_URL\s*=\s*.*/;
            const newIpnUrl = `MOMO_IPN_URL=${ngrokUrl}/api/payment/momo/ipn`;
            
            if (ipnUrlPattern.test(envContent)) {
                envContent = envContent.replace(ipnUrlPattern, newIpnUrl);
            } else {
                envContent += `\n${newIpnUrl}`;
            }
            
            // Write updated content
            fs.writeFileSync(this.envPath, envContent);
            
            this.log('✅ Đã cập nhật file .env thành công!');
            this.log(`🔗 Redirect URL: ${ngrokUrl}/api/payment/momo/return`);
            this.log(`🔗 IPN URL: ${ngrokUrl}/api/payment/momo/ipn`);
            
            return true;
        } catch (error) {
            this.log(`❌ Lỗi cập nhật .env: ${error.message}`);
            return false;
        }
    }

    startBackend() {
        return new Promise((resolve) => {
            this.log('🚀 Đang khởi động backend server...');
            
            this.backendProcess = spawn('node', ['server.js'], {
                stdio: ['ignore', 'pipe', 'pipe'],
                env: { ...process.env, NODE_ENV: 'development' }
            });

            let serverStarted = false;

            this.backendProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`[BACKEND] ${output}`);
                
                if (output.includes('Server running on port') || output.includes('listening on port')) {
                    serverStarted = true;
                    this.log('✅ Backend server đã khởi động thành công!');
                    resolve();
                }
            });

            this.backendProcess.stderr.on('data', (data) => {
                const error = data.toString();
                console.log(`[BACKEND ERROR] ${error}`);
            });

            this.backendProcess.on('error', (error) => {
                this.log(`❌ Lỗi khởi động backend: ${error.message}`);
            });

            // Timeout fallback
            setTimeout(() => {
                if (!serverStarted) {
                    this.log('⚠️ Backend có thể đã khởi động (timeout)');
                    resolve();
                }
            }, 10000);
        });
    }

    async runTestPayment() {
        this.log('🧪 Đang chạy test thanh toán MoMo...');
        
        return new Promise((resolve) => {
            const testProcess = spawn('node', ['test-momo-integration.js'], {
                stdio: ['ignore', 'pipe', 'pipe']
            });

            testProcess.stdout.on('data', (data) => {
                console.log(data.toString());
            });

            testProcess.stderr.on('data', (data) => {
                console.log(data.toString());
            });

            testProcess.on('close', (code) => {
                if (code === 0) {
                    this.log('✅ Test thanh toán hoàn thành!');
                } else {
                    this.log('⚠️ Test thanh toán có lỗi');
                }
                resolve();
            });
        });
    }

    setupCleanup() {
        const cleanup = () => {
            this.log('🛑 Đang dọn dẹp processes...');
            
            if (this.ngrokProcess) {
                this.ngrokProcess.kill();
            }
            if (this.backendProcess) {
                this.backendProcess.kill();
            }
            
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);
    }

    async run() {
        try {
            this.log('🚀 Bắt đầu quy trình setup ngrok và MoMo...');
            
            this.setupCleanup();
            
            // Step 1: Kill existing processes
            await this.killExistingProcesses();
            await this.sleep(2000);
            
            // Step 2: Start ngrok
            await this.startNgrok();
            await this.sleep(3000);
            
            // Step 3: Get ngrok URL
            const ngrokUrl = await this.getNgrokUrl();
            
            // Step 4: Update .env file
            const envUpdated = this.updateEnvFile(ngrokUrl);
            if (!envUpdated) {
                throw new Error('Không thể cập nhật file .env');
            }
            
            // Step 5: Start backend
            await this.startBackend();
            await this.sleep(3000);
            
            // Step 6: Run test
            await this.runTestPayment();
            
            this.log('🎉 Setup hoàn thành! Ngrok đang chạy và .env đã được cập nhật.');
            this.log('📱 Bạn có thể test thanh toán MoMo bây giờ!');
            this.log('🛑 Nhấn Ctrl+C để dừng tất cả services.');
            
            // Keep process alive
            process.stdin.resume();
            
        } catch (error) {
            this.log(`❌ Lỗi: ${error.message}`);
            process.exit(1);
        }
    }
}

// Run the updater
if (require.main === module) {
    const updater = new NgrokEnvUpdater();
    updater.run();
}

module.exports = NgrokEnvUpdater;
