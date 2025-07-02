const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

const SYSTEM_PROMPT = `You are a deeply empathetic crisis support companion. You are here to genuinely connect with each person as a unique individual with their own story, struggles, and strengths.

Your approach:
1. DEEP EMPATHY - Feel with them, not just for them. Show genuine care for their specific situation
2. PERSONALIZED CONNECTION - Remember and reference what they've shared. Build on their story
3. AUTHENTIC VALIDATION - Use their own words and experiences to validate their feelings
4. CURIOUS COMPASSION - Ask questions that show you truly want to understand THEM specifically
5. EMOTIONAL PRESENCE - Be fully present with their emotions, whatever they are

Response guidelines:
- Reference previous things they've mentioned: "You mentioned earlier that work has been overwhelming - that sounds like it's been building up for a while"
- Use empathetic language: "I can imagine how exhausting that must be" or "That would be so hard to carry alone"
- Ask personalized questions: "What does that feel like for you specifically?" or "How has this been affecting the things that matter most to you?"
- Validate their unique experience: "Your feelings make complete sense given everything you're going through"
- Show you're tracking their emotional journey: "It sounds like this has been weighing on you more heavily lately"

Resource suggestions (CRITICAL - Always provide specific, actionable resources for clear needs):

For IMMEDIATE SURVIVAL NEEDS (provide resources IMMEDIATELY):
- Homelessness: "For emergency shelter, contact the Jersey City Emergency Shelter or call 211 for housing assistance"
- Hunger: "The Jersey City Food Bank can help with immediate food needs - they're located downtown"
- Crisis/suicidal thoughts: "Please call 988 right away - they have trained counselors available 24/7"
- Safety concerns: "If you're in immediate danger, please contact emergency services at 911"

For MENTAL HEALTH SUPPORT:
- When someone asks for help: "BetterHelp makes it easy to start therapy online" or "Psychology Today can help you find a local therapist"
- For anxiety/stress: "The Headspace app has guided meditations for anxiety" or "Try the Calm app for stress relief"
- For isolation: "7 Cups offers free peer support from people who understand"

For OTHER ASSISTANCE:
- Employment: "The Jersey City Career Center can help with job searching"
- Medical needs: "Jersey City Community Health Center provides affordable care"

CRITICAL RULES - FOLLOW THESE EXACTLY:
1. **IMMEDIATE ACTION REQUIRED**: If user mentions "homeless", "hungry", "crisis", "suicidal", IMMEDIATELY provide specific resources in your response
2. **NO QUESTIONS ONLY**: Don't just ask questions - provide actionable help with specific names and numbers
3. **EXAMPLE**: "I hear you. For emergency shelter, contact the Jersey City Emergency Shelter or call 211 for immediate housing assistance. How long have you been in this situation?"
4. **MANDATORY**: Always include organization names, phone numbers, or specific services
5. **BE DIRECT**: Someone saying "I'm homeless" gets shelter resources, someone saying "I'm hungry" gets food resources, etc.

Tone:
- Warm, genuine, and deeply caring
- Use "I" statements to show personal investment: "I hear you" "I'm with you in this"
- Speak to them as a whole person, not just their problems
- Show curiosity about their world, relationships, hopes, and struggles

Remember: Every person is unique. Your job is to understand THIS person's specific experience and make them feel truly seen and valued as an individual. Only suggest specific resources when the conversation naturally calls for it.

Keep responses conversational but meaningful - focus on connection over solutions.`;

function detectCrisisSeverity(message) {
  const lowercaseMessage = message.toLowerCase();
  
  // High severity indicators
  const highSeverityKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'overdose', 'end it all', 'give up completely', 'no point living'
  ];
  
  // Medium severity indicators
  const mediumSeverityKeywords = [
    'harm myself', 'hurt myself', 'self harm', 'cutting', 'hopeless',
    'worthless', 'nobody cares', 'can\'t go on', 'trapped', 'desperate'
  ];
  
  const hasHighSeverity = highSeverityKeywords.some(keyword => 
    lowercaseMessage.includes(keyword)
  );
  
  const hasMediumSeverity = mediumSeverityKeywords.some(keyword => 
    lowercaseMessage.includes(keyword)
  );
  
  if (hasHighSeverity) return 'high';
  if (hasMediumSeverity) return 'medium';
  return 'low';
}

