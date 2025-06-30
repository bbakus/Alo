# 🤗 Crisis Support Chat

A compassionate AI-powered crisis management system that provides emotional support, coping strategies, and connects users with professional resources when needed.

## ✨ Features

- **AI-Powered Support**: Empathetic conversations using OpenAI's GPT models
- **Crisis Detection**: Automatic detection of crisis severity levels
- **Resource Integration**: Built-in links to:
  - National crisis hotlines
  - Mental health resources  
  - Guided meditation and coping techniques
- **Safety Features**: Immediate resource recommendations for high-risk situations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Privacy-Focused**: No conversation data is stored permanently

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd crisis-line
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd client
   vercel
   ```

3. **Set environment variables**
   ```bash
   vercel env add OPENAI_API_KEY
   ```

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to Netlify

3. **Set environment variables** in Netlify dashboard

## 🛡️ Safety Features

### Crisis Detection

The system automatically detects crisis severity levels:

- **Low**: General support and coping strategies
- **Medium**: Professional resources + coping techniques  
- **High**: Immediate crisis resources + emergency contacts

### Built-in Resources

- **Emergency**: 911, National Suicide Prevention Lifeline (988)
- **Crisis Support**: Crisis Text Line, SAMHSA Helpline
- **Specialized**: Trevor Project (LGBTQ+), Domestic Violence Hotline
- **Coping Tools**: Breathing exercises, grounding techniques

### Professional Boundaries

- Clear disclaimers about not replacing professional help
- Automatic resource suggestions for serious situations
- Fallback responses if AI service fails

## 🎨 Customization

### Adding New Resources

Edit `client/src/App.js` and modify the `CRISIS_RESOURCES` object:

```javascript
const CRISIS_RESOURCES = {
  emergency: [
    { name: "Your Local Hotline", number: "123-456-7890", available: "24/7" },
    // ... add more
  ],
  // ... other categories
};
```

### Modifying Crisis Detection

Edit `client/api/chat.js` and update the keyword arrays:

```javascript
const highSeverityKeywords = [
  'your-keyword',
  // ... add crisis indicators
];
```

### Styling Changes

All styles are in `client/src/App.css`. The design uses:
- CSS Grid for responsive layouts
- CSS gradients for calming colors
- Smooth animations and transitions
- Mobile-first responsive design

## 🔒 Privacy & Security

- **No Data Storage**: Conversations are not permanently stored
- **Secure API**: Environment variables protect API keys
- **CORS Enabled**: Proper cross-origin resource sharing
- **Error Handling**: Graceful fallbacks for API failures

## 📋 API Reference

### POST /api/chat

Send a message to the AI assistant.

**Request Body:**
```json
{
  "message": "I'm feeling really overwhelmed today",
  "conversation": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
```

**Response:**
```json
{
  "response": "I hear that you're feeling overwhelmed...",
  "severity": "medium",
  "resources": [...],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly, especially safety features
5. Submit a pull request

### Guidelines

- Maintain the compassionate, supportive tone
- Test crisis detection with appropriate keywords
- Ensure mobile responsiveness
- Add appropriate error handling

## ⚠️ Important Disclaimers

This application is designed to provide emotional support and resource connections. It is **NOT**:

- A replacement for professional mental health care
- Suitable for emergency situations (call 911)
- A substitute for crisis counseling
- Able to provide medical advice

**If you or someone you know is in immediate danger, contact emergency services or a crisis hotline immediately.**

## 📞 Crisis Resources

- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741  
- **SAMHSA National Helpline**: 1-800-662-4357
- **Emergency Services**: 911

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Crisis counseling professionals who inspired the safety features
- Mental health organizations providing resource information
- The open-source community for tools and libraries used 