#!/usr/bin/env node

// One-command script - All-in-one subscription management
const { spawn } = require('child_process');
const path = require('path');

const BACKEND_DIR = __dirname;

const runCommand = (scriptName, args = []) => {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [path.join(BACKEND_DIR, scriptName), ...args], {
            stdio: 'inherit',
            cwd: BACKEND_DIR
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Script ${scriptName} exited with code ${code}`));
            }
        });

        child.on('error', reject);
    });
};

const showHelp = () => {
    console.log(`
🚀 ONE-COMMAND SUBSCRIPTION MANAGEMENT

USAGE:
  node one-command.js <command> [args...]

COMMANDS:
  📊 overview                              - System overview
  🔍 user <email>                          - Find user by email
  ⬆️ upgrade <email> <plan> [--confirm]    - Upgrade subscription
  ⬇️ downgrade <email> <plan> [--confirm]  - Downgrade subscription  
  🔧 fix <email> [--confirm]              - Fix user plan info
  🧹 clear <email>                        - Clear pending payments
  💳 payments                             - Show all payments
  🧪 test                                 - Run full system test
  🏥 health                               - Quick health check

EXAMPLES:
  # System overview
  node one-command.js overview

  # Check user
  node one-command.js user admin1@gmail.com

  # Upgrade user
  node one-command.js upgrade admin1@gmail.com monthly --confirm

  # Downgrade user  
  node one-command.js downgrade admin1@gmail.com free --confirm

  # Fix user plan
  node one-command.js fix admin1@gmail.com --confirm

  # Clear pending payments
  node one-command.js clear admin1@gmail.com

  # Quick health check
  node one-command.js health

PLANS:
  - free: Free plan
  - monthly: Monthly premium (30 days)
  - yearly: Yearly premium (365 days)
    `);
};

const healthCheck = async () => {
    try {
        console.log('🏥 QUICK HEALTH CHECK');
        console.log('='.repeat(30));
        
        console.log('\n📊 System Overview (summary):');
        await runCommand('subscription-overview.js');
        
        console.log('\n🧪 System Test:');
        await runCommand('final-subscription-test.js');
        
        console.log('\n✅ Health check completed!');
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
    }
};

const main = async () => {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }

    const command = args[0];
    const params = args.slice(1);

    try {
        switch (command) {
            case 'overview':
                await runCommand('subscription-overview.js');
                break;

            case 'user':
                if (params.length < 1) {
                    console.error('❌ Error: Email required');
                    console.log('Usage: node one-command.js user <email>');
                    process.exit(1);
                }
                await runCommand('find-user-by-email.js', [params[0]]);
                break;

            case 'upgrade':
                if (params.length < 2) {
                    console.error('❌ Error: Email and plan required');
                    console.log('Usage: node one-command.js upgrade <email> <plan> [--confirm]');
                    process.exit(1);
                }
                await runCommand('upgrade-admin-subscription.js', params);
                break;

            case 'downgrade':
                if (params.length < 2) {
                    console.error('❌ Error: Email and plan required');
                    console.log('Usage: node one-command.js downgrade <email> <plan> [--confirm]');
                    process.exit(1);
                }
                await runCommand('downgrade-admin-subscription.js', params);
                break;

            case 'fix':
                if (params.length < 1) {
                    console.error('❌ Error: Email required');
                    console.log('Usage: node one-command.js fix <email> [--confirm]');
                    process.exit(1);
                }
                await runCommand('fix-user-plan-info.js', params);
                break;

            case 'clear':
                if (params.length < 1) {
                    console.error('❌ Error: Email required');
                    console.log('Usage: node one-command.js clear <email>');
                    process.exit(1);
                }
                await runCommand('clear-payments-by-email.js', [params[0]]);
                break;

            case 'payments':
                await runCommand('check-all-payments.js');
                break;

            case 'test':
                await runCommand('final-subscription-test.js');
                break;

            case 'health':
                await healthCheck();
                break;

            default:
                console.error(`❌ Unknown command: ${command}`);
                console.log('\nRun "node one-command.js --help" for usage information.');
                process.exit(1);
        }

        console.log('\n✅ Command completed successfully!');
    } catch (error) {
        console.error('❌ Command failed:', error.message);
        process.exit(1);
    }
};

main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
});
