# Mock AI Service

A standalone mock AI service for testing the tactical annotation workflow. This service simulates AI responses for football tactical analysis without requiring the actual AI backend.

## Features

- 🎯 **Realistic AI Responses**: Generates realistic tactical football analysis data
- ⚡ **Fast Response**: Simulates processing delays (0.5-2 seconds)
- 🔄 **Multiple Endpoints**: Supports different analysis types and batch processing
- 🛡️ **CORS Enabled**: Ready for frontend integration
- 📊 **Health Monitoring**: Built-in health check endpoint

## Quick Start

### 1. Install Dependencies

```bash
cd mock-ai-service
npm install
```

### 2. Configure Environment (Optional)

```bash
cp env.example .env
# Edit .env if needed
```

### 3. Start the Service

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The service will start on `http://localhost:3001`

## API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Mock AI Service",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### AI Analysis
```http
POST /analyze
Content-Type: application/json

{
  "video_path": "/path/to/video.mp4",
  "analysis_type": "tactical_football"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prediction_ia": "Formation 4-4-2 détectée avec pressing haut",
    "confiance": 0.85,
    "joueurs_detectes": [1, 4, 6, 8, 9, 10, 11, 15, 17, 19, 22],
    "commentaire_expert": "Analyse automatique: L'équipe utilise une formation équilibrée avec un pressing efficace. Le style de jeu possession est clairement identifiable. Les joueurs sont bien positionnés et coordonnés dans cette formation."
  },
  "metadata": {
    "video_path": "/path/to/video.mp4",
    "analysis_type": "tactical_football",
    "processing_time": 1200,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Specific Analysis Types
```http
POST /analyze/formation
POST /analyze/pressing
```

### Batch Analysis
```http
POST /analyze/batch
Content-Type: application/json

{
  "videos": [
    "/path/to/video1.mp4",
    "/path/to/video2.mp4",
    "/path/to/video3.mp4"
  ]
}
```

## Integration with NestJS Backend

To use this mock service with your NestJS backend, update the environment variables:

```bash
# In your Backend/.env file
EXTERNAL_AI_API_URL=http://localhost:3001/analyze
EXTERNAL_AI_API_KEY=mock-api-key-123
```

## Response Schema

The mock service generates responses that match the expected `AIAnalysisResponse` interface:

```typescript
interface AIAnalysisResponse {
  prediction_ia: string;      // Tactical prediction (formation + pressing)
  confiance: number;          // Confidence level (0.7-1.0)
  joueurs_detectes: number[]; // Detected player numbers (1-23)
  commentaire_expert: string; // Expert analysis comment
}
```

## Mock Data Varieties

The service generates realistic variations of:

- **Formations**: 4-4-2, 4-3-3, 3-5-2, 4-2-3-1, 3-4-3, 5-3-2, 4-1-4-1, 3-6-1
- **Pressing Types**: pressing haut, pressing moyen, pressing bas, pressing par zones, pressing manuel
- **Tactical Styles**: possession, contre-attaque, jeu direct, pressing agressif, jeu de transition, domination aérienne, jeu de passes courtes, jeu de passes longues
- **Player Numbers**: Random selection of 8-12 players (numbers 1-23)
- **Confidence Levels**: 70-100% with realistic distribution

## Testing Examples

### Using curl

```bash
# Health check
curl http://localhost:3001/health

# Single analysis
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"video_path": "/uploads/match1.mp4"}'

# Formation analysis
curl -X POST http://localhost:3001/analyze/formation \
  -H "Content-Type: application/json" \
  -d '{"video_path": "/uploads/match1.mp4"}'

# Batch analysis
curl -X POST http://localhost:3001/analyze/batch \
  -H "Content-Type: application/json" \
  -d '{"videos": ["/uploads/match1.mp4", "/uploads/match2.mp4"]}'
```

### Using JavaScript/Fetch

```javascript
// Single analysis
const response = await fetch('http://localhost:3001/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    video_path: '/uploads/match1.mp4',
    analysis_type: 'tactical_football'
  })
});

const result = await response.json();
console.log(result.data);
```

## Development

### Adding New Analysis Types

To add new analysis types, modify the `app.post('/analyze/:type')` endpoint in `server.js`:

```javascript
case 'new_type':
  aiResponse = {
    prediction_ia: 'Custom prediction for new type',
    confiance: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
    joueurs_detectes: generatePlayerNumbers(),
    commentaire_expert: 'Custom expert comment for new analysis type.'
  };
  break;
```

### Customizing Response Data

Modify the arrays at the top of `server.js` to customize:
- `formations` - Available football formations
- `pressingTypes` - Pressing strategies
- `tacticalStyles` - Playing styles
- `expertComments` - Expert analysis comments

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, change the PORT in your `.env` file or set it as an environment variable:

```bash
PORT=3002 npm start
```

### CORS Issues
The service includes CORS middleware, but if you encounter issues, you can modify the CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4200'],
  credentials: true
}));
```

## License

MIT License - feel free to modify and use as needed for your testing purposes. 