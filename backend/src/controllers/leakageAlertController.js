const LeakageAlert = require('../models/LeakageAlert');
const LeakageTrend = require('../models/LeakageTrend');
const StockIssue = require('../models/StockIssue');
const HotelConsumption = require('../models/HotelConsumption');
const Item = require('../models/Item');
const Hotel = require('../models/Hotel');
const User = require('../models/User');

// Generate leakage alerts based on current data
const generateLeakageAlerts = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    // Calculate date range
    const now = new Date();
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case 'daily':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          start = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
          end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
      }
    }

    // Get all hotels and items
    const hotels = await Hotel.find();
    const items = await Item.find();

    const alerts = [];

    for (const hotel of hotels) {
      for (const item of items) {
        // Calculate leakage for this hotel-item combination
        const issuedResult = await StockIssue.aggregate([
          {
            $match: {
              hotelId: hotel._id,
              dateIssued: { $gte: start, $lt: end }
            }
          },
          { $unwind: '$items' },
          {
            $match: { 'items.itemId': item._id }
          },
          {
            $group: {
              _id: null,
              totalIssued: { $sum: '$items.quantityIssued' }
            }
          }
        ]);

        const consumedResult = await HotelConsumption.aggregate([
          {
            $match: {
              hotelId: hotel._id,
              date: { $gte: start, $lt: end }
            }
          },
          { $unwind: '$items' },
          {
            $match: { 'items.itemId': item._id }
          },
          {
            $group: {
              _id: null,
              totalConsumed: { $sum: '$items.quantityConsumed' }
            }
          }
        ]);

        const issued = issuedResult.length > 0 ? issuedResult[0].totalIssued : 0;
        const consumed = consumedResult.length > 0 ? consumedResult[0].totalConsumed : 0;

        if (issued > 0) {
          const leakagePercentage = ((issued - consumed) / issued * 100);

          // Determine alert type
          let alertType, alertLevel;
          if (leakagePercentage > 25) {
            alertType = 'red';
            alertLevel = 'critical';
          } else if (leakagePercentage > 15) {
            alertType = 'yellow';
            alertLevel = 'warning';
          } else {
            alertType = 'green';
            alertLevel = 'normal';
          }

          // Create alert if it doesn't exist for this period
          const existingAlert = await LeakageAlert.findOne({
            hotelId: hotel._id,
            itemId: item._id,
            period,
            startDate: start,
            endDate: end,
            status: { $in: ['active', 'investigating'] }
          });

          if (!existingAlert) {
            const alert = new LeakageAlert({
              alertType,
              alertLevel,
              hotelId: hotel._id,
              itemId: item._id,
              leakagePercentage,
              issuedQuantity: issued,
              consumedQuantity: consumed,
              period,
              startDate: start,
              endDate: end,
              estimatedLoss: (issued - consumed) * (item.pricePerUnit || 0)
            });

            await alert.save();
            alerts.push(alert);
          }
        }
      }
    }

    res.json({
      message: `Generated ${alerts.length} leakage alerts`,
      alerts: alerts.length,
      period,
      dateRange: { start, end }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error generating leakage alerts', error: error.message });
  }
};

// Get all leakage alerts
const getLeakageAlerts = async (req, res) => {
  try {
    const { status = 'active', alertType, hotelId, assignedTo } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const query = {};
    if (status) query.status = status;
    if (alertType) query.alertType = alertType;
    if (hotelId) query.hotelId = hotelId;
    if (assignedTo) query.assignedTo = assignedTo;

    const alerts = await LeakageAlert.find(query)
      .populate('hotelId', 'name')
      .populate('itemId', 'name category pricePerUnit')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await LeakageAlert.countDocuments(query);

    res.json({
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching leakage alerts', error: error.message });
  }
};

// Update alert status
const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, note } = req.body;

    const alert = await LeakageAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.status = status;

    if (assignedTo) {
      alert.assignedTo = assignedTo;
    }

    if (status === 'resolved') {
      alert.resolvedAt = new Date();
      alert.resolvedBy = req.user.id;
    }

    if (note) {
      alert.investigationNotes.push({
        note,
        addedBy: req.user.id,
        date: new Date()
      });
    }

    await alert.save();

    res.json({
      message: 'Alert status updated successfully',
      alert
    });

  } catch (error) {
    res.status(500).json({ message: 'Error updating alert status', error: error.message });
  }
};

// Get alert statistics
const getAlertStatistics = async (req, res) => {
  try {
    const stats = await LeakageAlert.aggregate([
      {
        $group: {
          _id: { alertType: '$alertType', status: '$status' },
          count: { $sum: 1 },
          totalLoss: { $sum: '$estimatedLoss' }
        }
      },
      {
        $group: {
          _id: '$_id.alertType',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              totalLoss: '$totalLoss'
            }
          },
          totalCount: { $sum: '$count' },
          totalLoss: { $sum: '$totalLoss' }
        }
      }
    ]);

    res.json({ statistics: stats });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching alert statistics', error: error.message });
  }
};

module.exports = {
  generateLeakageAlerts,
  getLeakageAlerts,
  updateAlertStatus,
  getAlertStatistics
};
