# KaziLink Tanzania — AI Continuous Learning, Knowledge Graph & GIS Maps Documentation

## 1. AI Continuous Learning Architecture

KaziLink Tanzania incorporates a self-improving AI learning engine (`/src/lib/ai/ai-learning-engine.ts`) that continuously refines search recommendations, autocomplete predictions, and candidate-job fit scores based on real-time user interactions while enforcing strict data privacy standards.

### Data Inputs Logged:

• **Search Queries & Smart Autocomplete**: High-frequency search phrases feed into the autocomplete frequency graph.
• **Voice Searches**: Speech-to-text inputs expand Swahili and regional terminology.
• **Job Applications & Employer Requirements**: Extract required competencies and emerging job titles (e.g., "TikTok Live Seller", "Solar Technician", "AI Prompt Engineer").
• **Candidate Skills & Work Experience**: Extracted from resume parsing to map emerging skill clusters.

---

## 2. Dynamic Knowledge Base Design

The Knowledge Base continuously discovers emerging occupations, skill sets, and local vocabulary across Tanzania.
• **Emerging Occupations**: TikTok Live Seller, WhatsApp Business Manager, Solar Technician, Boda Boda Dispatcher, Mobile Money Agent, AI Prompt Engineer, Drone Operator.
• **Swahili & Slang Equivalence Mapping**: Maps colloquial terms like "Fundi Umeme", "Dereva Boda", "Mhasibu" to standardized international ISCO occupational codes.
• **Admin Governance**: Admin control center (`/admin/ai`) enables approval or rejection of newly learned vocabulary before global deployment.

---

## 3. Semantic Search & Cross-Lingual Engine

• **Bilingual Query Expansion**: Seamless translation & expansion between Kiswahili and English queries.
• **PostgreSQL Full-Text + AI Embeddings**: Combines PostgreSQL `tsvector` keyword indexing with Gemini AI semantic matching for maximum precision.

---

## 4. Recommendation Engine & Feedback Loop

• **Reinforcement Scoring**: Increases recommendation confidence score for accepted job applications and reduces ranking for ignored recommendations.
• **Candidate Ranking Engine**: Calculates transparent percentage fit scores based on candidate skills, education, and regional proximity.

---

## 5. GIS Maps & Commute Services Integration

• **OpenStreetMap & Interactive GIS (`JobLocationMap.tsx`)**: Renders location maps for job opportunities across all 26+ Tanzanian regions.
• **GPS Radius Filtering**: Instant radius filtering (5 km, 10 km, 20 km, 50 km).
• **Commute Calculations**: Multi-modal travel time estimation (Car/Taxi, Boda Boda motorcycle, Daladala bus, Walking).

---

## 6. Privacy & Governance

• **Privacy Controls (`/profile/security`)**: User opt-out toggle for AI personalization and GPS distance calculations.
• **Zero Cross-User Data Exposure**: Private candidate profiles and contact details remain strictly isolated.
