/**
 * Notification Service
 * Handles sending alerts, emails, and notifications for inventory management
 */

export class NotificationService {
  /**
   * Send low stock alert
   * @param {Object} product - Product object
   * @param {number} currentStock - Current stock quantity
   */
  static async sendLowStockAlert(product, currentStock) {
    const alertMessage = {
      type: 'low_stock',
      priority: 'high',
      title: `🚨 LOW STOCK ALERT: ${product.name}`,
      message: `Product ${product.name} (${product.SKU}) is below minimum threshold!`,
      details: {
        currentStock,
        minThreshold: product.minThreshold,
        reorderPoint: product.reorderPoint,
        suggestedReorder: product.reorderQuantity || 50
      },
      timestamp: new Date(),
      action: 'Reorder immediately'
    };

    // For now, log to console (replace with email/SMS service later)
    console.log('🔔 LOW STOCK ALERT:', alertMessage);
    
    // TODO: Integrate with email service (Nodemailer)
    // TODO: Integrate with SMS service (Twilio)
    // TODO: Integrate with Slack webhook
    
    return alertMessage;
  }

  /**
   * Send demand forecast alert
   * @param {Object} product - Product object
   * @param {Object} forecast - Forecast data
   */
  static async sendDemandForecastAlert(product, forecast) {
    const alertMessage = {
      type: 'demand_forecast',
      priority: forecast.nextMonth > product.stockQty ? 'medium' : 'low',
      title: `📊 DEMAND FORECAST ALERT: ${product.name}`,
      message: `Demand forecast indicates potential stockout risk`,
      details: {
        currentStock: product.stockQty,
        nextMonthDemand: forecast.nextMonth,
        confidence: `${(forecast.confidence * 100).toFixed(1)}%`,
        trend: forecast.trend,
        risk: forecast.nextMonth > product.stockQty ? 'HIGH' : 'LOW'
      },
      timestamp: new Date(),
      action: forecast.nextMonth > product.stockQty ? 'Plan reorder' : 'Monitor'
    };

    console.log('🔔 DEMAND FORECAST ALERT:', alertMessage);
    return alertMessage;
  }

  /**
   * Send anomaly detection alert
   * @param {Object} product - Product object
   * @param {Object} anomaly - Anomaly data
   */
  static async sendAnomalyAlert(product, anomaly) {
    const alertMessage = {
      type: 'anomaly_detection',
      priority: anomaly.severity > 0.7 ? 'high' : 'medium',
      title: `⚠️ ANOMALY DETECTED: ${product.name}`,
      message: `Unusual demand pattern detected for ${product.name}`,
      details: {
        anomalyType: anomaly.type,
        severity: `${(anomaly.severity * 100).toFixed(1)}%`,
        description: anomaly.description,
        currentValue: anomaly.currentValue,
        averageValue: anomaly.averageValue,
        changePercentage: anomaly.changePercentage
      },
      timestamp: new Date(),
      action: 'Investigate and adjust inventory strategy'
    };

    console.log('🔔 ANOMALY ALERT:', alertMessage);
    return alertMessage;
  }

  /**
   * Send supplier performance alert
   * @param {Object} supplier - Supplier object
   * @param {Object} performance - Performance metrics
   */
  static async sendSupplierPerformanceAlert(supplier, performance) {
    const alertMessage = {
      type: 'supplier_performance',
      priority: performance.onTimeDelivery < 0.8 ? 'high' : 'medium',
      title: `🏭 SUPPLIER PERFORMANCE ALERT: ${supplier.name}`,
      message: `Supplier performance metrics require attention`,
      details: {
        onTimeDelivery: `${(performance.onTimeDelivery * 100).toFixed(1)}%`,
        qualityRating: performance.qualityRating || 'N/A',
        leadTime: performance.avgLeadTime || 'N/A',
        issues: performance.issues || []
      },
      timestamp: new Date(),
      action: performance.onTimeDelivery < 0.8 ? 'Contact supplier' : 'Monitor'
    };

    console.log('🔔 SUPPLIER PERFORMANCE ALERT:', alertMessage);
    return alertMessage;
  }

  /**
   * Send reorder recommendation
   * @param {Object} product - Product object
   * @param {Object} forecast - Forecast data
   */
  static async sendReorderRecommendation(product, forecast) {
    const recommendedQuantity = Math.max(
      product.reorderQuantity || 50,
      forecast.nextMonth - product.stockQty
    );

    const alertMessage = {
      type: 'reorder_recommendation',
      priority: 'medium',
      title: `📋 REORDER RECOMMENDATION: ${product.name}`,
      message: `AI recommends reordering ${product.name}`,
      details: {
        currentStock: product.stockQty,
        recommendedQuantity,
        reason: forecast.nextMonth > product.stockQty ? 'Demand exceeds stock' : 'Below reorder point',
        urgency: product.stockQty <= product.minThreshold ? 'HIGH' : 'MEDIUM',
        supplier: product.supplier
      },
      timestamp: new Date(),
      action: `Reorder ${recommendedQuantity} units`
    };

    console.log('🔔 REORDER RECOMMENDATION:', alertMessage);
    return alertMessage;
  }

  /**
   * Send daily inventory summary
   * @param {Array} alerts - Array of alerts for the day
   */
  static async sendDailySummary(alerts) {
    const summary = {
      type: 'daily_summary',
      priority: 'low',
      title: '📊 DAILY INVENTORY SUMMARY',
      message: `Daily inventory summary for ${new Date().toDateString()}`,
      details: {
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.priority === 'high').length,
        lowStockProducts: alerts.filter(a => a.type === 'low_stock').length,
        anomalies: alerts.filter(a => a.type === 'anomaly_detection').length
      },
      alerts: alerts.slice(0, 5), // Top 5 alerts
      timestamp: new Date(),
      action: 'Review and take action'
    };

    console.log('📊 DAILY SUMMARY:', summary);
    return summary;
  }

  /**
   * Send custom notification
   * @param {string} type - Notification type
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} details - Additional details
   * @param {string} priority - Priority level
   */
  static async sendCustomNotification(type, title, message, details = {}, priority = 'medium') {
    const notification = {
      type,
      priority,
      title,
      message,
      details,
      timestamp: new Date()
    };

    console.log('🔔 CUSTOM NOTIFICATION:', notification);
    return notification;
  }

  /**
   * Basic admin notifier for server-side events (console for now)
   * Later: integrate email/SMS/Slack
   */
  static async notifyAdmin(title, message, details = {}) {
    const payload = {
      title,
      message,
      details,
      at: new Date()
    };
    console.log('📣 ADMIN NOTICE:', payload);
    return payload;
  }
}
