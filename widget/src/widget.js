// Lyzr Support Widget - Main JavaScript

class LyzrWidget {
  constructor(config = {}) {
    this.config = {
      agentId: config.agentId || '',
      apiUrl: config.apiUrl || 'http://localhost:5001/api',
      theme: config.theme || 'light',
      primaryColor: config.primaryColor || '#3b82f6',
      position: config.position || 'bottom-right',
      welcomeMessage: config.welcomeMessage || 'Hello! How can I help you today?',
      placeholder: config.placeholder || 'Type your message...',
      title: config.title || 'Support Chat',
      subtitle: config.subtitle || 'We\'re here to help',
      ...config
    };
    
    this.isOpen = false;
    this.messages = [];
    this.isTyping = false;
    this.sessionId = this.generateSessionId();
    
    this.init();
  }
  
  init() {
    console.log('🚀 Initializing Lyzr Widget...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createWidget());
    } else {
      this.createWidget();
    }
  }
  
  createWidget() {
    console.log('🔨 Creating widget elements...');
    
    // Apply custom styles
    this.injectStyles();
    
    // Create and append bubble
    this.createBubble();
    
    // Create and append chat window
    this.createChatWindow();
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log('✅ Lyzr Widget initialized successfully');
  }
  
 injectStyles() {
    if (document.getElementById('lyzr-widget-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'lyzr-widget-styles';
    style.textContent = `
      /* Lyzr Widget Styles */
      .lyzr-widget-bubble {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 60px !important;
        height: 60px !important;
        background: ${this.config.primaryColor} !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        z-index: 999999 !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: white !important;
        font-size: 24px !important;
        transition: all 0.3s ease !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      
      .lyzr-widget-bubble:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 6px 25px rgba(0,0,0,0.2) !important;
      }
      
      .lyzr-widget-container {
        position: fixed !important;
        bottom: 90px !important;
        right: 20px !important;
        width: 350px !important;
        height: 500px !important;
        background: white !important;
        border-radius: 12px !important;
        z-index: 999998 !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
        display: none !important;
        flex-direction: column !important;
        overflow: hidden !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        border: 1px solid #e5e7eb !important;
      }
      
      .lyzr-widget-container.open {
        display: flex !important;
      }
      
      .lyzr-widget-header {
        background: ${this.config.primaryColor} !important;
        color: white !important;
        padding: 16px 20px !important;
        font-weight: 600 !important;
        font-size: 16px !important;
        margin: 0 !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      }
      
      .lyzr-widget-close {
        background: none !important;
        border: none !important;
        color: white !important;
        font-size: 18px !important;
        cursor: pointer !important;
        padding: 5px !important;
        width: 30px !important;
        height: 30px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 4px !important;
      }
      
      .lyzr-widget-close:hover {
        background: rgba(255,255,255,0.1) !important;
      }
      
      .lyzr-widget-messages {
        flex: 1 !important;
        padding: 20px !important;
        overflow-y: auto !important;
        background: #f9f9f9 !important;
        max-height: 350px !important;
      }
      
      .lyzr-widget-input-area {
        padding: 16px 20px !important;
        border-top: 1px solid #eee !important;
        background: white !important;
      }
      
      .lyzr-widget-input-container {
        display: flex !important;
        align-items: flex-end !important;
        gap: 8px !important;
        background: #f9fafb !important;
        border: 2px solid #e5e7eb !important;
        border-radius: 20px !important;
        padding: 8px 16px !important;
      }
      
      .lyzr-widget-input {
        flex: 1 !important;
        border: none !important;
        outline: none !important;
        background: transparent !important;
        font-size: 14px !important;
        min-height: 20px !important;
        max-height: 80px !important;
        resize: none !important;
        font-family: inherit !important;
        color: #374151 !important;
        line-height: 1.4 !important;
      }
      
      .lyzr-widget-input::placeholder {
        color: #9ca3af !important;
      }
      
      .lyzr-send-button {
        background: ${this.config.primaryColor} !important;
        border: none !important;
        border-radius: 50% !important;
        width: 32px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        color: white !important;
        font-size: 16px !important;
        flex-shrink: 0 !important;
      }
      
      .lyzr-send-button:hover {
        background: #2563eb !important;
      }
      
      .lyzr-send-button:disabled {
        background: #d1d5db !important;
        cursor: not-allowed !important;
      }
      
      .lyzr-message {
        margin: 10px 0 !important;
        padding: 10px 14px !important;
        border-radius: 18px !important;
        max-width: 80% !important;
        word-wrap: break-word !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        clear: both !important;
      }
      
      .lyzr-message.user {
        background: ${this.config.primaryColor} !important;
        color: white !important;
        margin-left: auto !important;
        border-bottom-right-radius: 4px !important;
        float: right !important;
      }
      
      .lyzr-message.bot {
        background: white !important;
        border: 1px solid #e5e7eb !important;
        color: #374151 !important;
        border-bottom-left-radius: 4px !important;
        float: left !important;
      }
      
      .lyzr-message.system {
        background: #fef3c7 !important;
        color: #92400e !important;
        border: 1px solid #fbbf24 !important;
        font-style: italic !important;
        text-align: center !important;
        float: none !important;
        margin: 10px auto !important;
      }
      
      .lyzr-typing {
        background: white !important;
        border: 1px solid #e5e7eb !important;
        color: #9ca3af !important;
        border-bottom-left-radius: 4px !important;
        float: left !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 15px 20px !important;
        min-width: 60px !important;
      }
      
      /* Typing Dots Animation */
      .lyzr-typing-dots {
        display: flex !important;
        gap: 4px !important;
        align-items: center !important;
      }
      
      .lyzr-typing-dot {
        width: 8px !important;
        height: 8px !important;
        border-radius: 50% !important;
        animation: lyzr-typing-bounce 1.4s infinite ease-in-out !important;
      }
      
      .lyzr-typing-dot:nth-child(1) {
        background: #3b82f6 !important;
        animation-delay: -0.32s !important;
      }
      
      .lyzr-typing-dot:nth-child(2) {
        background: #10b981 !important;
        animation-delay: -0.16s !important;
      }
      
      .lyzr-typing-dot:nth-child(3) {
        background: #f59e0b !important;
        animation-delay: 0s !important;
      }
      
      @keyframes lyzr-typing-bounce {
        0%, 80%, 100% {
          transform: scale(0.8) !important;
          opacity: 0.5 !important;
        }
        40% {
          transform: scale(1.2) !important;
          opacity: 1 !important;
        }
      }
      
      .lyzr-clear {
        clear: both !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .lyzr-welcome {
        background: #f0f9ff !important;
        border: 1px solid #bfdbfe !important;
        border-radius: 8px !important;
        padding: 16px !important;
        margin-bottom: 16px !important;
        text-align: center !important;
        color: #1e40af !important;
      }
      
      .lyzr-test-btn {
        background: rgba(255,255,255,0.2) !important;
        border: none !important;
        border-radius: 4px !important;
        color: white !important;
        padding: 4px 8px !important;
        font-size: 12px !important;
        cursor: pointer !important;
        margin-left: 10px !important;
      }
      
      .lyzr-test-btn:hover {
        background: rgba(255,255,255,0.3) !important;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  createBubble() {
    this.bubble = document.createElement('div');
    this.bubble.className = 'lyzr-widget-bubble';
    this.bubble.innerHTML = '💬';
    this.bubble.title = 'Open Chat';
    
    document.body.appendChild(this.bubble);
    console.log('✅ Chat bubble created');
  }
  
  createChatWindow() {
    this.container = document.createElement('div');
    this.container.className = 'lyzr-widget-container';
    
    this.container.innerHTML = `
      <div class="lyzr-widget-header">
        <div>
          <div>${this.config.title}</div>
          <div style="font-size: 12px; opacity: 0.8;">${this.config.subtitle}</div>
        </div>
        <div>
          <button class="lyzr-test-btn" data-action="test">🧪</button>
          <button class="lyzr-widget-close" data-action="close">✕</button>
        </div>
      </div>
      
      <div class="lyzr-widget-messages">
        <div class="lyzr-welcome">
          <strong>${this.config.title}</strong><br>
          ${this.config.welcomeMessage}
        </div>
      </div>
      
      <div class="lyzr-widget-input-area">
        <div class="lyzr-widget-input-container">
          <textarea 
            class="lyzr-widget-input" 
            placeholder="${this.config.placeholder}"
            rows="1"
          ></textarea>
          <button class="lyzr-send-button" data-action="send">➤</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.container);
    
    // Get references to elements
    this.messagesContainer = this.container.querySelector('.lyzr-widget-messages');
    this.input = this.container.querySelector('.lyzr-widget-input');
    this.sendButton = this.container.querySelector('.lyzr-send-button');
    
    console.log('✅ Chat window created');
  }
  
  setupEventListeners() {
    console.log('🔗 Setting up event listeners...');
    
    // Bubble click
    this.bubble.addEventListener('click', () => {
      console.log('🖱️ Bubble clicked');
      this.toggleChat();
    });
    
    // Container clicks (event delegation)
    this.container.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action');
      
      if (action === 'close') {
        console.log('🖱️ Close button clicked');
        this.closeChat();
      } else if (action === 'send') {
        console.log('🖱️ Send button clicked');
        e.preventDefault();
        this.handleSendMessage();
      } else if (action === 'test') {
        console.log('🖱️ Test button clicked');
        e.preventDefault();
        this.testConnection();
      }
    });
    
