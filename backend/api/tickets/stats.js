/**
 * API Endpoint: GET /api/tickets/stats
 * 
 * This endpoint returns comprehensive ticket statistics for chart visualization.
 * It aggregates data from the tickets collection and provides various metrics
 * needed for the React chart components.
 */

const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticket');
const Hospital = require('../models/hospital');

/**
 * GET /api/tickets/stats
 * Returns ticket statistics for dashboard charts
 */
router.get('/', async (req, res) => {
  try {
    // Get basic ticket counts by status
    const statusStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get tickets created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get priority distribution
    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get category distribution
    const categoryStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get hospital type distribution
    const hospitalStats = await Hospital.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Helper function to convert aggregation results to key-value pairs
    const aggToObject = (agg, keyField = '_id', valueField = 'count') => {
      const result = {};
      agg.forEach(item => {
        result[item[keyField]] = item[valueField];
      });
      return result;
    };

    // Build byDate object for trend data
    const byDate = {};
    dailyStats.forEach(day => {
      byDate[day._id] = day.count;
    });

    // Calculate total counts
    const statusCounts = aggToObject(statusStats);
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    // Build response object
    const stats = {
      total,
      pending: statusCounts.pending || 0,
      inProgress: statusCounts['in-progress'] || 0,
      resolved: statusCounts.resolved || 0,
      assigned: statusCounts.assigned || 0,
      closed: statusCounts.closed || 0,
      byDate,
      byPriority: aggToObject(priorityStats),
      byCategory: aggToObject(categoryStats),
      hospitalStats: aggToObject(hospitalStats)
    };

    res.json({
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/tickets/stats/summary
 * Returns a summary of key metrics for quick overview
 */
router.get('/summary', async (req, res) => {
  try {
    const [
      totalTickets,
      pendingTickets,
      resolvedTickets,
      totalHospitals
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'pending' }),
      Ticket.countDocuments({ status: 'resolved' }),
      Hospital.countDocuments()
    ]);

    // Get tickets from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTickets = await Ticket.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const summary = {
      totalTickets,
      pendingTickets,
      resolvedTickets,
      totalHospitals,
      recentTickets,
      resolutionRate: totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0
    };

    res.json({
      success: true,
      data: summary,
      message: 'Summary statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching summary stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/tickets/stats/trends
 * Returns detailed trend data for specified time period
 */
router.get('/trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const trends = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          created: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      data: trends,
      message: 'Trend data retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trend data',
      message: error.message
    });
  }
});

/**
 * GET /api/tickets/stats/hospitals
 * Returns hospital-specific statistics
 */
router.get('/hospitals', async (req, res) => {
  try {
    const hospitalStats = await Ticket.aggregate([
      {
        $lookup: {
          from: 'hospitals',
          localField: 'hospitalId',
          foreignField: '_id',
          as: 'hospital'
        }
      },
      {
        $unwind: '$hospital'
      },
      {
        $group: {
          _id: '$hospital._id',
          hospitalName: { $first: '$hospital.name' },
          hospitalType: { $first: '$hospital.type' },
          totalTickets: { $sum: 1 },
          pendingTickets: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          resolvedTickets: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { totalTickets: -1 }
      }
    ]);

    res.json({
      success: true,
      data: hospitalStats,
      message: 'Hospital statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching hospital stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hospital statistics',
      message: error.message
    });
  }
});

module.exports = router;
