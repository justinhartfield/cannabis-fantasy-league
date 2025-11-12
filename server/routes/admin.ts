/**
 * Admin API Routes
 * 
 * Administrative endpoints for manual operations
 */

import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

/**
 * POST /api/admin/trigger-scoring
 * 
 * Manually trigger the automated weekly scoring process
 * Requires admin authentication
 */
router.post('/trigger-scoring', async (req, res) => {
  try {
    // Check if user is admin (you should implement proper auth check)
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized: Admin access required' 
      });
    }

    console.log('🚀 Manual scoring trigger initiated by:', user.username);

    // Run the automated scoring script in the background
    const scriptPath = './scripts/automated-weekly-scoring.ts';
    
    // Execute asynchronously without waiting
    exec(`npx tsx ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Scoring script error:', error);
        console.error('stderr:', stderr);
      } else {
        console.log('✅ Scoring script completed');
        console.log('stdout:', stdout);
      }
    });

    // Return immediately
    res.json({
      success: true,
      message: 'Automated scoring process started in background',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error triggering scoring:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger scoring process'
    });
  }
});

/**
 * GET /api/admin/scoring-status
 * 
 * Check the status of the scoring system
 */
router.get('/scoring-status', async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized: Admin access required' 
      });
    }

    // Get current year and week
    const now = new Date();
    const year = now.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    res.json({
      success: true,
      currentWeek: {
        year,
        week,
        formatted: `${year}-W${week}`
      },
      nextScheduledRun: 'Every Monday at 2:00 AM UTC',
      cronExpression: '0 2 * * 1'
    });

  } catch (error) {
    console.error('❌ Error checking scoring status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check scoring status'
    });
  }
});

export default router;