    // Input events
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        console.log('⌨️ Enter pressed');
        e.preventDefault();
        this.handleSendMessage();
      }
    });
    
    this.input.addEventListener('input', () => {
      this.autoResizeInput();
    });
    
    console.log('✅ Event listeners set up');
  }
  
  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }
  
  openChat() {
    console.log('📖 Opening chat');
    this.isOpen = true;
    this.container.classList.add('open');
    this.bubble.innerHTML = '✕';
    this.bubble.title = 'Close Chat';
    
    // Focus input after a short delay
    setTimeout(() => {
      this.input.focus();
    }, 100);
  }
  
  closeChat() {
    console.log('📕 Closing chat');
    this.isOpen = false;
    this.container.classList.remove('open');
    this.bubble.innerHTML = '💬';
    this.bubble.title = 'Open Chat';
  }
  
  handleSendMessage() {
    const message = this.input.value.trim();
    
    if (!message) {
      console.log('❌ No message to send');
      return;
    }
    
    if (this.isTyping) {
      console.log('❌ Already sending message');
      return;
    }
    
    console.log('📤 Sending message:', message);
    
    // Clear input
    this.input.value = '';
    this.autoResizeInput();
    
    // Add user message
    this.addMessage(message, 'user');
    
    // Send to API
    this.sendToAPI(message);
  }
  
  async sendToAPI(message) {
    this.isTyping = true;
    this.sendButton.disabled = true;
    
    // Show typing indicator with animated dots
    this.addTypingIndicator();
    
    try {
      console.log('🌐 Calling API...');
      
      const response = await fetch(`${this.config.apiUrl}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: this.config.agentId,
          message: message,
          sessionId: this.sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📨 API Response:', data);
      
      // Remove typing indicator
      this.removeTypingIndicator();
      
      // Add bot response
      let botMessage = 'Sorry, I couldn\'t process that request.';
      
      if (data.success && data.data && data.data.message) {
        botMessage = data.data.message;
      } else if (data.response) {
        botMessage = data.response;
      }
      
      this.addMessage(botMessage, 'bot');
      
    } catch (error) {
      console.error('❌ API Error:', error);
      this.removeTypingIndicator();
      this.addMessage('Sorry, I\'m having trouble connecting. Please try again.', 'bot');
    } finally {
      this.isTyping = false;
      this.sendButton.disabled = false;
    }
  }

  
  async testConnection() {
    console.log('🧪 Testing connection...');
    this.addMessage('Testing API connection...', 'system');
    
    try {
      const testMessage = 'Hello, this is a test message';
      await this.sendToAPI(testMessage);
    } catch (error) {
      this.addMessage(`Test failed: ${error.message}`, 'system');
    }
  }
  
addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `lyzr-message ${type}`;
    messageDiv.textContent = text;
    
    this.messagesContainer.appendChild(messageDiv);
    
    // Add clear div for floating elements
    const clearDiv = document.createElement('div');
    clearDiv.className = 'lyzr-clear';
    this.messagesContainer.appendChild(clearDiv);
    
    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    
    console.log(`💬 Added ${type} message: ${text.substring(0, 50)}...`);
  }
  
  addTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'lyzr-message lyzr-typing';
    messageDiv.id = 'lyzr-typing-indicator';
    
    // Create animated dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'lyzr-typing-dots';
    
    // Create 3 colored dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'lyzr-typing-dot';
      dotsContainer.appendChild(dot);
    }
    
    messageDiv.appendChild(dotsContainer);
    this.messagesContainer.appendChild(messageDiv);
    
    // Add clear div for floating elements
    const clearDiv = document.createElement('div');
    clearDiv.className = 'lyzr-clear';
    this.messagesContainer.appendChild(clearDiv);
    
    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    
    console.log('🎨 Added animated typing indicator');
  }
  
  removeTypingIndicator() {
    const typingIndicator = document.getElementById('lyzr-typing-indicator');
    if (typingIndicator) {
      typingIndicator.nextElementSibling?.remove(); // Remove clear div
      typingIndicator.remove();
      console.log('🗑️ Removed typing indicator');
    }
  }
  
  autoResizeInput() {
    this.input.style.height = 'auto';
    this.input.style.height = Math.min(this.input.scrollHeight, 80) + 'px';
  }
  
  generateSessionId() {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  
  // Public API methods
  open() {
    this.openChat();
  }
  
  close() {
    this.closeChat();
  }
  
  destroy() {
    if (this.bubble) this.bubble.remove();
    if (this.container) this.container.remove();
    const styles = document.getElementById('lyzr-widget-styles');
    if (styles) styles.remove();
  }
}

// Auto-initialize if config is provided
(function() {
  console.log('🔍 Looking for widget configuration...');
  
  let config = {};
  
  // Check for global config first
  if (window.LyzrWidgetConfig) {
    config = window.LyzrWidgetConfig;
    console.log('✅ Found global config:', config);
  } else {
    // Look for widget configuration in script tag
    const scripts = document.getElementsByTagName('script');
    const widgetScript = Array.from(scripts).find(script => 
      script.src && script.src.includes('widget.js')
    );
    
    if (widgetScript) {
      config = {
        agentId: widgetScript.getAttribute('data-agent-id'),
        apiUrl: widgetScript.getAttribute('data-api-url'),
        theme: widgetScript.getAttribute('data-theme'),
        primaryColor: widgetScript.getAttribute('data-primary-color'),
        position: widgetScript.getAttribute('data-position'),
        welcomeMessage: widgetScript.getAttribute('data-welcome-message'),
        placeholder: widgetScript.getAttribute('data-placeholder'),
        title: widgetScript.getAttribute('data-title'),
        subtitle: widgetScript.getAttribute('data-subtitle')
      };
      
      // Remove undefined values
      Object.keys(config).forEach(key => {
        if (config[key] === null || config[key] === undefined) {
          delete config[key];
        }
      });
      
      console.log('✅ Found script tag config:', config);
    }
  }
  
  // Initialize widget when DOM is ready
  if (Object.keys(config).length > 0 && config.agentId) {
    console.log('🚀 Initializing widget with config...');
    
    function initWidget() {
      if (!window.LyzrWidgetInstance) {
        window.LyzrWidgetInstance = new LyzrWidget(config);
        console.log('✅ Widget instance created');
      }
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initWidget);
    } else {
      initWidget();
    }
  } else {
    console.log('❌ No valid configuration found');
  }
})();

// Make LyzrWidget class available globally
window.LyzrWidget = LyzrWidget;
