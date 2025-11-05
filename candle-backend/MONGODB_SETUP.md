# MongoDB Setup Guide for Candle Store

## 🔍 **Your Current Database Structure:**
- **Products**: name, price, category, flavour, image, createdAt
- **Orders**: name, phone, email, address, paymentMode, date

## 🚀 **MongoDB Options:**

### **Option 1: Local MongoDB (Recommended for Development)**
```env
MONGO_URI=mongodb://localhost:27017/candle-store
```

**Setup:**
1. Install MongoDB locally
2. Start MongoDB service
3. Your app will create the `candle-store` database automatically

### **Option 2: MongoDB Atlas (Cloud - Recommended for Production)**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/candle-store?retryWrites=true&w=majority
```

**Setup:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster
4. Get connection string
5. Replace `username`, `password`, and `cluster` in the URI

### **Option 3: MongoDB Compass (GUI Tool)**
- Download MongoDB Compass
- Connect to your database
- Manage data visually

## 📋 **Current .env Configuration:**
```env
# Email Configuration for Outlook
EMAIL_PROVIDER=outlook
EMAIL_USER=your-outlook-email@outlook.com
EMAIL_PASS=your-outlook-password
ADMIN_EMAIL=your-admin-email@outlook.com

# Database Configuration
MONGO_URI=mongodb://localhost:27017/candle-store

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🧪 **Test Your MongoDB Connection:**
```bash
node testMongo.js
```

## 📊 **Your Database Collections:**
- **products**: Store candle products
- **orders**: Store customer orders

## 🔧 **Quick Setup Commands:**

### For Local MongoDB:
```bash
# Install MongoDB (Windows)
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB

# Test connection
node testMongo.js
```

### For MongoDB Atlas:
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster
3. Get connection string
4. Update MONGO_URI in .env file

## ✅ **Your App is Ready!**
Once MongoDB is connected, your candle store will have:
- Product management
- Order tracking
- Email notifications
- Payment processing

