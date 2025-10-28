const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');

function resolvePythonBinary() {
  const explicit = process.env.PYTHON_PATH || process.env.PYTHON_EXECUTABLE;
  if (explicit) {
    return explicit;
  }

  const venv = process.env.VIRTUAL_ENV;
  if (venv) {
    const candidate = path.join(
      venv,
      process.platform === 'win32' ? 'Scripts' : 'bin',
      process.platform === 'win32' ? 'python.exe' : 'python3'
    );
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const fallback = path.join(
      venv,
      process.platform === 'win32' ? 'Scripts' : 'bin',
      process.platform === 'win32' ? 'python.exe' : 'python'
    );
    if (fs.existsSync(fallback)) {
      return fallback;
    }
  }

  const candidates = process.platform === 'win32'
    ? ['python.exe', 'python3.exe', 'python', 'python3']
    : ['python3', 'python', 'python3.12', 'python3.11'];

  const fallbackPaths = process.platform === 'win32'
    ? []
    : [
        '/opt/homebrew/bin/python3',
        '/usr/local/bin/python3',
        '/usr/bin/python3',
        '/opt/homebrew/bin/python',
        '/usr/local/bin/python',
        '/usr/bin/python',
      ];

  const pathDirs = (process.env.PATH || '').split(path.delimiter);

  const resolveOnPath = (name) => {
    for (const dir of pathDirs) {
      if (!dir) continue;
      const candidatePath = path.join(dir, name);
      if (fs.existsSync(candidatePath)) {
        const stat = fs.statSync(candidatePath);
        if (stat.isFile() || stat.isSymbolicLink()) {
          return candidatePath;
        }
      }
    }
    return null;
  };

  for (const cmd of candidates) {
    const resolved = resolveOnPath(cmd);
    if (!resolved) {
      continue;
    }
    const check = spawnSync(resolved, ['--version'], {
      stdio: 'ignore',
      env: process.env,
    });
    if (check.status === 0) {
      return resolved;
    }
  }

  for (const absolute of fallbackPaths) {
    if (!fs.existsSync(absolute)) {
      continue;
    }
    const check = spawnSync(absolute, ['--version'], {
      stdio: 'ignore',
      env: process.env,
    });
    if (check.status === 0) {
      return absolute;
    }
  }

  throw new Error(
    'Unable to locate a Python interpreter. Set PYTHON_PATH or install python3.'
  );
}

class InsightGenerationService {
  constructor() {
    this.isRunning = false;
    this.pythonBinary = null;
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
    if (!this.pythonBinary) {
      try {
        this.pythonBinary = resolvePythonBinary();
        console.log(`Using Python interpreter: ${this.pythonBinary}`);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    const scriptPath = path.join(__dirname, '../../../services/run_insight_agent.py');
    const workingDirectory = path.join(__dirname, '../../../services');

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
      const child = spawn(this.pythonBinary, args, {
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
