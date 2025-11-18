const InsightAgentService = require('./insightAgentService');

/**
 * Service for generating AI insights using the TypeScript InsightAgentService.
 * Migrated from Python process spawning to direct TypeScript service calls.
 */
class InsightGenerationService {
  constructor() {
    this.agentService = new InsightAgentService(
      process.env.MONGODB_URI,
      process.env.MONGODB_DB_NAME || 'benchwise'
    );
    console.log('[INFO] InsightGenerationService initialized with TypeScript agent');
  }

  /**
   * Start periodic insight generation for all users
   */
  startCronJob() {
    // This can be called from index.js to start periodic generation
    // For now, we'll keep it simple - actual cron implementation can be added later
    console.log('[INFO] Insight generation service ready (cron job can be configured separately)');
  }

  /**
   * Generate insights for all users
   */
  async generateForAllUsers(periodDays = 60) {
    try {
      console.log('Starting AI insight generation via TypeScript agent...');
      await this.agentService.generateForAllUsers(periodDays);
      console.log('✅ Insight generation completed for all users');
    } catch (error) {
      console.error('❌ Error generating insights for all users:', error);
      throw error;
    }
  }

  /**
   * Generate insights for a specific user
   */
  async generateForUser(userId, periodDays = 60) {
    try {
      console.log(`Starting AI insight generation for user ${userId} via TypeScript agent...`);
      const result = await this.agentService.generateForUser(userId, periodDays);
      console.log(`✅ Insight generation completed for user ${userId}: ${result.status}`);
      return result;
    } catch (error) {
      console.error(`❌ Error generating insights for user ${userId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new InsightGenerationService();