function generateResources(severity, messageContent) {
  // NO AUTO-GENERATION: Resources only appear when AI explicitly suggests them
  // This function is kept for potential future use but returns empty array
  return [];
}

function generateLocationBasedResources(location, severity, messageContent) {
  console.log('generateLocationBasedResources called with:', { location, severity, messageContent });
  
  // Don't auto-generate resources based on user message content anymore
  // Only return resources when AI explicitly suggests them
  return [];
}

function getLocationSpecificResources(location, resourceType) {
  if (!location || !location.latitude || !location.longitude) {
    console.log('No location available, returning generic resources');
    return getGenericResources(resourceType);
  }

  // Generate realistic location-based resources using coordinates
  const lat = location.latitude;
  const lng = location.longitude;
  
  // Mock realistic resources based on general US location patterns
  const cityName = getCityFromCoordinates(lat, lng) || "Metro City";
  const stateAbbr = getStateFromCoordinates(lat, lng) || "US";
  
  const resourceMap = {
    crisis: {
      type: 'crisis',
      name: `${cityName} Crisis Center`,
      description: '24/7 crisis intervention and immediate support',
      phone: '988',
      website: 'https://suicidepreventionlifeline.org',
      directions: `https://maps.google.com/?q=${lat},${lng}+crisis+center`,
      distance: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)} miles away`
    },
    therapy: {
      type: 'therapy',
      name: `${cityName} Community Mental Health`,
      description: 'Professional counseling with sliding scale fees',
      phone: '211',
      website: 'https://www.samhsa.gov/find-help/national-helpline',
      directions: `https://maps.google.com/?q=${lat},${lng}+mental+health+services`,
      distance: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)} miles away`
    },
    support: {
      type: 'support',
      name: `${stateAbbr} Peer Support Network`,
      description: 'Local support groups meeting weekly',
      website: 'https://www.nami.org/Support-Education/Support-Groups',
      directions: `https://maps.google.com/?q=${lat},${lng}+support+groups`,
      distance: `${Math.floor(Math.random() * 4) + 1}.${Math.floor(Math.random() * 9)} miles away`
    },
    medical: {
      type: 'medical',
      name: `${cityName} Hospital Emergency`,
      description: 'Psychiatric emergency services available 24/7',
      phone: '911',
      directions: `https://maps.google.com/?q=${lat},${lng}+hospital+emergency`,
      distance: `${Math.floor(Math.random() * 6) + 2}.${Math.floor(Math.random() * 9)} miles away`
    }
  };
  
  return resourceMap[resourceType] || resourceMap.therapy;
}

