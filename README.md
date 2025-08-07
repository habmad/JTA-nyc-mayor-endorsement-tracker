# 🗽 EndorseNYC - NYC Endorsement Tracker

**Illuminate the coalition behind each candidate through beautiful data storytelling**

EndorseNYC transforms political endorsements from scattered social media posts and press releases into a comprehensive, visual narrative that reveals **who supports whom and why**. By aggregating endorsements across demographics, industries, and influence levels, we create an educational lens into NYC's political landscape.

## 🚀 Current Status

### ✅ Phase 1: Foundation (Complete)
- **Database Schema**: Comprehensive PostgreSQL schema with full endorsement tracking
- **Core UI Components**: Candidate cards, stats display, responsive design
- **Basic Frontend**: Next.js 14 with Tailwind CSS and modern UI
- **Type Safety**: Full TypeScript implementation

### 🔄 Phase 2: Data Collection Pipeline + AI Classification (Implemented)
- **AI Classification Engine**: Smart endorsement detection with confidence scoring
- **Data Collection Pipeline**: Automated scraping from multiple sources
- **Real-time Monitoring**: Configurable source monitoring with rate limiting
- **Smart Prioritization**: High-influence endorsers monitored more frequently

### 🔄 Phase 3: Timeline Visualizations + Advanced Filtering (Implemented)
- **Interactive Timeline**: Daily/weekly/monthly views with trend analysis
- **Advanced Search**: Multi-criteria filtering with debounced search
- **Category Breakdown**: Visual analysis of endorser types and influence
- **Mobile-Optimized**: Responsive design for all devices

### 🔄 Phase 4: Admin Dashboard + Verification Workflow (Implemented)
- **Admin Dashboard**: Complete verification interface with queue management
- **AI-Human Hybrid**: Automated classification with human review workflow
- **Data Collection Monitoring**: Real-time status and statistics
- **Quick Actions**: Bulk operations and data management tools

## 🏗️ Technical Architecture

### Frontend Stack
```typescript
Framework: Next.js 14 (App Router)
Styling: Tailwind CSS + Headless UI
Charts: Recharts (for consistency) + Custom D3 components
State: Zustand (lightweight, TypeScript-first)
Animation: Framer Motion (smooth micro-interactions)
Testing: Vitest + React Testing Library
```

### Backend & Data Pipeline
```typescript
Data Collection: Automated scraping with AI classification
Storage: PostgreSQL with full-text search capabilities
Cache: Redis for API responses and computed views
Queue: Celery with Redis broker for scraping jobs
```

### Key Features Implemented

#### 🤖 AI-Powered Data Collection
- **Smart Classification**: Endorsement detection with confidence scoring
- **Multi-Source Monitoring**: Twitter, Instagram, RSS, websites, Google Alerts
- **Automated Verification**: High-confidence endorsements auto-approved
- **Human Review Queue**: Low-confidence items flagged for manual review

#### 📊 Advanced Visualizations
- **Interactive Timeline**: Track endorsement momentum over time
- **Category Analysis**: Visual breakdown of endorser types
- **Influence Mapping**: Weight endorsements by influence scores
- **Trend Analysis**: Identify patterns and momentum shifts

#### 🔍 Comprehensive Search & Filtering
- **Multi-Criteria Filters**: Candidates, categories, confidence, date ranges
- **Influence Scoring**: Filter by minimum influence thresholds
- **Geographic Filtering**: Borough and district-based filtering
- **Sentiment Analysis**: Positive, neutral, negative sentiment filtering

#### 🛠️ Admin Dashboard
- **Verification Queue**: Review and approve pending endorsements
- **Data Collection Monitoring**: Real-time status and performance metrics
- **Quick Actions**: Bulk operations and data management
- **Analytics Dashboard**: Performance and quality metrics

## 🎯 User Experience

### Primary Users
- **📊 Data-Driven Voters (40%)**: Want to understand candidate support across communities
- **📰 Political Journalists & Analysts (25%)**: Need real-time data for stories and analysis
- **🏛️ Campaign Teams & Political Operatives (20%)**: Monitor competitive landscape
- **🎓 Civic Educators & Students (15%)**: Use for teaching about political coalitions

