const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data generators
const formations = [
  '4-4-2',
  '4-3-3',
  '3-5-2',
  '4-2-3-1',
  '3-4-3',
  '5-3-2',
  '4-1-4-1',
  '3-6-1'
];

const pressingTypes = [
  'pressing haut',
  'pressing moyen',
  'pressing bas',
  'pressing par zones',
  'pressing manuel'
];

const tacticalStyles = [
  'possession',
  'contre-attaque',
  'jeu direct',
  'pressing agressif',
  'jeu de transition',
  'domination aérienne',
  'jeu de passes courtes',
  'jeu de passes longues'
];

const expertComments = [
  'L\'équipe utilise une formation équilibrée avec un pressing efficace.',
  'Formation offensive détectée avec un pressing haut et agressif.',
  'L\'équipe privilégie la possession de balle avec un pressing par zones.',
  'Formation défensive avec un pressing bas et jeu de contre-attaque.',
  'L\'équipe utilise un pressing manuel avec une formation flexible.',
  'Formation moderne avec un pressing intense et jeu de transition rapide.',
  'L\'équipe privilégie le jeu direct avec un pressing moyen.',
  'Formation tactique avec un pressing coordonné et jeu de passes courtes.'
];

// Generate random player numbers (1-23 for football)
function generatePlayerNumbers() {
  const players = [];
  const numPlayers = Math.floor(Math.random() * 5) + 8; // 8-12 players
  for (let i = 0; i < numPlayers; i++) {
    players.push(Math.floor(Math.random() * 23) + 1);
  }
  return [...new Set(players)].sort((a, b) => a - b); // Remove duplicates and sort
}

// Generate mock AI response
function generateMockAIResponse(videoPath) {
  const formation = formations[Math.floor(Math.random() * formations.length)];
  const pressing = pressingTypes[Math.floor(Math.random() * pressingTypes.length)];
  const style = tacticalStyles[Math.floor(Math.random() * tacticalStyles.length)];
  const confidence = (Math.random() * 0.3) + 0.7; // 70-100% confidence
  const comment = expertComments[Math.floor(Math.random() * expertComments.length)];
  
  return {
    prediction_ia: `Formation ${formation} détectée avec ${pressing}`,
    confiance: parseFloat(confidence.toFixed(2)),
    joueurs_detectes: generatePlayerNumbers(),
    commentaire_expert: `Analyse automatique: ${comment} Le style de jeu ${style} est clairement identifiable. Les joueurs sont bien positionnés et coordonnés dans cette formation.`
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Mock AI Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Main AI analysis endpoint
app.post('/analyze', (req, res) => {
  try {
    const { video_path, analysis_type } = req.body;
    
    // Validate request
    if (!video_path) {
      return res.status(400).json({
        error: 'video_path is required'
      });
    }

    // Simulate processing delay (0.5-2 seconds)
    const delay = Math.random() * 1500 + 500;
    
    setTimeout(() => {
      const aiResponse = generateMockAIResponse(video_path);
      
      res.json({
        success: true,
        data: aiResponse,
        metadata: {
          video_path,
          analysis_type: analysis_type || 'tactical_football',
          processing_time: delay,
          timestamp: new Date().toISOString()
        }
      });
    }, delay);

  } catch (error) {
    console.error('Error in /analyze endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Alternative endpoint for different analysis types
app.post('/analyze/:type', (req, res) => {
  try {
    const { type } = req.params;
    const { video_path } = req.body;
    
    if (!video_path) {
      return res.status(400).json({
        error: 'video_path is required'
      });
    }

    const delay = Math.random() * 1500 + 500;
    
    setTimeout(() => {
      let aiResponse;
      
      switch (type) {
        case 'formation':
          aiResponse = {
            prediction_ia: `Formation ${formations[Math.floor(Math.random() * formations.length)]} détectée`,
            confiance: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
            joueurs_detectes: generatePlayerNumbers(),
            commentaire_expert: 'Analyse de formation: Structure tactique clairement identifiable avec une organisation cohérente.'
          };
          break;
        case 'pressing':
          aiResponse = {
            prediction_ia: `${pressingTypes[Math.floor(Math.random() * pressingTypes.length)]} détecté`,
            confiance: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
            joueurs_detectes: generatePlayerNumbers(),
            commentaire_expert: 'Analyse de pressing: Intensité et coordination des mouvements défensifs bien observées.'
          };
          break;
        default:
          aiResponse = generateMockAIResponse(video_path);
      }
      
      res.json({
        success: true,
        data: aiResponse,
        metadata: {
          video_path,
          analysis_type: type,
          processing_time: delay,
          timestamp: new Date().toISOString()
        }
      });
    }, delay);

  } catch (error) {
    console.error('Error in /analyze/:type endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Batch analysis endpoint
app.post('/analyze/batch', (req, res) => {
  try {
    const { videos } = req.body;
    
    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({
        error: 'videos array is required'
      });
    }

    const results = videos.map((video, index) => {
      const delay = Math.random() * 1000 + 200; // Shorter delay for batch
      return {
        video_path: video.path || video,
        result: generateMockAIResponse(video.path || video),
        processing_time: delay,
        index
      };
    });

    res.json({
      success: true,
      data: results,
      metadata: {
        total_videos: videos.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in /analyze/batch endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /health',
      'POST /analyze',
      'POST /analyze/:type',
      'POST /analyze/batch'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock AI Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Analysis: http://localhost:${PORT}/analyze`);
  console.log(`📝 Batch Analysis: http://localhost:${PORT}/analyze/batch`);
}); 