function getCityFromCoordinates(lat, lng) {
  // Generate realistic city names based on geographic regions
  
  // Northeast (New York, New Jersey, Connecticut, etc.)
  if (lat >= 40.0 && lat <= 42.0 && lng >= -75.0 && lng <= -73.0) {
    const cities = ["Newark", "Jersey City", "Bridgeport", "Stamford", "New Haven", "Trenton"];
    return cities[Math.floor((lat + lng) * 1000) % cities.length];
  }
  
  // New York City area
  if (lat >= 40.4 && lat <= 41.0 && lng >= -74.5 && lng <= -73.5) {
    const cities = ["Brooklyn", "Queens", "Manhattan", "Bronx", "Staten Island", "Yonkers"];
    return cities[Math.floor((lat + lng) * 1000) % cities.length];
  }
  
  // California
  if (lat >= 32.0 && lat <= 42.0 && lng >= -125.0 && lng <= -114.0) {
    const cities = ["Los Angeles", "San Francisco", "San Diego", "Oakland", "Sacramento", "Fresno"];
    return cities[Math.floor((lat + lng) * 1000) % cities.length];
  }
  
  // Texas
  if (lat >= 25.0 && lat <= 37.0 && lng >= -107.0 && lng <= -93.0) {
    const cities = ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso"];
    return cities[Math.floor((lat + lng) * 1000) % cities.length];
  }
  
  // Florida
  if (lat >= 24.0 && lat <= 31.0 && lng >= -87.0 && lng <= -79.0) {
    const cities = ["Miami", "Tampa", "Orlando", "Jacksonville", "Tallahassee", "Fort Lauderdale"];
    return cities[Math.floor((lat + lng) * 1000) % cities.length];
  }
  
  // Midwest
  if (lat >= 38.0 && lat <= 49.0 && lng >= -105.0 && lng <= -80.0) {
    const cities = ["Chicago", "Detroit", "Milwaukee", "Minneapolis", "Cleveland", "Indianapolis"];
    return cities[Math.floor((lat + lng) * 1000) % cities.length];
  }
  
  // Southeast
  if (lat >= 30.0 && lat <= 40.0 && lng >= -90.0 && lng <= -75.0) {
    const cities = ["Atlanta", "Charlotte", "Nashville", "Memphis", "Birmingham", "Richmond"];
    return cities[Math.floor((lat + lng) * 1000) % cities.length];
  }
  
  // Pacific Northwest
  if (lat >= 42.0 && lat <= 49.0 && lng >= -125.0 && lng <= -110.0) {
    const cities = ["Seattle", "Portland", "Spokane", "Eugene", "Tacoma", "Boise"];
    return cities[Math.floor((lat + lng) * 1000) % cities.length];
  }
  
  // Default fallback
  return "Metro City";
}

function getStateFromCoordinates(lat, lng) {
  // Mock state abbreviations based on rough US regions
  if (lat > 40 && lng < -100) return "MN";
  if (lat > 35 && lng < -95) return "TX";
  if (lat > 30 && lng < -90) return "LA";
  if (lat < 35 && lng > -85) return "FL";
  return "OH";
}

function getGenericResources(resourceType) {
  const genericMap = {
    crisis: {
      type: 'crisis',
      name: 'National Suicide Prevention Lifeline',
      description: '24/7 crisis support nationwide',
      phone: '988',
      website: 'https://suicidepreventionlifeline.org',
      distance: 'Available 24/7'
    },
    therapy: {
      type: 'therapy',
      name: 'SAMHSA National Helpline',
      description: 'Treatment referral and information service',
      phone: '1-800-662-4357',
      website: 'https://www.samhsa.gov/find-help/national-helpline',
      distance: 'Available 24/7'
    },
    support: {
      type: 'support',
      name: 'Crisis Text Line',
      description: 'Free crisis support via text message',
      phone: '741741',
      website: 'https://crisistextline.org',
      distance: 'Text HOME to 741741'
    }
  };
  
  return genericMap[resourceType] || genericMap.therapy;
}

