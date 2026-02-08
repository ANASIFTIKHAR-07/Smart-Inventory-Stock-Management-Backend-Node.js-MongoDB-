# 🛒 SmartStock AI - AI-Powered Inventory & Demand Forecasting System

## 🚀 Overview
SmartStock AI is a comprehensive inventory management system that combines traditional inventory tracking with AI-powered demand forecasting and anomaly detection. The system helps businesses optimize their inventory levels, predict future demand, and make data-driven reordering decisions.

## ✨ Features

### 🔐 **Authentication & User Management**
- Role-based access control (Admin/Staff)
- JWT-based authentication
- Secure password hashing with bcrypt

### 📦 **Inventory Management**
- Product catalog with SKU tracking
- Real-time stock level monitoring
- Minimum threshold alerts
- Stock movement tracking (IN/OUT)
- Category-based organization

### 🏭 **Supplier Management**
- Supplier database
- Product-supplier linking
- Performance tracking
- Purchase order management

### 🤖 **AI-Powered Features**
- **Demand Forecasting**: Predict future demand using historical data
- **Anomaly Detection**: Identify unusual demand patterns
- **Smart Recommendations**: AI-driven reorder suggestions
- **Risk Assessment**: Calculate inventory risk levels
- **Trend Analysis**: Market trend identification

### 📊 **Reporting & Analytics**
- Inventory dashboard
- Demand trends analysis
- Supplier performance metrics
- Stock movement reports
- AI insights dashboard

### 🔔 **Smart Notifications**
- Low stock alerts
- Demand forecast warnings
- Anomaly detection alerts
- Supplier performance notifications
- Daily inventory summaries

## 🛠 **Tech Stack**

### **Backend**
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### **AI Components**
- **Custom ML Algorithms** - Demand forecasting
- **Statistical Analysis** - Anomaly detection
- **Time Series Analysis** - Trend prediction

### **Architecture**
- **RESTful API** design
- **Modular structure** with separate routes/controllers
- **Middleware-based** authentication
- **Utility services** for AI and notifications

## 📁 **Project Structure**

```
backend/
├── controllers/           # Business logic controllers
│   ├── aiAnalyticsController.js    # AI analytics endpoints
│   ├── dashboardController.js      # Dashboard data
│   ├── purchaseOrderController.js  # Purchase order management
│   ├── reportsController.js        # Reporting system
│   ├── stockController.js          # Stock operations
│   └── stockMovementController.js  # Stock movement tracking
├── models/               # Database models
│   ├── Product.js        # Product schema with AI fields
│   ├── PurchaseOrder.js  # Purchase order schema
│   ├── StockMovement.js  # Stock movement tracking
│   ├── Supplier.js       # Supplier management
│   └── User.js           # User authentication
├── routes/               # API route definitions
│   ├── aiAnalyticsRoutes.js       # AI analytics endpoints
│   ├── authRoutes.js              # Authentication routes
│   ├── dashboardRoutes.js         # Dashboard routes
│   ├── productRoutes.js           # Product management
│   ├── purchaseOrderRoutes.js     # Purchase order routes
│   ├── reportRoutes.js            # Reporting routes
│   ├── stockMovementRoutes.js     # Stock movement routes
│   └── supplierRoutes.js          # Supplier management
├── utils/                # Utility services
│   ├── aiForecasting.js           # AI demand forecasting
│   ├── checkThreshold.js          # Stock threshold checking
│   └── notificationService.js     # Alert system
├── middleware/           # Custom middleware
├── index.js              # Main server file
└── package.json          # Dependencies
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB database
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartStock-AI/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb uri here
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

## 📡 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Products**
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### **Stock Management**
- `GET /api/stock` - Get stock levels
- `POST /api/stock-movements` - Record stock movement
- `GET /api/stock-movements` - Get movement history

### **AI Analytics** 🆕
- `GET /api/ai-analytics/demand-forecast/:productId` - Get demand forecast
- `GET /api/ai-analytics/anomalies/:productId` - Detect anomalies
- `GET /api/ai-analytics/insights/:productId` - Get comprehensive insights
- `GET /api/ai-analytics/inventory-dashboard` - AI-powered dashboard
- `GET /api/ai-analytics/demand-trends` - Analyze demand trends

### **Reports & Dashboard**
- `GET /api/dashboard` - Main dashboard
- `GET /api/reports` - Various reports
- `GET /api/purchase-orders` - Purchase order management

## 🤖 **AI Features Deep Dive**

### **Demand Forecasting**
The system uses advanced statistical algorithms to predict future demand:
- **Time Series Analysis**: Analyzes historical stock movements
- **Trend Detection**: Identifies increasing/decreasing demand patterns
- **Confidence Scoring**: Provides confidence levels for predictions
- **Multiple Timeframes**: Monthly and quarterly forecasts

### **Anomaly Detection**
Automatically detects unusual patterns in demand:
- **Statistical Outliers**: Uses standard deviation analysis
- **Pattern Recognition**: Identifies sudden spikes or drops
- **Severity Assessment**: Quantifies anomaly impact
- **Real-time Monitoring**: Continuous pattern analysis

### **Smart Recommendations**
AI-driven suggestions for inventory management:
- **Reorder Timing**: When to place orders
- **Quantity Optimization**: How much to order
- **Risk Assessment**: Inventory risk levels
- **Urgency Prioritization**: Action priority levels

## 📊 **Sample API Responses**

### **Demand Forecast**
```json
{
  "success": true,
  "product": {
    "id": "product_id",
    "name": "Laptop",
    "SKU": "LAP001",
    "currentStock": 25,
    "minThreshold": 10
  },
  "forecast": {
    "nextMonth": 150,
    "nextQuarter": 450,
    "confidence": 0.85,
    "trend": "increasing",
    "dataPoints": 30
  },
  "recommendations": {
    "shouldReorder": true,
    "reorderQuantity": 125,
    "urgency": "medium",
    "stockoutRisk": "high"
  }
}
```

### **Anomaly Detection**
```json
{
  "success": true,
  "anomalies": {
    "hasAnomaly": true,
    "type": "spike",
    "severity": 0.75,
    "description": "Unusual demand spike detected",
    "changePercentage": 150
  },
  "riskAssessment": {
    "level": "high",
    "recommendedAction": "Monitor closely and adjust inventory"
  }
}
```

## 🔧 **Configuration**

### **AI Parameters**
- **Forecast Period**: Default 30 days (configurable)
- **Anomaly Threshold**: 2 standard deviations
- **Confidence Calculation**: Based on data consistency
- **Trend Sensitivity**: 20% change threshold

### **Notification Settings**
- **Alert Priorities**: High, Medium, Low
- **Delivery Methods**: Console logging (extensible to email/SMS)
- **Frequency**: Real-time + daily summaries

## 🚀 **Future Enhancements**

### **Planned Features**
- **Email Integration**: Nodemailer for email alerts
- **SMS Notifications**: Twilio integration
- **Slack Integration**: Webhook notifications
- **Advanced ML Models**: Prophet, ARIMA integration
- **Real-time Dashboard**: WebSocket updates
- **Mobile App**: React Native application

### **AI Improvements**
- **Deep Learning Models**: Neural networks for complex patterns
- **External Data Integration**: Weather, economic indicators
- **Seasonal Analysis**: Holiday and seasonal demand patterns
- **Multi-warehouse Support**: Distributed inventory optimization

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Node.js, MongoDB, and AI/ML technologies**
