import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// API base URL - use relative path in production, localhost in development
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

const CRISIS_RESOURCES = {
  emergency: [
    { name: "National Suicide Prevention Lifeline", number: "988", available: "24/7" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", available: "24/7" },
    { name: "Emergency Services", number: "911", available: "24/7" },
  ],
  support: [
    { name: "SAMHSA National Helpline", number: "1-800-662-4357", available: "24/7" },
    { name: "National Domestic Violence Hotline", number: "1-800-799-7233", available: "24/7" },
    { name: "Trevor Project (LGBTQ+)", number: "1-866-488-7386", available: "24/7" },
  ],
  meditation: [
    { name: "Breathing Exercise", action: "breathe" },
    { name: "Grounding Technique", action: "ground" },
    { name: "Progressive Muscle Relaxation", action: "relax" },
  ]
};

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showMeditation, setShowMeditation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [resourceBubbles, setResourceBubbles] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const bubbleTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user's location on app load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or failed:', error);
          // Still work without location
        }
      );
    }
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Keep focus on input after sending
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversation: messages,
          location: userLocation
        }),
      });

      const data = await response.json();
      console.log('Received API response:', data);
      
      // Calculate realistic typing delay based on response length
      const responseLength = data.response.length;
      const wordsPerMinute = 60; // Realistic human typing speed
      const charactersPerMinute = wordsPerMinute * 5; // Average 5 characters per word
      const typingTimeMs = (responseLength / charactersPerMinute) * 60 * 1000;
      
      // Set minimum 1 second, maximum 4 seconds for good UX
      const delay = Math.min(Math.max(typingTimeMs, 1000), 4000);
      
      console.log(`AI response length: ${responseLength} chars, typing delay: ${Math.round(delay)}ms`);
      
      // Simulate typing time
      setTimeout(() => {
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          resources: data.resources || [],
          severity: data.severity || 'low',
          locationResources: data.locationResources || []
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        
        // Show location-based resource bubbles if available - but don't clear existing ones
        console.log('=== FRONTEND RESOURCE PROCESSING ===');
        console.log('Full API response:', data);
        console.log('Location resources from API:', data.locationResources);
        console.log('Location resources length:', data.locationResources ? data.locationResources.length : 0);
        
        if (data.locationResources && data.locationResources.length > 0) {
          console.log('✅ ADDING NEW RESOURCE BUBBLES:', data.locationResources);
          // Add new resources to existing ones, avoid duplicates
          setResourceBubbles(prev => {
            const existingTypes = prev.map(r => r.type + r.name);
            const newResources = data.locationResources.filter(r => 
              !existingTypes.includes(r.type + r.name)
            );
            return [...prev, ...newResources];
          });
          // Clear existing timer and set new auto-hide timer (10 seconds)
          if (bubbleTimerRef.current) {
            clearTimeout(bubbleTimerRef.current);
          }
          bubbleTimerRef.current = setTimeout(() => setResourceBubbles([]), 10000);
        } else {
          console.log('❌ NO NEW LOCATION RESOURCES - KEEPING EXISTING BUBBLES');
          // Don't clear existing bubbles just because this message didn't generate new ones
        }
        console.log('=== END FRONTEND PROCESSING ===');
        
        // Show resources if high severity detected
        if (data.severity === 'high') {
          setShowResources(true);
        }
        
        // Ensure focus returns to input after response
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }, delay);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please consider reaching out to a crisis helpline if you need immediate support.",
        timestamp: new Date(),
        resources: CRISIS_RESOURCES.emergency
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      
      // Ensure focus returns to input after error
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Function to keep bubbles visible when user interacts with them
  const keepBubblesVisible = () => {
    if (bubbleTimerRef.current) {
      clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = null;
    }
  };

  const ResourceBubble = ({ resource, index }) => (
    <div 
      className={`resource-bubble ${resource.type}`}
      style={{
        animationDelay: `${index * 0.2}s`
      }}
    >
      <div className="bubble-icon">
        {resource.type === 'crisis' && '🆘'}
        {resource.type === 'therapy' && '🧠'}
        {resource.type === 'support' && '🤝'}
        {resource.type === 'medical' && '🏥'}
        {resource.type === 'community' && '🏘️'}
        {resource.type === 'housing' && '🏠'}
        {resource.type === 'food' && '🍽️'}
        {resource.type === 'employment' && '💼'}
        {resource.type === 'digital' && '💻'}
      </div>
      <div className="bubble-content">
        <h4>{resource.name}</h4>
        <p>{resource.description}</p>
        <div className="bubble-actions">
          {resource.phone && (
            <a 
              href={`tel:${resource.phone}`} 
              className="bubble-action call"
              onClick={keepBubblesVisible}
            >
              📞 Call
            </a>
          )}
          {resource.website && (
            <a 
              href={resource.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bubble-action visit"
              onClick={keepBubblesVisible}
            >
              🌐 Visit
            </a>
          )}
          {resource.directions && (
            <a 
              href={resource.directions} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bubble-action directions"
              onClick={keepBubblesVisible}
            >
              📍 Directions
            </a>
          )}
        </div>
        <span className="bubble-distance">{resource.distance}</span>
      </div>
      <button 
        className="bubble-close"
        onClick={() => setResourceBubbles(prev => prev.filter((_, i) => i !== index))}
      >
        ×
      </button>
    </div>
  );

  const ResourceItem = ({ resource, type }) => (
    <div className="resource-item">
      <h4>{resource.name}</h4>
      {resource.available && <span className="availability">{resource.available}</span>}
      {resource.number && (
        <a href={`tel:${resource.number.replace(/\D/g, '')}`} className="resource-link">
          📞 {resource.number}
        </a>
      )}
      {resource.action && (
        <button 
          onClick={() => setShowMeditation(resource.action)}
          className="resource-button"
        >
          🧘 Start {resource.name}
        </button>
      )}
    </div>
  );

  const MeditationGuide = ({ type }) => {
    const guides = {
      breathe: {
        title: "4-7-8 Breathing Exercise",
        steps: [
          "Sit comfortably and close your eyes",
          "Inhale through your nose for 4 counts",
          "Hold your breath for 7 counts", 
          "Exhale through your mouth for 8 counts",
          "Repeat 3-4 times"
        ]
      },
      ground: {
        title: "5-4-3-2-1 Grounding Technique",
        steps: [
          "Name 5 things you can see",
          "Name 4 things you can touch",
          "Name 3 things you can hear",
          "Name 2 things you can smell",
          "Name 1 thing you can taste"
        ]
      },
      relax: {
        title: "Progressive Muscle Relaxation",
        steps: [
          "Start with your toes - tense for 5 seconds, then relax",
          "Move to your calves - tense and relax",
          "Continue with thighs, stomach, arms, shoulders",
          "Finally, scrunch your face muscles, then relax",
          "Take deep breaths and notice the relaxation"
        ]
      }
    };

    const guide = guides[type];
    
    return (
      <div className="meditation-overlay">
        <div className="meditation-content">
          <h3>{guide.title}</h3>
          <ol>
            {guide.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <button onClick={() => setShowMeditation(null)}>Close</button>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {/* ALO Title */}
      <div className="app-title">
        <img src="/title/ALO.png" alt="ALO" className="app-title-image" />
      </div>
      
      <div className="chat-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h1>hello, how are you feeling?</h1>
          </div>
        )}

        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">
                <p>{message.content}</p>
                {message.severity === 'high' && (
                  <div className="crisis-alert">
                    <p>⚠️ I'm concerned about you. Please consider reaching out to professional support:</p>
                    <div className="crisis-resources">
                      {CRISIS_RESOURCES.emergency.map((resource, i) => (
                        <a key={i} href={`tel:${resource.number.replace(/\D/g, '')}`} className="crisis-link">
                          {resource.name}: {resource.number}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            disabled={isLoading}
            rows="2"
            autoFocus
          />
          <button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
            Send
          </button>
        </div>
      </div>

      {/* Location-based Resource Bubbles */}
      {resourceBubbles.length > 0 && (
        <div className="resource-bubbles-container">
          {console.log('Rendering resource bubbles:', resourceBubbles)}
          {resourceBubbles.map((resource, index) => (
            <ResourceBubble key={index} resource={resource} index={index} />
          ))}
        </div>
      )}

      <button 
        onClick={() => setShowResources(!showResources)}
        className="resources-toggle"
      >
        {showResources ? 'Hide' : 'Resources'}
      </button>

      {/* Test button for resource bubbles */}
      <button 
        onClick={async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/test-resources`);
            const data = await response.json();
            console.log('Test resource response:', data);
            if (data.locationResources) {
              setResourceBubbles(data.locationResources);
              // Clear existing timer and set new auto-hide timer for test bubbles
              if (bubbleTimerRef.current) {
                clearTimeout(bubbleTimerRef.current);
              }
              bubbleTimerRef.current = setTimeout(() => setResourceBubbles([]), 10000);
            }
          } catch (error) {
            console.error('Test resource error:', error);
          }
        }}
        className="test-button"
      >
        Test Bubbles
      </button>

      {showResources && (
        <>
          <div className="resources-overlay" onClick={() => setShowResources(false)} />
          <div className="resources-panel">
            <div className="resources-section">
              <h3>🚨 Emergency Support</h3>
              {CRISIS_RESOURCES.emergency.map((resource, index) => (
                <ResourceItem key={index} resource={resource} type="emergency" />
              ))}
            </div>
            
            <div className="resources-section">
              <h3>💬 Support Lines</h3>
              {CRISIS_RESOURCES.support.map((resource, index) => (
                <ResourceItem key={index} resource={resource} type="support" />
              ))}
            </div>
            
            <div className="resources-section">
              <h3>🧘 Coping Techniques</h3>
              {CRISIS_RESOURCES.meditation.map((resource, index) => (
                <ResourceItem key={index} resource={resource} type="meditation" />
              ))}
            </div>
          </div>
        </>
      )}

      <footer className="app-footer">
        ⚠️ This is not a replacement for professional help. In emergencies, call 911.
      </footer>

      {showMeditation && <MeditationGuide type={showMeditation} />}
    </div>
  );
}

export default App;
