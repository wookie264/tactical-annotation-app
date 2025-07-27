# 🏗️ Architecture Documentation

## 📋 **Data Models Overview**

### 1. **Video Model**
- Stores uploaded video files
- Has a one-to-many relationship with `Annotation`

### 2. **Annotation Model** (Manual Annotations)
- Created by users through manual annotation process
- Contains human-created tactical analysis
- Fields: `annotation`, `validateur`, `commentaire`, `domicile`, `visiteuse`
- **Purpose**: Human tactical analysis

### 3. **RapportAnalyse Model** (AI Analysis Reports)
- Created by AI analysis
- Contains AI-generated tactical insights
- Fields: `prediction_ia`, `confiance`, `joueurs_detectes`, `commentaire_expert`
- **Purpose**: AI tactical analysis

## 🔄 **Workflow Architecture**

### **Scenario 1: Manual Annotation Only**
```
User Uploads Video → User Creates Manual Annotation → Annotation Model
```

### **Scenario 2: AI Analysis Only**
```
User Uploads Video → AI Analysis → RapportAnalyse Model
```

### **Scenario 3: Manual + AI Analysis**
```
User Uploads Video → User Creates Manual Annotation → AI Analyzes Annotation → RapportAnalyse Model (linked to Annotation)
```

## 🎯 **Key Principles**

1. **Manual Annotations** → Always go to `Annotation` model
2. **AI Analysis** → Always go to `RapportAnalyse` model
3. **AI can analyze**:
   - Raw video (no manual annotation exists)
   - Existing manual annotation (creates rapport linked to annotation)
4. **No automatic annotation creation** by AI - AI only creates reports

## 🔧 **API Endpoints**

### **Manual Annotation**
- `POST /manual-annotation` - Create manual annotation
- `GET /manual-annotation` - Get all annotations
- `PUT /manual-annotation/:id` - Update annotation
- `DELETE /manual-annotation/:id` - Delete annotation

### **AI Analysis**
- `POST /ai-annotation/process` - Process AI analysis
- `GET /ai-annotation/video/:videoId` - Get AI reports for video
- `PUT /ai-annotation/rapport/:id/validation` - Update rapport validation

## 📊 **Database Relationships**

```
Video (1) ←→ (Many) Annotation
Annotation (1) ←→ (Many) RapportAnalyse (optional link)
```

- A video can have multiple manual annotations
- A manual annotation can have multiple AI analysis reports
- AI analysis reports can exist independently (no manual annotation)

## 🚀 **Frontend Workflows**

### **Video Upload Page**
- Upload video
- "Analyser IA (Rapport)" button → Creates AI analysis report
- "Créer Annotation" button → Goes to manual annotation form

### **Manual Annotation Page**
- Create manual annotation
- "Analyser avec IA" button → Creates AI analysis report linked to annotation

### **Rapport Page**
- View all AI analysis reports
- Filter by video, annotation, validation status 