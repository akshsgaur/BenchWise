const path = require('path');
const { spawn } = require('child_process');

class InsightGenerationService {
  constructor() {
    this.isRunning = false;
  }

  async runForAllUsers() {
    if (this.isRunning) {
      console.log('Insight generation already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting AI insight generation via Python agent...');

    try {
      await this.executePythonAgent();
      console.log('AI insight generation completed.');
    } catch (error) {
      console.error('Insight generation error:', error.message || error);
    } finally {
      this.isRunning = false;
    }
  }

  async runForUser(userId) {
    if (this.isRunning) {
      console.log('Insight generation already running, skipping single-user run...');
      return;
    }

    this.isRunning = true;
    console.log(`Starting AI insight generation for user ${userId} via Python agent...`);

    try {
      await this.executePythonAgent({ userId });
      console.log(`AI insight generation completed for user ${userId}.`);
    } catch (error) {
      console.error(`Insight generation error for user ${userId}:`, error.message || error);
    } finally {
      this.isRunning = false;
    }
  }

  executePythonAgent(options = {}) {
    const pythonBinary = process.env.PYTHON_PATH || process.env.PYTHON_EXECUTABLE || 'python3';
    const scriptPath = path.join(__dirname, '../../services/run_insight_agent.py');
    const workingDirectory = path.join(__dirname, '../../services');

    const args = [scriptPath];
    const periodDays = options.periodDays || process.env.INSIGHT_PERIOD_DAYS;

    if (options.userId) {
      args.push('--user-id', String(options.userId));
    }

    if (periodDays) {
      args.push('--period', String(periodDays));
    }

    if (process.env.MONGODB_URI) {
      args.push('--mongo-uri', process.env.MONGODB_URI);
    }

    if (process.env.MONGODB_DB_NAME) {
      args.push('--db-name', process.env.MONGODB_DB_NAME);
    }

    return new Promise((resolve, reject) => {
      const child = spawn(pythonBinary, args, {
        cwd: workingDirectory,
        env: { ...process.env },
      });

      let stdoutBuffer = '';
      let stderrBuffer = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdoutBuffer += text;
        process.stdout.write(`[insight-agent] ${text}`);
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderrBuffer += text;
        process.stderr.write(`[insight-agent:error] ${text}`);
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout: stdoutBuffer, stderr: stderrBuffer });
        } else {
          const error = new Error(`Python insight agent exited with code ${code}`);
          error.stdout = stdoutBuffer;
          error.stderr = stderrBuffer;
          reject(error);
        }
      });
    });
  }
}

module.exports = new InsightGenerationService();