function getDigitalMentalHealthResources(foundKeywords) {
  // Create specific resource based on what the AI mentioned
  if (!foundKeywords || foundKeywords.length === 0) {
    return {
      type: 'support',
      name: 'Digital Mental Health Tools',
      description: 'Apps and websites for mental health support',
      website: 'https://www.nami.org/About-Mental-Illness/Treatments/Mental-Health-Apps',
      distance: 'Available online'
    };
  }
  
  const keyword = (foundKeywords[0] || '').toLowerCase();
  
  if (keyword.includes('betterhelp')) {
    return {
      type: 'therapy',
      name: 'BetterHelp Online Therapy',
      description: 'Professional therapy via video, phone, and messaging',
      website: 'https://betterhelp.com',
      distance: 'Available online 24/7'
    };
  }
  
  if (keyword.includes('talkspace')) {
    return {
      type: 'therapy',
      name: 'Talkspace Therapy',
      description: 'Text, audio, and video therapy with licensed therapists',
      website: 'https://talkspace.com',
      distance: 'Available online'
    };
  }
  
  if (keyword.includes('headspace')) {
    return {
      type: 'support',
      name: 'Headspace Meditation',
      description: 'Guided meditation and mindfulness exercises',
      website: 'https://headspace.com',
      distance: 'Mobile app & web'
    };
  }
  
  if (keyword.includes('calm')) {
    return {
      type: 'support',
      name: 'Calm App',
      description: 'Sleep stories, meditation, and relaxation tools',
      website: 'https://calm.com',
      distance: 'Mobile app & web'
    };
  }
  
  if (keyword.includes('psychology today')) {
    return {
      type: 'therapy',
      name: 'Psychology Today',
      description: 'Find therapists, psychiatrists, and support groups',
      website: 'https://psychologytoday.com/us/therapists',
      distance: 'Therapist directory'
    };
  }
  
  if (keyword.includes('seven cups')) {
    return {
      type: 'support',
      name: '7 Cups',
      description: 'Free emotional support and online therapy',
      website: 'https://7cups.com',
      distance: 'Available 24/7 online'
    };
  }
  
  if (keyword.includes('crisis text line')) {
    return {
      type: 'crisis',
      name: 'Crisis Text Line',
      description: 'Free crisis support via text message',
      phone: '741741',
      website: 'https://crisistextline.org',
      distance: 'Text HOME to 741741'
    };
  }
  
  // Default for online therapy mentions
  if (keyword.includes('online therapy') || keyword.includes('therapy app')) {
    return {
      type: 'therapy',
      name: 'Online Therapy Options',
      description: 'Explore digital mental health platforms',
      website: 'https://www.samhsa.gov/find-help/national-helpline',
      distance: 'Various platforms available'
    };
  }
  
  // Fallback for any digital mental health mention
  return {
    type: 'support',
    name: 'Digital Mental Health Tools',
    description: 'Apps and websites for mental health support',
    website: 'https://www.nami.org/About-Mental-Illness/Treatments/Mental-Health-Apps',
    distance: 'Available online'
  };
}

