import express from 'express';
import { 
  getDemandForecast, 
  getProductAnomalies, 
  getProductInsights, 
  getInventoryDashboard, 
  getDemandTrends,
  getSalesTrends,
  getGlobalDemandForecast,
  getGeminiForecast     // 👈 New import
} from '../controllers/aiAnalyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// All AI analytics routes require authentication
router.use(protect);

// AI Demand Forecasting (rule-based)
router.get('/demand-forecast/:productId', validateObjectId('productId'), getDemandForecast);

// AI Demand Forecasting (Gemini-powered)
router.get('/gemini-forecast/:productId', validateObjectId('productId'), getGeminiForecast);  // 👈 New route

// Anomaly Detection
router.get('/anomalies/:productId', validateObjectId('productId'), getProductAnomalies);

// Comprehensive Product Insights
router.get('/insights/:productId', validateObjectId('productId'), getProductInsights);

// Inventory Dashboard with AI Analytics
router.get('/inventory-dashboard', getInventoryDashboard);

// Demand Trends Analysis
router.get('/demand-trends', getDemandTrends);

// Sales Trends (last 6 months)
router.get('/sales-trends', getSalesTrends);

// Global Demand Forecast (next 3 months)
router.get('/demand-forecast', getGlobalDemandForecast);

export default router;
