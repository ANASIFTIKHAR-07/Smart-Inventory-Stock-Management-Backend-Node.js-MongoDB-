import { AIForecastingService } from '../utils/aiForecasting.js';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';

export const getDemandForecast = async (req, res) => {
  try {
    const { productId } = req.params;
    const { period } = req.query;

    const product = await Product.findById(productId).populate('supplier', 'name email');
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let forecast;
    try {
      forecast = await AIForecastingService.geminiForecast(productId);
    } catch (error) {
      forecast = await AIForecastingService.calculateDemandForecast(
        productId, 
        period ? parseInt(period) : 30
      );
    }

    product.demandForecast = {
      ...forecast,
      lastUpdated: new Date()
    };
    await product.save();

    res.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        SKU: product.SKU,
        category: product.category,
        currentStock: product.stockQty,
        minThreshold: product.minThreshold,
        reorderPoint: product.reorderPoint,
        supplier: product.supplier
      },
      forecast,
      recommendations: {
        shouldReorder: product.stockQty <= product.reorderPoint,
        reorderQuantity: Math.max(
          product.reorderQuantity, 
          forecast.nextMonth - product.stockQty
        ),
        urgency: product.stockQty <= product.minThreshold ? 'high' : 'medium',
        stockoutRisk: forecast.nextMonth > product.stockQty ? 'high' : 'low'
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const getProductAnomalies = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const anomalies = await AIForecastingService.detectAnomalies(productId);

    res.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        SKU: product.SKU
      },
      anomalies,
      riskAssessment: {
        level: anomalies.hasAnomaly ? 'high' : 'low',
        description: anomalies.description,
        recommendedAction: anomalies.hasAnomaly 
          ? 'Monitor closely and adjust inventory accordingly'
          : 'Continue normal operations'
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const getProductInsights = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId).populate('supplier', 'name email phone');
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const insights = await AIForecastingService.getProductInsights(productId);
    
    if (!insights) {
      return res.status(500).json({ message: "Unable to generate insights" });
    }

    res.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        SKU: product.SKU,
        category: product.category,
        currentStock: product.stockQty,
        minThreshold: product.minThreshold,
        reorderPoint: product.reorderPoint,
        supplier: product.supplier
      },
      insights,
      actionItems: generateActionItems(product, insights)
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const getInventoryDashboard = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate('supplier', 'name');
    
    const dashboardData = await Promise.all(products.map(async (product) => {
      const insights = await AIForecastingService.getProductInsights(product._id);
      
      return {
        product: {
          id: product._id,
          name: product.name,
          SKU: product.SKU,
          category: product.category,
          supplier: product.supplier
        },
        stock: {
          current: product.stockQty,
          threshold: product.minThreshold,
          reorderPoint: product.reorderPoint,
          status: getStockStatus(product.stockQty, product.minThreshold)
        },
        forecast: insights?.forecast || null,
        risk: insights?.insights?.riskLevel || 'low',
        urgency: insights?.insights?.reorderUrgency || 'low'
      };
    }));

    const summary = {
      totalProducts: products.length,
      lowStockProducts: dashboardData.filter(item => item.stock.status === 'low').length,
      criticalProducts: dashboardData.filter(item => item.stock.status === 'critical').length,
      highRiskProducts: dashboardData.filter(item => item.risk === 'high').length
    };

    res.json({
      success: true,
      summary,
      products: dashboardData
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const getDemandTrends = async (req, res) => {
  try {
    const { category, period } = req.query;
    
    let query = { isActive: true };
    if (category) query.category = category;
    
    const products = await Product.find(query);
    
    const trends = await Promise.all(products.map(async (product) => {
      const forecast = await AIForecastingService.calculateDemandForecast(
        product._id, 
        period ? parseInt(period) : 30
      );
      
      return {
        productId: product._id,
        name: product.name,
        category: product.category,
        trend: forecast.trend,
        confidence: forecast.confidence,
        nextMonthDemand: forecast.nextMonth,
        currentStock: product.stockQty
      };
    }));

    const categoryTrends = trends.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      trends: categoryTrends,
      summary: {
        increasing: trends.filter(t => t.trend === 'increasing').length,
        decreasing: trends.filter(t => t.trend === 'decreasing').length,
        stable: trends.filter(t => t.trend === 'stable').length
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: error.message 
    });
  }
};

function getStockStatus(currentStock, minThreshold) {
  if (currentStock <= minThreshold * 0.2) return 'critical';
  if (currentStock <= minThreshold) return 'low';
  if (currentStock <= minThreshold * 2) return 'medium';
  return 'good';
}

function generateActionItems(product, insights) {
  const actions = [];
  
  if (product.stockQty <= product.minThreshold) {
    actions.push({
      priority: 'high',
      action: 'Reorder immediately',
      reason: 'Stock below minimum threshold',
      quantity: product.reorderQuantity
    });
  }
  
  if (insights.forecast.nextMonth > product.stockQty) {
    actions.push({
      priority: 'medium',
      action: 'Plan reorder',
      reason: 'Predicted demand exceeds current stock',
      quantity: insights.forecast.nextMonth - product.stockQty
    });
  }
  
  if (insights.anomalies.hasAnomaly) {
    actions.push({
      priority: 'medium',
      action: 'Monitor closely',
      reason: 'Unusual demand pattern detected',
      details: insights.anomalies.description
    });
  }
  
  return actions;
}

export const getSalesTrends = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const pipeline = [
      { $match: { movementType: 'OUT', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          sales: { $sum: '$quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ];

    let results = await StockMovement.aggregate(pipeline);
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(key);
    }
    const map = new Map(results.map(r => [r._id, r.sales]));
    const data = months.map(m => ({ month: m, sales: map.get(m) || 0 }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get sales trends', error: error.message });
  }
};

export const getGlobalDemandForecast = async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const pipeline = [
      { $match: { movementType: 'OUT', createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ];
    const agg = await StockMovement.aggregate(pipeline);
    const base = agg?.[0]?.total || 100;

    const forecasts = months.map((m, idx) => ({ month: m, forecast: Math.round(base * (1 + 0.05 * (idx + 1))) }));
    res.json(forecasts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get forecast', error: error.message });
  }
};

export const getGeminiForecast = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const forecast = await AIForecastingService.geminiForecast(productId);

    res.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        SKU: product.SKU
      },
      forecast
    });

  } catch (error) {
    res.status(500).json({ message: "Gemini forecast failed", error: error.message });
  }
};