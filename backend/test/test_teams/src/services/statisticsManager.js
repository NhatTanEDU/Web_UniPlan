// Statistics Manager Service
// Quản lý thống kê và lưu file .txt (giới hạn 3 files)

const fs = require('fs').promises;
const path = require('path');
const { MESSAGES, FILE_PATHS, MAX_TXT_FILES } = require('../config/constants');

class StatisticsManager {
    constructor() {
        this.resultsDirectory = this.getResultsDirectory();
        this.currentStats = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            testResults: [],
            menuResults: {},
            executionTime: 0,
            timestamp: new Date().toISOString()
        };
    }

    // Lấy đường dẫn thư mục kết quả
    getResultsDirectory() {
        const baseDir = path.join(__dirname, '../../');
        return path.join(baseDir, 'ketquathongke');
    }

    // Khởi tạo thư mục kết quả nếu chưa tồn tại
    async initializeDirectory() {
        try {
            await fs.access(this.resultsDirectory);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('📁 Tạo thư mục kết quả...');
                await fs.mkdir(this.resultsDirectory, { recursive: true });
                console.log(`✅ Đã tạo thư mục: ${this.resultsDirectory}`);
            } else {
                throw error;
            }
        }
    }

    // Thêm kết quả test từ một menu
    addMenuResult(menuName, results) {
        try {
            const menuStats = this.processMenuResults(menuName, results);
            this.currentStats.menuResults[menuName] = menuStats;
            
            // Cập nhật tổng thống kê
            this.currentStats.totalTests += menuStats.totalOperations;
            this.currentStats.passedTests += menuStats.successfulOperations;
            this.currentStats.failedTests += menuStats.failedOperations;
            
            // Thêm vào danh sách kết quả chi tiết
            this.currentStats.testResults.push({
                menu: menuName,
                ...menuStats,
                timestamp: new Date().toISOString()
            });

            console.log(`📊 Đã thêm kết quả menu "${menuName}": ${menuStats.successfulOperations}/${menuStats.totalOperations} thành công`);
            
        } catch (error) {
            console.log(`❌ Lỗi thêm kết quả menu ${menuName}: ${error.message}`);
        }
    }

    // Xử lý kết quả từ một menu
    processMenuResults(menuName, results) {
        const stats = {
            menuName: menuName,
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            operations: [],
            executionTime: 0,
            details: results
        };

        try {
            if (results && results.results && Array.isArray(results.results)) {
                stats.totalOperations = results.results.length;
                
                results.results.forEach(result => {
                    if (result.success) {
                        stats.successfulOperations++;
                    } else {
                        stats.failedOperations++;
                    }
                    
                    stats.operations.push({
                        operation: result.operation || result.action || 'Unknown',
                        success: result.success,
                        message: result.message || 'No message',
                        timestamp: result.timestamp || new Date().toISOString()
                    });
                });
            } else if (results && typeof results === 'object') {
                // Xử lý trường hợp kết quả không phải mảng
                stats.totalOperations = 1;
                if (results.success !== false) {
                    stats.successfulOperations = 1;
                } else {
                    stats.failedOperations = 1;
                }
                
                stats.operations.push({
                    operation: menuName,
                    success: results.success !== false,
                    message: results.message || results.error || 'Test completed',
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.log(`⚠️ Lỗi xử lý kết quả menu ${menuName}: ${error.message}`);
        }

        return stats;
    }

    // Lưu thống kê vào file .txt
    async saveStatistics() {
        try {
            await this.initializeDirectory();
            
            // Tạo tên file với timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `test_results_${timestamp}.txt`;
            const filepath = path.join(this.resultsDirectory, filename);
            
            // Tạo nội dung file
            const content = this.generateStatisticsContent();
            
            // Lưu file
            await fs.writeFile(filepath, content, 'utf8');
            console.log(`💾 Đã lưu thống kê: ${filename}`);
            
            // Dọn dẹp file cũ
            await this.cleanupOldFiles();
            
            return {
                success: true,
                filename: filename,
                filepath: filepath,
                content: content
            };
            
        } catch (error) {
            console.log(`❌ ${MESSAGES.STATS_ERROR} ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Tạo nội dung thống kê
    generateStatisticsContent() {
        const stats = this.currentStats;
        const timestamp = new Date().toLocaleString('vi-VN');
        
        let content = '';
        content += '='.repeat(80) + '\n';
        content += '📊 BÁO CÁO THỐNG KÊ HỆ THỐNG TEST TEAMS - UNIPLAN\n';
        content += '='.repeat(80) + '\n';
        content += `📅 Thời gian chạy: ${timestamp}\n`;
        content += `⏱️ Thời gian thực thi: ${this.formatExecutionTime(stats.executionTime)}\n`;
        content += `🆔 Test ID: ${this.generateTestId()}\n\n`;
        
        // Tổng quan
        content += '📈 TỔNG QUAN KẾT QUẢ:\n';
        content += '-'.repeat(50) + '\n';
        content += `• Tổng số test: ${stats.totalTests}\n`;
        content += `• Test thành công: ${stats.passedTests} ✅\n`;
        content += `• Test thất bại: ${stats.failedTests} ❌\n`;
        content += `• Tỷ lệ thành công: ${stats.totalTests > 0 ? Math.round((stats.passedTests/stats.totalTests) * 100) : 0}%\n`;
        content += `• Số menu đã test: ${Object.keys(stats.menuResults).length}\n\n`;
        
        // Kết quả theo menu
        content += '📋 KẾT QUẢ THEO MENU:\n';
        content += '-'.repeat(50) + '\n';
        
        Object.entries(stats.menuResults).forEach(([menuName, menuStats], index) => {
            const successRate = menuStats.totalOperations > 0 ? 
                Math.round((menuStats.successfulOperations/menuStats.totalOperations) * 100) : 0;
                
            content += `${index + 1}. ${menuName}\n`;
            content += `   • Tổng thao tác: ${menuStats.totalOperations}\n`;
            content += `   • Thành công: ${menuStats.successfulOperations} ✅\n`;
            content += `   • Thất bại: ${menuStats.failedOperations} ❌\n`;
            content += `   • Tỷ lệ: ${successRate}%\n`;
            
            if (menuStats.operations && menuStats.operations.length > 0) {
                content += `   • Chi tiết:\n`;
                menuStats.operations.forEach((op, opIndex) => {
                    const status = op.success ? '✅' : '❌';
                    content += `     ${opIndex + 1}. ${status} ${op.operation}: ${op.message}\n`;
                });
            }
            content += '\n';
        });
        
        // Lỗi và cảnh báo
        const errors = this.collectErrors();
        if (errors.length > 0) {
            content += '⚠️ LỖI VÀ CẢNH BÁO:\n';
            content += '-'.repeat(50) + '\n';
            errors.forEach((error, index) => {
                content += `${index + 1}. ${error.menu} - ${error.operation}\n`;
                content += `   💬 ${error.message}\n`;
                content += `   📅 ${error.timestamp}\n\n`;
            });
        }
        
        // Khuyến nghị
        content += '💡 KHUYẾN NGHỊ:\n';
        content += '-'.repeat(50) + '\n';
        content += this.generateRecommendations();
        
        content += '\n' + '='.repeat(80) + '\n';
        content += '🎯 KẾT THÚC BÁO CÁO\n';
        content += '='.repeat(80);
        
        return content;
    }

    // Thu thập lỗi từ các menu
    collectErrors() {
        const errors = [];
        
        Object.entries(this.currentStats.menuResults).forEach(([menuName, menuStats]) => {
            if (menuStats.operations) {
                menuStats.operations.forEach(op => {
                    if (!op.success) {
                        errors.push({
                            menu: menuName,
                            operation: op.operation,
                            message: op.message,
                            timestamp: op.timestamp
                        });
                    }
                });
            }
        });
        
        return errors;
    }

    // Tạo khuyến nghị
    generateRecommendations() {
        const stats = this.currentStats;
        const successRate = stats.totalTests > 0 ? (stats.passedTests/stats.totalTests) * 100 : 0;
        let recommendations = '';
        
        if (successRate >= 90) {
            recommendations += '🎉 Hệ thống hoạt động rất tốt! Tỷ lệ thành công cao.\n';
        } else if (successRate >= 70) {
            recommendations += '👍 Hệ thống hoạt động ổn định. Cần xem xét một số lỗi nhỏ.\n';
        } else if (successRate >= 50) {
            recommendations += '⚠️ Hệ thống có một số vấn đề. Cần kiểm tra và sửa lỗi.\n';
        } else {
            recommendations += '🚨 Hệ thống có nhiều lỗi nghiêm trọng. Cần xem xét lại toàn bộ.\n';
        }
        
        // Phân tích lỗi theo menu
        const errorMenus = [];
        Object.entries(stats.menuResults).forEach(([menuName, menuStats]) => {
            const menuSuccessRate = menuStats.totalOperations > 0 ? 
                (menuStats.successfulOperations/menuStats.totalOperations) * 100 : 0;
            
            if (menuSuccessRate < 70) {
                errorMenus.push(menuName);
            }
        });
        
        if (errorMenus.length > 0) {
            recommendations += `\n📋 Menu cần xem xét: ${errorMenus.join(', ')}\n`;
        }
        
        recommendations += '\n📌 Lưu ý:\n';
        recommendations += '• Kiểm tra log chi tiết để tìm nguyên nhân lỗi\n';
        recommendations += '• Đảm bảo API server đang hoạt động\n';
        recommendations += '• Kiểm tra kết nối mạng\n';
        recommendations += '• Xem xét việc tối ưu thời gian chờ\n';
        
        return recommendations;
    }

    // Dọn dẹp file cũ (chỉ giữ lại MAX_TXT_FILES files)
    async cleanupOldFiles() {
        try {
            const files = await fs.readdir(this.resultsDirectory);
            const txtFiles = files.filter(file => file.endsWith('.txt') && file.startsWith('test_results_'));
            
            if (txtFiles.length > MAX_TXT_FILES) {
                // Sắp xếp theo thời gian (file cũ nhất trước)
                const sortedFiles = txtFiles.sort();
                const filesToDelete = sortedFiles.slice(0, sortedFiles.length - MAX_TXT_FILES);
                
                for (const file of filesToDelete) {
                    const filePath = path.join(this.resultsDirectory, file);
                    await fs.unlink(filePath);
                    console.log(`🗑️ Đã xóa file cũ: ${file}`);
                }
                
                console.log(`${MESSAGES.FILE_CLEANUP} Giữ lại ${MAX_TXT_FILES} files mới nhất.`);
            }
            
        } catch (error) {
            console.log(`⚠️ Lỗi dọn dẹp file: ${error.message}`);
        }
    }

    // Lấy danh sách file thống kê
    async getStatisticsFiles() {
        try {
            await this.initializeDirectory();
            const files = await fs.readdir(this.resultsDirectory);
            const txtFiles = files.filter(file => file.endsWith('.txt') && file.startsWith('test_results_'));
            
            const fileInfos = [];
            for (const file of txtFiles) {
                const filePath = path.join(this.resultsDirectory, file);
                const stats = await fs.stat(filePath);
                fileInfos.push({
                    name: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                });
            }
            
            // Sắp xếp theo thời gian tạo (mới nhất trước)
            fileInfos.sort((a, b) => b.created - a.created);
            
            return fileInfos;
            
        } catch (error) {
            console.log(`❌ Lỗi lấy danh sách file: ${error.message}`);
            return [];
        }
    }

    // Đọc nội dung file thống kê
    async readStatisticsFile(filename) {
        try {
            const filePath = path.join(this.resultsDirectory, filename);
            const content = await fs.readFile(filePath, 'utf8');
            return {
                success: true,
                content: content,
                filename: filename
            };
        } catch (error) {
            return {
                success: false,
                error: `Lỗi đọc file: ${error.message}`
            };
        }
    }

    // Utility functions
    formatExecutionTime(milliseconds) {
        if (milliseconds < 1000) {
            return `${milliseconds}ms`;
        } else if (milliseconds < 60000) {
            return `${(milliseconds / 1000).toFixed(1)}s`;
        } else {
            const minutes = Math.floor(milliseconds / 60000);
            const seconds = ((milliseconds % 60000) / 1000).toFixed(1);
            return `${minutes}m ${seconds}s`;
        }
    }

    generateTestId() {
        return `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    // Bắt đầu đo thời gian thực thi
    startTimer() {
        this.startTime = Date.now();
    }

    // Kết thúc đo thời gian thực thi
    endTimer() {
        if (this.startTime) {
            this.currentStats.executionTime = Date.now() - this.startTime;
        }
    }

    // Lấy thống kê hiện tại
    getCurrentStats() {
        return { ...this.currentStats };
    }

    // Reset thống kê
    reset() {
        this.currentStats = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            testResults: [],
            menuResults: {},
            executionTime: 0,
            timestamp: new Date().toISOString()
        };
        this.startTime = null;
    }

    // Hiển thị thống kê tóm tắt
    displaySummary() {
        const stats = this.currentStats;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 TỔNG KẾT THỐNG KÊ');
        console.log('='.repeat(60));
        console.log(`📊 Tổng test: ${stats.totalTests}`);
        console.log(`✅ Thành công: ${stats.passedTests}`);
        console.log(`❌ Thất bại: ${stats.failedTests}`);
        console.log(`📈 Tỷ lệ thành công: ${stats.totalTests > 0 ? Math.round((stats.passedTests/stats.totalTests) * 100) : 0}%`);
        console.log(`⏱️ Thời gian: ${this.formatExecutionTime(stats.executionTime)}`);
        console.log(`📂 Menu đã test: ${Object.keys(stats.menuResults).length}`);
        console.log('='.repeat(60));
    }
}

module.exports = new StatisticsManager();
