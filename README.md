# 🚀 Lyzr Support Chat - AI-Powered Customer Support Platform

A complete full-stack solution for AI-powered customer support with embeddable chat widgets, real-time analytics, and comprehensive agent management.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Live Demo](#live-demo)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Widget Integration](#widget-integration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Lyzr Support Chat is a modern, AI-powered customer support platform that allows businesses to:

- Create and manage AI support agents
- Embed customizable chat widgets on any website
- Track conversations and analytics in real-time
- Manage support tickets and user interactions
- Optimize AI responses based on user feedback

## ✨ Features

### 🤖 AI-Powered Support
- **Smart Agents**: Create multiple AI agents with custom configurations
- **Lyzr Integration**: Powered by Lyzr's advanced AI capabilities
- **Context Awareness**: Agents remember conversation context
- **Custom Training**: Train agents with your specific data

### 🎨 Customizable Widgets
- **Themes**: Light and dark mode support
- **Positioning**: Bottom-right, bottom-left, top-right, top-left
- **Branding**: Custom colors, titles, and welcome messages
- **Responsive**: Works on desktop and mobile devices

### 📊 Analytics & Management
- **Real-time Dashboard**: Monitor chat volumes and agent performance
- **Ticket Management**: Track and resolve customer issues
- **User Management**: Handle customer accounts and permissions
- **Optimization Tools**: Improve AI responses based on feedback

### 🔒 Security & Reliability
- **JWT Authentication**: Secure user sessions
- **CORS Protection**: Safe cross-origin resource sharing
- **HTTPS Encryption**: All data transmitted securely
- **Database Security**: MongoDB with secure connections

## 🌐 Live Demo

- **Frontend Dashboard**: [https://lyzr-chat-agent.vercel.app](https://lyzr-chat-agent.vercel.app)
- **Backend API**: [https://lyzr-chat-agent.onrender.com](https://lyzr-chat-agent.onrender.com)
- **Widget Demo**: [https://lyzr-chat-agent.onrender.com/demo.html](https://lyzr-chat-agent.onrender.com/demo.html)

### Demo Credentials
```
Email: demo@example.com
Password: demo123
```

## 🚀 Quick Start

### 1. Try the Widget
Add this to any website to test the widget:

```html
<!-- Lyzr Support Chat Widget -->
<script 
  src="https://lyzr-chat-agent.onrender.com/api/widget/6883fec523d48350b2f43f80/widget.js"
  data-agent-id="6883fec523d48350b2f43f80"
  data-title="Support Chat"
  data-welcome-message="Hello! How can I help you today?"
  data-theme="light"
  data-primary-color="#3b82f6"
  data-position="bottom-right"
></script>
```

### 2. Console Injection (For Testing)
Open any website's developer console and paste:

```javascript
const script = document.createElement('script');
script.src = 'https://lyzr-chat-agent.onrender.com/api/widget/6883fec523d48350b2f43f80/widget.js';
script.setAttribute('data-agent-id', '6883fec523d48350b2f43f80');
script.setAttribute('data-title', 'Support Chat');
script.setAttribute('data-welcome-message', 'Hello! How can I help you today?');
script.setAttribute('data-theme', 'light');
script.setAttribute('data-primary-color', '#3b82f6');
document.head.appendChild(script);
```

## 🛠️ Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Lyzr API key

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/lyzr-support-chat.git
cd lyzr-support-chat
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run build
npm start
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run build
npm start
```

### 4. Setup Widget (Already included in backend)
The widget is automatically served by the backend at `/api/widget/:agentId/widget.js`

## ⚙️ Configuration

### Backend Environment Variables
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lyzr-support

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Lyzr Configuration
LYZR_API_KEY=your-lyzr-api-key

# Demo Configuration
DEMO_AGENT_ID=your-demo-agent-id

# Server Configuration
BACKEND_URL=https://your-backend-domain.com
PORT=8080
NODE_ENV=production
```

### Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com

# Site Configuration
NEXT_SITE_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## 🎯 Usage

### 1. Create an Account
1. Visit the frontend dashboard
2. Click "Sign Up" and create your account
3. Verify your email (if email verification is enabled)

### 2. Create Your First Agent
1. Log into the dashboard
2. Click "Create Agent"
3. Fill in agent details:
   - **Name**: Your agent's name
   - **Description**: What your agent does
   - **Lyzr Config**: Your Lyzr agent ID and API details
   - **Widget Settings**: Customize appearance

### 3. Get Your Widget Code
1. Go to your agent in the dashboard
2. Click "Widget" button
3. Copy the generated script tag
4. Paste it into your website's HTML

### 4. Customize Your Widget
```html
<script 
  src="https://your-backend.com/api/widget/YOUR_AGENT_ID/widget.js"
  data-agent-id="YOUR_AGENT_ID"
  data-title="Custom Title"
  data-welcome-message="Welcome! How can I help?"
  data-placeholder="Type your message..."
  data-theme="dark"
  data-primary-color="#ff6b6b"
  data-position="bottom-left"
></script>
```

## 🔧 Widget Integration

### Basic Integration
```html
<script src="YOUR_WIDGET_URL" data-agent-id="YOUR_AGENT_ID"></script>
```

### Advanced Configuration
```html
<script 
  src="YOUR_WIDGET_URL"
  data-agent-id="YOUR_AGENT_ID"
  data-title="Support"
  data-welcome-message="Hi! How can I help you today?"
  data-placeholder="Type your message..."
  data-theme="light"
  data-primary-color="#3b82f6"
  data-position="bottom-right"
  data-z-index="9999"
></script>
```

### Widget Events (JavaScript API)
```javascript
// Listen for widget events
window.addEventListener('lyzr-widget-ready', (event) => {
  console.log('Widget is ready:', event.detail);
});

window.addEventListener('lyzr-widget-message-sent', (event) => {
  console.log('Message sent:', event.detail.message);
});

window.addEventListener('lyzr-widget-message-received', (event) => {
  console.log('Message received:', event.detail.message);
});

// Control widget programmatically
window.LyzrWidget.open();    // Open the chat
window.LyzrWidget.close();   // Close the chat
window.LyzrWidget.toggle();  // Toggle chat state
```

## 📡 API Documentation

### Authentication
```bash
POST /api/auth/register
POST /api/auth/login
```

### Agents
```bash
GET    /api/agents              # List user's agents
POST   /api/agents              # Create new agent
GET    /api/agents/:id          # Get specific agent
PUT    /api/agents/:id          # Update agent
DELETE /api/agents/:id          # Delete agent
```

### Chat
```bash
POST   /api/chat/:agentId       # Send message to agent
```

### Tickets
```bash
GET    /api/tickets             # List tickets
POST   /api/tickets             # Create ticket
GET    /api/tickets/:id         # Get specific ticket
PUT    /api/tickets/:id         # Update ticket
```

### Widget
```bash
GET    /api/widget/:agentId/widget.js    # Get widget script
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: `./render-build.sh`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard

### Manual Deployment
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build

# Deploy to your hosting provider
```

## 📁 Project Structure

```
lyzr-support-chat/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # External service integrations
│   │   ├── templates/       # HTML templates
│   │   └── utils/           # Helper utilities
│   ├── dist/               # Compiled JavaScript
│   └── package.json
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities and API client
│   │   └── stores/         # Zustand state management
│   ├── public/             # Static assets
│   └── package.json
├── widget/                 # Embeddable chat widget
│   ├── src/
│   │   ├── widget.js       # Main widget script
│   │   └── widget.css      # Widget styles
│   └── package.json
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configurable cross-origin policies
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: MongoDB with Mongoose ODM
- **XSS Protection**: Helmet.js security headers

## 🎨 Customization

### Widget Themes
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Modern, sleek design
- **Custom Colors**: Any hex color for primary elements

### Widget Positions
- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

### Agent Configuration
- Custom welcome messages
- Personalized agent names
- Specific training data
- Response optimization settings

## 🐛 Troubleshooting

### Common Issues

**Widget Not Loading**
```javascript
// Check console for errors
console.log('Widget script loaded:', document.querySelector('script[src*="widget.js"]'));
```

**CORS Errors**
- Ensure your domain is allowed in backend CORS settings
- Check HTTPS/HTTP protocol matching

**Authentication Issues**
- Verify JWT secret is set correctly
- Check token expiration settings

**MongoDB Connection**
- Verify connection string format
- Ensure network access is allowed

### Debug Mode
```javascript
// Enable widget debug mode
window.LYZR_DEBUG = true;
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup
```bash
# Install dependencies for all packages
npm run install:all

# Start development servers
npm run dev:backend    # Backend on port 8080
npm run dev:frontend   # Frontend on port 3000
npm run dev:widget     # Widget development
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Lyzr](https://lyzr.ai) for AI agent capabilities
- [Next.js](https://nextjs.org) for the frontend framework
- [Express.js](https://expressjs.com) for the backend API
- [MongoDB](https://mongodb.com) for database storage
- [Vercel](https://vercel.com) for frontend hosting
- [Render](https://render.com) for backend hosting

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/your-username/lyzr-support-chat/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/lyzr-support-chat/issues)
- **Email**: support@yourdomain.com
- **Demo**: [Live Demo](https://lyzr-chat-agent.vercel.app)

---

**Made with ❤️ for better customer support experiences**
