import express from 'express';
import {
  getDemandForecast,
  getProductAnomalies,
  getProductInsights,
  getInventoryDashboard,
  getDemandTrends,
  getSalesTrends,
  getGlobalDemandForecast,
  getGeminiForecast,
} from '../controllers/aiAnalyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(protect);

router.get('/demand-forecast/:productId', validateObjectId('productId'), getDemandForecast);
router.get('/gemini-forecast/:productId', validateObjectId('productId'), getGeminiForecast);
router.get('/anomalies/:productId', validateObjectId('productId'), getProductAnomalies);
router.get('/insights/:productId', validateObjectId('productId'), getProductInsights);
router.get('/inventory-dashboard', getInventoryDashboard);
router.get('/demand-trends', getDemandTrends);
router.get('/sales-trends', getSalesTrends);
router.get('/demand-forecast', getGlobalDemandForecast);

export default router;
