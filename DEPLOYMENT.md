# Lyzr Support Backend - Deployment Guide

## 🚀 Deployed URLs

- **Frontend**: https://lyzr-chat-agent.vercel.app
- **Backend**: [Your Render URL after deployment]

## 📋 Pre-Deployment Checklist

- ✅ Frontend built and deployed to Vercel
- ✅ Backend configured for static file serving
- ✅ CORS configured for Vercel frontend
- ✅ Port set to 8080 for Render
- ✅ Build scripts configured
- ✅ Health check endpoint added

## 🔧 Render Deployment

### 1. Service Configuration
```
Name: lyzr-support-backend
Environment: Node
Root Directory: backend
Build Command: ./render-build.sh
Start Command: npm start
```

### 2. Required Environment Variables
```
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lyzr-support
JWT_SECRET=your-super-secret-jwt-key
LYZR_API_KEY=your-lyzr-api-key
```

### 3. Endpoints After Deployment

#### API Endpoints
- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `GET /api/chat/:agentId` - Chat with agent
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket

#### Widget & Demo
- `GET /api/widget/:agentId/widget.js` - Widget script
- `GET /demo.html` - Demo page with widget
- `GET /widget/*` - Static widget files

## 🔗 Integration Testing

After deployment, test these URLs:

1. **Health Check**: `https://your-render-url.onrender.com/health`
2. **Demo Page**: `https://your-render-url.onrender.com/demo.html`
3. **Widget Script**: `https://your-render-url.onrender.com/api/widget/test/widget.js`

## 🌐 Frontend Configuration

Update your frontend environment variables to point to the deployed backend:

```env
NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com
```

## 📝 Post-Deployment Steps

1. Update frontend API URL
2. Test full-stack integration
3. Verify widget embedding works
4. Check CORS configuration
5. Monitor logs for any issues

## 🔍 Troubleshooting

### Common Issues
- **CORS errors**: Check origin configuration in backend
- **Static files not served**: Verify build script copies files correctly
- **API not accessible**: Check environment variables and MongoDB connection
- **Widget not loading**: Verify widget.js endpoint and CORS headers

### Logs
Check Render logs for detailed error information:
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
