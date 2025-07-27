# Integration Guide: NestJS Backend + Mock AI Service

This guide explains how to integrate the Mock AI Service with your existing NestJS backend for testing the annotation workflow.

## Step 1: Update Environment Variables

Add these variables to your `Backend/.env` file:

```bash
# Mock AI Service Configuration
EXTERNAL_AI_API_URL=http://localhost:3001/analyze
EXTERNAL_AI_API_KEY=mock-api-key-123

# Optional: Set timeout for AI requests
AI_REQUEST_TIMEOUT=30000
```

## Step 2: Verify AI Annotation Service

Your existing `AIAnnotationService` should already be configured to call the external AI API. The current implementation in `Backend/src/ai-annotation/ai-annotation.service.ts` should work with the mock service.

The key method is `callExternalAI()` which makes a POST request to the configured `EXTERNAL_AI_API_URL`.

## Step 3: Test the Integration

### 1. Start the Mock AI Service

```bash
cd mock-ai-service
npm install
npm start
```

### 2. Start Your NestJS Backend

```bash
cd Backend
npm run start:dev
```

### 3. Test the AI Annotation Workflow

You can test the integration through your frontend or using the API directly:

```bash
# Example: Process AI annotation
curl -X POST http://localhost:3000/ai-annotation/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "videoId": "your-video-id",
    "annotationId": "your-annotation-id", 
    "videoPath": "/uploads/sample-video.mp4"
  }'
```

## Step 4: Expected Workflow

1. **Frontend** calls `/ai-annotation/process` with video and annotation data
2. **NestJS Backend** receives the request and calls the Mock AI Service
3. **Mock AI Service** returns realistic tactical analysis data
4. **NestJS Backend** creates a `RapportAnalyse` record with the AI results
5. **Frontend** receives the complete analysis with human annotation + AI analysis

## Step 5: Response Structure

The Mock AI Service returns data in this format:

```json
{
  "success": true,
  "data": {
    "prediction_ia": "Formation 4-4-2 détectée avec pressing haut",
    "confiance": 0.85,
    "joueurs_detectes": [1, 4, 6, 8, 9, 10, 11, 15, 17, 19, 22],
    "commentaire_expert": "Analyse automatique: L'équipe utilise une formation équilibrée..."
  },
  "metadata": {
    "video_path": "/uploads/sample-video.mp4",
    "analysis_type": "tactical_football",
    "processing_time": 1200,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

Your NestJS backend will extract the `data` object and use it to create the `RapportAnalyse` record.

## Step 6: Database Schema Compatibility

The Mock AI Service generates data that matches your Prisma schema:

```prisma
model RapportAnalyse {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  id_sequence         String   @unique
  prediction_ia       String   // From AI response
  confiance           Float    // From AI response  
  annotation_humaine  String   // From existing annotation
  equipe              String   // From existing annotation
  joueurs_detectes    Int[]    // From AI response
  commentaire_expert  String   // From AI response
  validation          String   // Default: 'pending'
  annotationId        String?  @db.ObjectId
  annotation          Annotation? @relation(fields: [annotationId], references: [id])
}
```

## Troubleshooting

### Mock Service Not Responding

1. Check if the service is running: `http://localhost:3001/health`
2. Verify the port isn't blocked by another service
3. Check the console for any error messages

### CORS Issues

If you encounter CORS issues, the Mock AI Service already includes CORS middleware. If problems persist, you can modify the CORS configuration in `mock-ai-service/server.js`.

### Timeout Issues

The Mock AI Service simulates processing delays (0.5-2 seconds). If your NestJS backend times out, you can:

1. Increase the timeout in your NestJS service
2. Reduce the delay in the Mock AI Service by modifying the `delay` calculation

### Database Connection Issues

Make sure your MongoDB is running and the connection string in `Backend/.env` is correct.

## Switching Back to Real AI

When you're ready to switch back to the real AI service:

1. Update `EXTERNAL_AI_API_URL` to point to your real AI service
2. Update `EXTERNAL_AI_API_KEY` with the real API key
3. Restart your NestJS backend

The beauty of this setup is that no code changes are needed - just environment variable updates.

## Development Workflow

1. **Development**: Use Mock AI Service for testing
2. **Staging**: Use Mock AI Service or real AI service
3. **Production**: Use real AI service

This allows you to develop and test the annotation workflow without depending on the actual AI backend being ready. 