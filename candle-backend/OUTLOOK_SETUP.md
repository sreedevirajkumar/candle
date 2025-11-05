# Outlook Email Setup Guide for Candle Store

## ✅ Yes, Outlook will work perfectly for your app!

Your app is already configured to:
1. **Send order confirmations to customers** when they place orders
2. **Send admin notifications** to you when new orders are placed

## 🔧 Setup Steps

### 1. Create Environment File
Create a `.env` file in your `candle-backend` folder with these settings:

```env
# Email Configuration for Outlook
EMAIL_PROVIDER=outlook
EMAIL_USER=your-outlook-email@outlook.com
EMAIL_PASS=your-outlook-password

# Admin Email (where order notifications will be sent)
ADMIN_EMAIL=your-admin-email@outlook.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. Outlook Account Setup
1. **Create Outlook account** (if you haven't already)
2. **Enable "Less secure app access"** or use **App Passwords**:
   - Go to Outlook.com → Settings → Security
   - Enable 2-factor authentication
   - Generate an App Password (use this instead of your regular password)

### 3. Important Outlook Settings
- **Use App Password**: Don't use your regular Outlook password
- **SMTP Settings**: Your code already handles this automatically
- **Authentication**: Make sure 2FA is enabled and use App Password

## 📧 How It Works

### When Customer Places Order:
1. Customer fills order form
2. System sends **confirmation email** to customer
3. System sends **notification email** to admin (you)

### Email Types:
- **Customer Email**: Order confirmation with details
- **Admin Email**: New order alert with customer info and order details

## 🧪 Testing Your Setup

### Test Email Endpoint:
```bash
POST /api/email/test
{
  "email": "test@example.com"
}
```

### Test Order Endpoint:
```bash
POST /api/email/order
{
  "name": "Test Customer",
  "email": "customer@example.com",
  "phone": "9876543210",
  "address": "Test Address",
  "paymentMode": "online",
  "cartItems": [...],
  "totalAmount": 150
}
```

## 🔒 Security Notes

1. **Never commit `.env` file** to version control
2. **Use App Passwords** instead of regular passwords
3. **Keep credentials secure**

## 📱 Admin Notifications

You will receive emails at `ADMIN_EMAIL` containing:
- Customer information
- Order details
- Payment status
- Delivery address
- Order items and totals

## 🚀 Ready to Use!

Once you set up the `.env` file with your Outlook credentials, your app will automatically:
- Send beautiful order confirmations to customers
- Send detailed notifications to you for each new order
- Handle email failures gracefully with fallback logging

Your email system is already fully integrated and ready to work!

