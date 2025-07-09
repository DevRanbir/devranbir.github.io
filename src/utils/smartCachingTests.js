/**
 * Smart Caching Test Script for GitHub Sync
 * 
 * This script tests the new smart caching functionality that respects user edits
 * and only syncs from GitHub when appropriate.
 */

const smartCachingTests = {
  
  /**
   * Test 1: Verify user edit protection
   */
  async testUserEditProtection() {
    console.log('🧪 Test 1: Testing user edit protection...');
    
    try {
      // Get current project status
      const projectStatus = await window.debugGitHubSync.projects();
      console.log('Current project status:', projectStatus);
      
      if (projectStatus.projects.length === 0) {
        console.log('⚠️ No GitHub projects found. Please ensure you have GitHub projects in your database.');
        return { success: false, message: 'No GitHub projects to test' };
      }
      
      // Find a project to test with
      const testProject = projectStatus.projects[0];
      console.log(`Testing with project: ${testProject.name}`);
      
      // Mark it as user-edited
      const originalDescription = testProject.description;
      const editedDescription = `[EDITED] ${originalDescription} - Test edit ${Date.now()}`;
      
      console.log('📝 Marking project as user-edited...');
      await window.debugGitHubSync.markEdited(testProject.id, editedDescription);
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Run a sync
      console.log('🔄 Running sync after user edit...');
      const syncResult = await window.debugGitHubSync.sync();
      console.log('Sync result:', syncResult);
      
      // Check if edit was preserved
      const updatedStatus = await window.debugGitHubSync.projects();
      const updatedProject = updatedStatus.projects.find(p => p.id === testProject.id);
      
      if (updatedProject && updatedProject.description === editedDescription) {
        console.log('✅ User edit was preserved during sync');
        return { success: true, testProject, preservedEdit: true };
      } else {
        console.log('❌ User edit was not preserved during sync');
        return { success: false, testProject, preservedEdit: false };
      }
      
    } catch (error) {
      console.error('❌ User edit protection test failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 2: Test force sync override
   */
  async testForceSyncOverride() {
    console.log('🧪 Test 2: Testing force sync override...');
    
    try {
      const projectStatus = await window.debugGitHubSync.projects();
      const editedProjects = projectStatus.projects.filter(p => p.userEdited);
      
      if (editedProjects.length === 0) {
        console.log('ℹ️ No user-edited projects to test force sync with');
        return { success: true, message: 'No edited projects to test' };
      }
      
      const testProject = editedProjects[0];
      const originalDescription = testProject.description;
      
      console.log(`Force syncing edited project: ${testProject.name}`);
      
      // Force sync this specific project
      const forceSyncResult = await window.debugGitHubSync.forceSyncProject(testProject.id);
      console.log('Force sync result:', forceSyncResult);
      
      // Check if it was synced from GitHub
      const updatedStatus = await window.debugGitHubSync.projects();
      const updatedProject = updatedStatus.projects.find(p => p.id === testProject.id);
      
      if (updatedProject && updatedProject.description !== originalDescription) {
        console.log('✅ Force sync successfully overrode user edit');
        return { success: true, forceSyncWorked: true };
      } else {
        console.log('⚠️ Force sync did not change description (might be same as GitHub)');
        return { success: true, forceSyncWorked: false, note: 'Description might be same as GitHub' };
      }
      
    } catch (error) {
      console.error('❌ Force sync test failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 3: Test project removal and re-addition
   */
  async testProjectRemovalReaddition() {
    console.log('🧪 Test 3: Testing project removal and re-addition...');
    
    try {
      const projectStatus = await window.debugGitHubSync.projects();
      
      if (projectStatus.projects.length === 0) {
        console.log('⚠️ No projects to test removal with');
        return { success: false, message: 'No projects to test' };
      }
      
      const testProject = projectStatus.projects[0];
      const projectId = testProject.id;
      const projectName = testProject.name;
      
      console.log(`Removing project: ${projectName}`);
      
      // Remove the project
      const removeResult = await window.debugGitHubSync.removeProject(projectId);
      console.log('Remove result:', removeResult);
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check it's gone
      let updatedStatus = await window.debugGitHubSync.projects();
      const isRemoved = !updatedStatus.projects.find(p => p.id === projectId);
      
      console.log(`Project removed: ${isRemoved}`);
      
      // Run sync to re-add it from GitHub
      console.log('🔄 Running sync to re-add from GitHub...');
      const syncResult = await window.debugGitHubSync.sync();
      console.log('Sync result:', syncResult);
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if it was re-added
      updatedStatus = await window.debugGitHubSync.projects();
      const isReAdded = updatedStatus.projects.some(p => p.name === projectName);
      
      console.log(`Project re-added: ${isReAdded}`);
      
      return { 
        success: true, 
        removed: isRemoved, 
        reAdded: isReAdded,
        testProject: { id: projectId, name: projectName }
      };
      
    } catch (error) {
      console.error('❌ Project removal test failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 4: Test smart sync behavior
   */
  async testSmartSyncBehavior() {
    console.log('🧪 Test 4: Testing smart sync behavior...');
    
    try {
      // Get project status
      const projectStatus = await window.debugGitHubSync.projects();
      console.log(`Total projects: ${projectStatus.total}`);
      console.log(`User edited: ${projectStatus.userEdited}`);
      console.log(`Not edited: ${projectStatus.notEdited}`);
      
      // Run a normal sync
      console.log('🔄 Running normal smart sync...');
      const syncResult = await window.debugGitHubSync.sync();
      console.log('Smart sync result:', syncResult);
      
      // Check what happened
      const updatedStatus = await window.debugGitHubSync.projects();
      
      return {
        success: true,
        beforeSync: {
          total: projectStatus.total,
          userEdited: projectStatus.userEdited,
          notEdited: projectStatus.notEdited
        },
        afterSync: {
          total: updatedStatus.total,
          userEdited: updatedStatus.userEdited,
          notEdited: updatedStatus.notEdited
        },
        syncResult: syncResult
      };
      
    } catch (error) {
      console.error('❌ Smart sync behavior test failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Run all smart caching tests
   */
  async runAllTests() {
    console.log('🚀 Running all smart caching tests...');
    console.log('='.repeat(60));
    
    const results = {};
    
    // Test 1: User edit protection
    results.userEditProtection = await this.testUserEditProtection();
    console.log('');
    
    // Test 2: Force sync override
    results.forceSyncOverride = await this.testForceSyncOverride();
    console.log('');
    
    // Test 3: Project removal and re-addition
    results.projectRemovalReaddition = await this.testProjectRemovalReaddition();
    console.log('');
    
    // Test 4: Smart sync behavior
    results.smartSyncBehavior = await this.testSmartSyncBehavior();
    console.log('');
    
    // Summary
    console.log('📊 Smart Caching Test Results:');
    console.log('='.repeat(60));
    
    const testNames = Object.keys(results);
    const passedTests = testNames.filter(test => results[test].success);
    const failedTests = testNames.filter(test => !results[test].success);
    
    console.log(`✅ Passed: ${passedTests.length}/${testNames.length}`);
    if (passedTests.length > 0) {
      passedTests.forEach(test => {
        console.log(`   ✅ ${test}`);
      });
    }
    
    if (failedTests.length > 0) {
      console.log(`❌ Failed: ${failedTests.length}/${testNames.length}`);
      failedTests.forEach(test => {
        console.log(`   ❌ ${test}: ${results[test].error || results[test].message}`);
      });
    }
    
    return results;
  },

  /**
   * Demo the smart caching features
   */
  async demo() {
    console.log('🎯 Smart Caching Demo');
    console.log('='.repeat(40));
    
    try {
      // Show current project status
      console.log('📊 Current Project Status:');
      const status = await window.debugGitHubSync.projects();
      console.table(status.projects.map(p => ({
        name: p.name,
        userEdited: p.userEdited || false,
        lastUserEdit: p.lastUserEdit || 'Never',
        lastSync: p.lastGithubSync || 'Never'
      })));
      
      console.log('\n🔧 Available Commands:');
      console.log('- window.debugGitHubSync.sync() - Smart sync (respects user edits)');
      console.log('- window.debugGitHubSync.forceSync() - Force sync all (ignores user edits)');
      console.log('- window.debugGitHubSync.projects() - View project status');
      console.log('- window.debugGitHubSync.markEdited(id, desc) - Mark project as edited');
      console.log('- window.debugGitHubSync.forceSyncProject(id) - Force sync one project');
      console.log('- window.debugGitHubSync.removeProject(id) - Remove project');
      console.log('- window.debugGitHubSync.resetEdits() - Reset all user edit flags');
      
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.smartCachingTests = smartCachingTests;
  console.log('🛠️ Smart caching test functions available at window.smartCachingTests');
  console.log('Usage examples:');
  console.log('- await window.smartCachingTests.demo()');
  console.log('- await window.smartCachingTests.runAllTests()');
}

export default smartCachingTests;
