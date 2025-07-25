import fs from 'fs';
import path from 'path';

export function getDemoHTML(protocol: string, host: string): string {
  try {
    // Try multiple possible paths for the template file
    const possiblePaths = [
      path.join(__dirname, '..', 'templates', 'demo.html'),
      path.join(__dirname, 'templates', 'demo.html'),
      path.join(process.cwd(), 'src', 'templates', 'demo.html'),
      path.join(process.cwd(), 'dist', 'templates', 'demo.html'),
      path.join(process.cwd(), 'templates', 'demo.html')
    ];
    
    let htmlTemplate = '';
    let templateFound = false;
    
    for (const templatePath of possiblePaths) {
      try {
        if (fs.existsSync(templatePath)) {
          htmlTemplate = fs.readFileSync(templatePath, 'utf8');
          templateFound = true;
          console.log(`✅ Demo template loaded from: ${templatePath}`);
          break;
        }
      } catch (err) {
        continue; // Try next path
      }
    }
    
    if (!templateFound) {
      console.warn('⚠️ Demo template file not found in any location, using fallback');
      throw new Error('Template not found');
    }
    
    // Get demo agent ID from environment variable
    const agenetId = process.env.LYZR_AGENT_ID || 'demo-agent';
    
    // Replace placeholders with actual URLs
    const widgetUrl = `${protocol}://${host}/api/widget/${agenetId}/widget.js`;
    const demoWidgetUrl = `${protocol}://${host}/api/widget/${agenetId}/widget.js`;
    
    return htmlTemplate
      .replace('{{WIDGET_URL}}', widgetUrl)
      .replace('{{DEMO_WIDGET_URL}}', demoWidgetUrl);
  } catch (error) {
    console.error('Error reading demo HTML template:', error);
    
    // Get demo agent ID from environment variable for fallback too
    const demoAgentId = process.env.LYZR_AGENT_ID || 'demo-agent';
    
    // Enhanced fallback HTML
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lyzr Support Widget Demo</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        .title {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 20px;
        }
        .fallback {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">🚀 Lyzr Support Widget Demo</h1>
        <div class="fallback">
            <h2>Demo Page (Fallback Mode)</h2>
            <p>Widget script URL: <code>${protocol}://${host}/api/widget/${demoAgentId}/widget.js</code></p>
            <p>Visit our dashboard: <a href="https://lyzr-chat-agent.vercel.app" target="_blank">Lyzr Chat Agent</a></p>
        </div>
    </div>
    
    <script 
      src="${protocol}://${host}/api/widget/${demoAgentId}/widget.js"
      data-agent-id="${demoAgentId}"
      data-title="Demo Support"
      data-welcome-message="👋 Welcome to Lyzr Support! This is a demo widget."
      data-primary-color="#3b82f6"
    ></script>
</body>
</html>`;
  }
}