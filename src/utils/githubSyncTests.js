/**
 * GitHub Sync Test Script
 * 
 * This script can be run from the browser console to test the GitHub sync functionality.
 * It performs comprehensive tests to ensure the sync system is working correctly.
 */

// Test functions that can be copied and pasted into browser console
const githubSyncTests = {
  
  /**
   * Test 1: Basic connectivity and service status
   */
  async testConnectivity() {
    console.log('🧪 Test 1: Testing basic connectivity...');
    
    try {
      // Test if debug functions are available
      if (typeof window.debugGitHubSync === 'undefined') {
        throw new Error('Debug functions not available. Make sure the app is in development mode.');
      }
      
      // Get service info
      const info = window.debugGitHubSync.info();
      console.log('✅ Service info:', info);
      
      // Get sync status
      const status = await window.debugGitHubSync.status();
      console.log('✅ Sync status:', status);
      
      return { success: true, info, status };
      
    } catch (error) {
      console.error('❌ Connectivity test failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 2: Manual sync trigger
   */
  async testManualSync() {
    console.log('🧪 Test 2: Testing manual sync...');
    
    try {
      const result = await window.debugGitHubSync.sync();
      console.log('✅ Manual sync result:', result);
      
      return { success: true, result };
      
    } catch (error) {
      console.error('❌ Manual sync test failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 3: Auto-sync start/stop
   */
  async testAutoSync() {
    console.log('🧪 Test 3: Testing auto-sync controls...');
    
    try {
      // Stop first (in case it's running)
      console.log('🛑 Stopping auto-sync...');
      const stopResult = await window.debugGitHubSync.stop();
      console.log('Stop result:', stopResult);
      
      // Start auto-sync
      console.log('🚀 Starting auto-sync...');
      const startResult = await window.debugGitHubSync.start();
      console.log('Start result:', startResult);
      
      // Check status
      const status = await window.debugGitHubSync.status();
      console.log('✅ Auto-sync status:', status.isAutoSyncEnabled);
      
      return { 
        success: true, 
        stopResult, 
        startResult, 
        isAutoSyncEnabled: status.isAutoSyncEnabled 
      };
      
    } catch (error) {
      console.error('❌ Auto-sync test failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 4: Comprehensive sync test
   */
  async testComprehensive() {
    console.log('🧪 Test 4: Running comprehensive sync test...');
    
    try {
      const result = await window.debugGitHubSync.test();
      console.log('✅ Comprehensive test result:', result);
      
      return { success: true, result };
      
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Run all tests sequentially
   */
  async runAllTests() {
    console.log('🚀 Running all GitHub sync tests...');
    // eslint-disable-next-line
    console.log('=' .repeat(50));
    
    const results = {};
    
    // Test 1: Connectivity
    results.connectivity = await this.testConnectivity();
    console.log('');
    
    // Test 2: Manual sync
    results.manualSync = await this.testManualSync();
    console.log('');
    
    // Test 3: Auto-sync
    results.autoSync = await this.testAutoSync();
    console.log('');
    
    // Test 4: Comprehensive
    results.comprehensive = await this.testComprehensive();
    console.log('');
    
    // Summary
    console.log('📊 Test Results Summary:');
    // eslint-disable-next-line
    console.log('=' .repeat(50));
    
    const testNames = Object.keys(results);
    const passedTests = testNames.filter(test => results[test].success);
    const failedTests = testNames.filter(test => !results[test].success);
    
    console.log(`✅ Passed: ${passedTests.length}/${testNames.length}`);
    if (passedTests.length > 0) {
      console.log(`   - ${passedTests.join(', ')}`);
    }
    
    if (failedTests.length > 0) {
      console.log(`❌ Failed: ${failedTests.length}/${testNames.length}`);
      console.log(`   - ${failedTests.join(', ')}`);
      
      failedTests.forEach(test => {
        console.log(`   ${test}: ${results[test].error}`);
      });
    }
    
    return results;
  },

  /**
   * Quick status check
   */
  async quickStatus() {
    try {
      const status = await window.debugGitHubSync.status();
      const info = window.debugGitHubSync.info();
      
      console.log('📊 Quick Status Check:');
      console.log('━'.repeat(30));
      console.log(`🔧 Service Initialized: ${info.isInitialized ? '✅' : '❌'}`);
      console.log(`⚡ Auto-sync Enabled: ${status.isAutoSyncEnabled ? '✅' : '❌'}`);
      console.log(`📈 Total GitHub Projects: ${status.totalGithubProjects}`);
      console.log(`🕐 Last Sync: ${status.lastSyncTime ? new Date(status.lastSyncTime).toLocaleString() : 'Never'}`);
      console.log(`✅ Last Sync Success: ${status.lastSyncSuccess ? '✅' : '❌'}`);
      console.log(`⏰ Next Sync: ${status.nextSyncTime ? new Date(status.nextSyncTime).toLocaleString() : 'Unknown'}`);
      
      if (status.syncErrors && status.syncErrors.length > 0) {
        console.log(`❌ Recent Errors: ${status.syncErrors.length}`);
        status.syncErrors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
      
      return { info, status };
      
    } catch (error) {
      console.error('❌ Status check failed:', error);
      return { error: error.message };
    }
  }
};

// Instructions for manual testing
const testInstructions = `
🧪 GitHub Sync Test Instructions
═══════════════════════════════════

Copy and paste these commands into your browser console:

1. Quick status check:
   await githubSyncTests.quickStatus();

2. Run all tests:
   await githubSyncTests.runAllTests();

3. Individual tests:
   await githubSyncTests.testConnectivity();
   await githubSyncTests.testManualSync();
   await githubSyncTests.testAutoSync();
   await githubSyncTests.testComprehensive();

4. Manual controls:
   await window.debugGitHubSync.status();  // Check status
   await window.debugGitHubSync.sync();    // Manual sync
   await window.debugGitHubSync.start();   // Start auto-sync
   await window.debugGitHubSync.stop();    // Stop auto-sync

Note: These functions are only available in development mode.
`;

// Make test functions available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.githubSyncTests = githubSyncTests;
  console.log(testInstructions);
  console.log('🛠️ GitHub sync test functions available at window.githubSyncTests');
}

// Export for use in other files
export default githubSyncTests;
export { testInstructions };
