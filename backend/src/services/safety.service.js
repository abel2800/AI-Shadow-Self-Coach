// Safety service for risk detection
// In production, this would use a trained safety classifier model

/**
 * Check risk level of user message
 * MVP: Simple keyword-based detection
 * Post-MVP: Use trained BERT-based safety classifier
 */
async function checkRisk(message) {
  const lowerMessage = message.toLowerCase();

  // High-risk keywords (suicidal ideation, self-harm)
  const highRiskPatterns = [
    'kill myself',
    'end my life',
    'suicide',
    'want to die',
    'hurt myself',
    'cut myself',
    'self harm',
    'no reason to live'
  ];

  // Medium-risk keywords
  const mediumRiskPatterns = [
    'hopeless',
    'no point',
    'give up',
    'can\'t go on',
    'nothing matters'
  ];

  // Check for high-risk
  for (const pattern of highRiskPatterns) {
    if (lowerMessage.includes(pattern)) {
      return {
        risk_level: 'high',
        confidence: 0.95,
        category: 'suicidal_ideation',
        urgency: 'immediate'
      };
    }
  }

  // Check for medium-risk
  for (const pattern of mediumRiskPatterns) {
    if (lowerMessage.includes(pattern)) {
      return {
        risk_level: 'medium',
        confidence: 0.75,
        category: 'distress',
        urgency: 'moderate'
      };
    }
  }

  // Check for negative sentiment
  const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'scared', 'afraid'];
  const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
  
  if (negativeCount >= 2) {
    return {
      risk_level: 'low',
      confidence: 0.6,
      category: 'negative_sentiment',
      urgency: 'low'
    };
  }

  return {
    risk_level: 'none',
    confidence: 0.9,
    category: 'safe',
    urgency: 'none'
  };
}

module.exports = {
  checkRisk
};