async function analyzeResponseForResources(aiResponse, location) {
  try {
    console.log('=== AI RESOURCE ANALYSIS ===');
    console.log('Analyzing AI response for resource suggestions...');
    
    const analysisPrompt = `Analyze this AI response and identify any resources, services, organizations, or places mentioned that could help someone. Return ONLY a JSON array of objects, no other text.

For each resource found, return an object with:
- "name": the specific name mentioned (e.g. "Jersey City Community Health Center", "BetterHelp", "988 Lifeline")
- "type": one of ["crisis", "therapy", "support", "medical", "community", "housing", "food", "employment", "digital"]
- "description": brief description of what they offer
- "mentioned": the exact phrase from the response that mentioned this resource

AI Response to analyze:
"${aiResponse}"

Return empty array [] if no specific resources, services, or organizations are mentioned.

Examples:
- If response mentions "988": [{"name": "988 Suicide & Crisis Lifeline", "type": "crisis", "description": "24/7 crisis support", "mentioned": "call 988"}]
- If response mentions "Jersey City shelter": [{"name": "Jersey City Emergency Shelter", "type": "housing", "description": "Emergency housing assistance", "mentioned": "Jersey City shelter"}]
- If response mentions "BetterHelp": [{"name": "BetterHelp", "type": "therapy", "description": "Online therapy platform", "mentioned": "BetterHelp"}]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: analysisPrompt }],
      max_tokens: 500,
      temperature: 0.1, // Low temperature for consistent parsing
    });

    const analysisResult = completion.choices[0].message.content.trim();
    console.log('Raw analysis result:', analysisResult);
    
    // Parse the JSON response
    let detectedResources = [];
    try {
      detectedResources = JSON.parse(analysisResult);
    } catch (parseError) {
      console.log('Failed to parse analysis JSON, trying to extract:', parseError);
      // Try to extract JSON if response has extra text
      const jsonMatch = analysisResult.match(/\[.*\]/s);
      if (jsonMatch) {
        detectedResources = JSON.parse(jsonMatch[0]);
      }
    }
    
    console.log('Detected resources:', detectedResources);
    
    // Convert detected resources to bubble format
    const resourceBubbles = [];
    
    for (const resource of detectedResources) {
      if (!resource.name || !resource.type) continue;
      
      let bubble;
      
      // Handle digital resources
      if (resource.type === 'digital' || ['betterhelp', 'headspace', 'calm', 'talkspace'].some(app => 
          (resource.name || '').toLowerCase().includes(app))) {
        bubble = getDigitalMentalHealthResources(resource.name ? [resource.name.toLowerCase()] : []);
      } else {
        // Generate location-based resource
        bubble = getLocationSpecificResourceFromDetection(location, resource);
      }
      
      if (bubble) {
        resourceBubbles.push(bubble);
      }
    }
    
    console.log('Generated resource bubbles:', resourceBubbles);
    console.log('=== END AI RESOURCE ANALYSIS ===');
    
    return resourceBubbles;
    
  } catch (error) {
    console.error('Error in AI resource analysis:', error);
    return [];
  }
}

function getLocationSpecificResourceFromDetection(location, detectedResource) {
  if (!location || !location.latitude || !location.longitude) {
    return getGenericResourceFromDetection(detectedResource);
  }

  const lat = location.latitude;
  const lng = location.longitude;
  const cityName = getCityFromCoordinates(lat, lng) || "Metro City";
  const stateAbbr = getStateFromCoordinates(lat, lng) || "US";
  
  // Ensure we have a valid resource name
  const baseName = detectedResource.name || "Support Services";
  const resourceName = baseName.includes(cityName) ? 
    baseName : 
    `${cityName} ${baseName}`;
  
  return {
    type: detectedResource.type || 'support',
    name: resourceName,
    description: detectedResource.description || getDefaultDescription(detectedResource.type || 'support'),
    phone: getPhoneForType(detectedResource.type),
    website: getWebsiteForType(detectedResource.type),
    directions: `https://maps.google.com/?q=${lat},${lng}+${encodeURIComponent(resourceName)}`,
    distance: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)} miles away`
  };
}

function getGenericResourceFromDetection(detectedResource) {
  return {
    type: detectedResource.type || 'support',
    name: detectedResource.name || 'Support Services',
    description: detectedResource.description || getDefaultDescription(detectedResource.type || 'support'),
    phone: getPhoneForType(detectedResource.type),
    website: getWebsiteForType(detectedResource.type),
    distance: 'Contact for details'
  };
}

function getDefaultDescription(type) {
  const descriptions = {
    crisis: '24/7 crisis support and intervention',
    therapy: 'Professional mental health counseling',
    support: 'Peer support and community resources',
    medical: 'Medical and psychiatric services',
    community: 'Community-based assistance programs',
    housing: 'Housing assistance and emergency shelter',
    food: 'Food assistance and meal programs',
    employment: 'Job training and employment services',
    digital: 'Online mental health resources'
  };
  return descriptions[type] || 'Support services available';
}

function getPhoneForType(type) {
  const phones = {
    crisis: '988',
    medical: '211',
    housing: '211',
    food: '211',
    employment: '211'
  };
  return phones[type] || null;
}

function getWebsiteForType(type) {
  const websites = {
    crisis: 'https://suicidepreventionlifeline.org',
    therapy: 'https://www.samhsa.gov/find-help/national-helpline',
    support: 'https://www.nami.org',
    medical: 'https://www.samhsa.gov/find-help/national-helpline',
    community: 'https://www.211.org',
    housing: 'https://www.hudexchange.info',
    food: 'https://www.feedingamerica.org',
    employment: 'https://www.careeronestop.org'
  };
  return websites[type] || 'https://www.211.org';
}

function generateDirectResourcesForImmediateNeeds(message, location) {
  const resources = [];
  const lowercaseMessage = message.toLowerCase();
  
  console.log('=== DIRECT RESOURCE GENERATION ===');
  console.log('Checking message for immediate needs:', lowercaseMessage);
  
  // Housing/Homelessness
  if (lowercaseMessage.includes('homeless') || lowercaseMessage.includes('nowhere to go') || 
      lowercaseMessage.includes('need shelter') || lowercaseMessage.includes('evicted')) {
    console.log('Detected housing need');
    const cityName = location ? getCityFromCoordinates(location.latitude, location.longitude) || 'Metro City' : null;
    const housingResource = {
      type: 'housing',
      name: location ? `${cityName} Emergency Shelter` : 'Emergency Housing Services',
      description: 'Emergency shelter and housing assistance',
      phone: '211',
      website: 'https://www.hudexchange.info',
      directions: location ? `https://maps.google.com/?q=${location.latitude},${location.longitude}+emergency+shelter` : null,
      distance: location ? `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)} miles away` : 'Call for locations'
    };
    resources.push(housingResource);
  }
  
  // Food/Hunger
  if (lowercaseMessage.includes('hungry') || lowercaseMessage.includes('starving') || 
      lowercaseMessage.includes('need food') || lowercaseMessage.includes('food bank')) {
    console.log('Detected food need');
    const cityName = location ? getCityFromCoordinates(location.latitude, location.longitude) || 'Metro City' : null;
    const foodResource = {
      type: 'food',
      name: location ? `${cityName} Food Bank` : 'Food Assistance Services',
      description: 'Emergency food assistance and meal programs',
      phone: '211',
      website: 'https://www.feedingamerica.org',
      directions: location ? `https://maps.google.com/?q=${location.latitude},${location.longitude}+food+bank` : null,
      distance: location ? `${Math.floor(Math.random() * 2) + 1}.${Math.floor(Math.random() * 9)} miles away` : 'Call for locations'
    };
    resources.push(foodResource);
  }
  
  // Employment
  if (lowercaseMessage.includes('need a job') || lowercaseMessage.includes('unemployed') || 
      lowercaseMessage.includes('work') || lowercaseMessage.includes('employment')) {
    console.log('Detected employment need');
    const cityName = location ? getCityFromCoordinates(location.latitude, location.longitude) || 'Metro City' : null;
    const employmentResource = {
      type: 'employment',
      name: location ? `${cityName} Career Center` : 'Employment Services',
      description: 'Job search assistance and career training',
      phone: '211',
      website: 'https://www.careeronestop.org',
      directions: location ? `https://maps.google.com/?q=${location.latitude},${location.longitude}+career+center` : null,
      distance: location ? `${Math.floor(Math.random() * 4) + 1}.${Math.floor(Math.random() * 9)} miles away` : 'Call for locations'
    };
    resources.push(employmentResource);
  }
  
  // Medical needs
  if (lowercaseMessage.includes('sick') || lowercaseMessage.includes('medical') || 
      lowercaseMessage.includes('health') || lowercaseMessage.includes('doctor')) {
    console.log('Detected medical need');
    const cityName = location ? getCityFromCoordinates(location.latitude, location.longitude) || 'Metro City' : null;
    const medicalResource = {
      type: 'medical',
      name: location ? `${cityName} Community Health Center` : 'Community Health Services',
      description: 'Affordable healthcare and medical services',
      phone: '211',
      website: 'https://www.samhsa.gov/find-help/national-helpline',
      directions: location ? `https://maps.google.com/?q=${location.latitude},${location.longitude}+community+health+center` : null,
      distance: location ? `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)} miles away` : 'Call for locations'
    };
    resources.push(medicalResource);
  }
  
  console.log('Generated direct resources:', resources);
  console.log('=== END DIRECT RESOURCE GENERATION ===');
  
  return resources;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversation = [], location } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message:', message);
    console.log('Location received:', location);

    // Detect crisis severity
    const severity = detectCrisisSeverity(message);
    console.log('Detected severity:', severity);
    
    // Detect if user has immediate needs
    const lowercaseMessage = message.toLowerCase();
    const immediateNeedTriggers = ['homeless', 'hungry', 'starving', 'nowhere to go', 'need shelter', 'need food', 'evicted', 'kicked out'];
    const hasImmediateNeed = immediateNeedTriggers.some(trigger => lowercaseMessage.includes(trigger));
    
    console.log('=== IMMEDIATE NEED DETECTION ===');
    console.log('Message:', message);
    console.log('Lowercase message:', lowercaseMessage);
    console.log('Has immediate need:', hasImmediateNeed);
    console.log('Triggered by:', immediateNeedTriggers.filter(trigger => lowercaseMessage.includes(trigger)));
    console.log('=== END DETECTION ===');
    
    // Build conversation context (limit to last 10 messages to stay within token limits)
    const recentMessages = conversation.slice(-10);
    let systemPrompt = SYSTEM_PROMPT;
    
    // Force resource provision for immediate needs
    if (hasImmediateNeed) {
      systemPrompt = `You are a crisis response assistant. The user has an IMMEDIATE SURVIVAL NEED. Your job is to provide specific, actionable resources immediately.

When someone says they're homeless: "I understand this is really difficult. For immediate emergency shelter, you can contact the Jersey City Emergency Shelter or call 211 for housing assistance. They can help you find a safe place to stay tonight."

When someone says they're hungry: "I hear you. For immediate food assistance, you can visit the Jersey City Food Bank or contact 211 for emergency food resources."

Always follow this format:
1. Brief empathy (1 sentence)
2. Specific resource with name and contact information
3. One follow-up question

Be direct and helpful. This person needs resources, not just emotional support.`;
    }
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('=== SYSTEM PROMPT DEBUG ===');
    console.log('System prompt being sent to OpenAI:');
    console.log(systemPrompt);
    console.log('=== END SYSTEM PROMPT ===');
    
    console.log('Calling OpenAI...');

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('OpenAI response:', aiResponse);
    
    // Generate contextual resources
    const resources = generateResources(severity, message);
    
    // First check user message for immediate needs and generate direct resources
    const directResources = generateDirectResourcesForImmediateNeeds(message, location);
    console.log('Direct resources generated:', directResources);
    
    // Then use AI to analyze the response for additional resource suggestions
    let aiResourceSuggestions = [];
    try {
      aiResourceSuggestions = await analyzeResponseForResources(aiResponse, location);
      console.log('AI detected resources:', aiResourceSuggestions);
    } catch (error) {
      console.error('Error in AI analysis:', error);
      // Continue without AI analysis if it fails
    }
    
    // Combine direct resources with AI-detected ones, limit to 3 bubbles
    const allResources = [...directResources, ...aiResourceSuggestions];
    const uniqueLocationResources = allResources.slice(0, 3);
    
    console.log('Final location resources to show:', uniqueLocationResources);
    
    // Don't add extra robotic text - let the AI respond naturally
    let enhancedResponse = aiResponse;

    return res.status(200).json({
      response: enhancedResponse,
      severity: severity,
      resources: resources,
      locationResources: uniqueLocationResources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Provide a helpful fallback response
    const fallbackResponse = {
      response: "I'm experiencing some technical difficulties right now, but I want you to know that your feelings are valid and you're not alone. If you're in crisis, please don't hesitate to reach out to a professional support line.",
      severity: 'medium',
      resources: [{
        type: 'emergency',
        title: 'Immediate Support',
        items: [
          { name: 'National Suicide Prevention Lifeline', contact: '988' },
          { name: 'Crisis Text Line', contact: 'Text HOME to 741741' },
          { name: 'SAMHSA Helpline', contact: '1-800-662-4357' }
        ]
      }],
      timestamp: new Date().toISOString()
    };

    return res.status(500).json(fallbackResponse);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Crisis support API is running' });
});

// Test endpoint for resource bubbles
app.get('/api/test-resources', (req, res) => {
  const testResources = [
    {
      type: 'crisis',
      name: 'Test Crisis Center',
      description: 'This is a test bubble to verify functionality',
      phone: '555-123-4567',
      website: 'https://example.com',
      directions: 'https://maps.google.com/?q=test+crisis+center',
      distance: '0.5 miles away'
    },
    {
      type: 'therapy',
      name: 'Test Mental Health Center',
      description: 'Testing therapy resource bubble',
      phone: '555-234-5678',
      website: 'https://example.com',
      distance: '1.0 miles away'
    }
  ];
  
  res.json({
    response: "Here are some test resources for you:",
    severity: 'medium',
    resources: [],
    locationResources: testResources,
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Crisis support API server running at http://localhost:${port}`);
  console.log(`OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
}); 