export const checkThreshold = (product) => {
  const result = { lowStock: false, alert: null, recommendation: null };

  if (product.stockQty <= product.minThreshold) {
    result.lowStock = true;
    result.alert = `🚨 LOW STOCK ALERT: ${product.name} (${product.SKU}) is below threshold!`;
    result.recommendation = `Current stock: ${product.stockQty}, Threshold: ${product.minThreshold}. Consider reordering.`;
  }

  if (product.stockQty <= (product.reorderPoint || product.minThreshold + 5)) {
    result.recommendation = `📋 REORDER SUGGESTION: ${product.name} is at reorder point. Suggested quantity: ${product.reorderQuantity || 50} units.`;
  }

  if (product.stockQty <= (product.minThreshold * 0.2)) {
    result.alert = `🚨 CRITICAL STOCK ALERT: ${product.name} is critically low! Immediate action required.`;
    result.recommendation = `URGENT: Reorder ${product.reorderQuantity || 100} units immediately.`;
  }

  return result;
};

export const calculateStockStatus = (product) => {
  const stockPercentage = (product.stockQty / (product.maxThreshold || 100)) * 100;
  
  if (stockPercentage <= 10) return 'critical';
  if (stockPercentage <= 25) return 'low';
  if (stockPercentage <= 50) return 'medium';
  if (stockPercentage <= 75) return 'good';
  return 'excellent';
};