### Key Features
- **Mobile-First Design**: Optimized for mobile consumption (60% of traffic)
- **Progressive Disclosure**: Overview → Category → Individual endorsement
- **Educational Focus**: Clear explanations of endorsement significance
- **Transparency**: Open about confidence levels and methodology

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis (for caching and queues)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/endorse-nyc.git
cd endorse-nyc
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your database and API credentials
```

4. **Initialize the database**
```bash
npm run db:init
```

5. **Start the development server**
```bash
npm run dev
```

6. **Access the application**
- Main app: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin

### Data Collection Setup

1. **Configure data sources** in the admin dashboard
2. **Add endorser profiles** with influence scores and categories
3. **Start the collection pipeline** from the admin interface
4. **Monitor the verification queue** for new endorsements

## 📊 Data Model

### Core Entities
- **Candidates**: Mayoral candidates with campaign information
- **Endorsers**: Individuals/organizations making endorsements
- **Endorsements**: Individual endorsement records with metadata
- **Data Sources**: Automated monitoring sources (Twitter, RSS, etc.)

### Key Features
- **Confidence Levels**: Confirmed, reported, rumored
- **Influence Scoring**: 1-100 scale based on reach and impact
- **Category Classification**: Politician, union, celebrity, media, business, etc.
- **Geographic Data**: Borough and district information
- **Temporal Tracking**: Endorsement dates and retraction tracking

## 🎨 Design System

### Color Palette
```css
/* Candidate-specific colors */
--candidate-1: #2563eb; /* Blue - Professional, trustworthy */
--candidate-2: #dc2626; /* Red - Bold, energetic */
--candidate-3: #059669; /* Green - Progressive, fresh */
--candidate-4: #7c2d12; /* Brown - Stable, experienced */

/* Confidence levels */
--confirmed: #059669;    /* Green */
--reported: #f59e0b;     /* Amber */
--rumored: #6b7280;      /* Gray */
```

### Component Architecture
```
components/
├── ui/           # Base UI components
├── charts/       # Data visualization components
├── features/     # Feature-specific components
└── layout/       # Layout and navigation components
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:init      # Initialize database
npm run db:migrate   # Run database migrations
```

### Code Structure
```
src/
├── app/            # Next.js app router pages
├── components/     # React components
├── lib/           # Utility functions and data collection
├── store/         # State management (Zustand)
└── types/         # TypeScript type definitions
```

## 📈 Performance & Scalability

### Optimization Strategies
- **Frontend**: React Query with smart caching
- **Images**: Next.js Image with WebP conversion
- **Charts**: Canvas rendering for large datasets
- **Mobile**: Intersection Observer for lazy loading
- **Search**: Debounced search with client-side filtering

### Backend Optimization
- **Database**: Materialized views for complex aggregations
- **API**: GraphQL with DataLoader for N+1 prevention
- **Caching**: Redis for computed endorsement summaries
- **CDN**: Vercel Edge for global performance

## 🎯 Success Metrics

### User Engagement
- **Primary**: Time spent exploring endorsements (target: 3+ minutes avg)
- **Secondary**: Endorsement detail views per session (target: 5+)
- **Tertiary**: Return visits within election cycle (target: 40%+)

### Data Quality
- **Accuracy**: 95%+ verified endorsement accuracy rate
- **Timeliness**: <2 hours from public endorsement to site update
- **Coverage**: 500+ endorsers tracked across all categories
- **Completeness**: 90%+ of major endorsements captured

### Technical Performance
- **Speed**: <1.5s page load time (mobile)
- **Reliability**: 99.5% uptime during peak election periods
- **Scalability**: Support 10,000+ concurrent users on election night

## 🔮 Future Enhancements

### Advanced Analytics
- **Influence Network Mapping**: Show connections between endorsers
- **Predictive Modeling**: Early indicators of endorsement trends
- **Coalition Similarity**: Compare current race to historical patterns

### Enhanced Automation
- **Video/Audio Processing**: Extract endorsements from podcasts, TV appearances
- **Event Monitoring**: Track endorsements at rallies, debates, public events
- **Social Signal Detection**: Identify implicit endorsements (follows, likes, shares)

### Community Features
- **Citizen Reporting**: Allow verified users to submit endorsement tips
- **Accuracy Crowdsourcing**: Community verification of questionable endorsements
- **Educational Content**: Explainers about endorsement significance and history

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NYC political community for feedback and insights
- Open source contributors and maintainers
- Data visualization and political science researchers

---

**EndorseNYC** - Making political coalitions visible and accessible to all New Yorkers.
