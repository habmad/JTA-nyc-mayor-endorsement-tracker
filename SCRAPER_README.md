# Endorsement Scraper

This scraper uses OpenAI's web search API to find endorsement data between our database of endorsers and candidates for the 2025 NYC mayoral election.

## How It Works

The scraper performs web searches for each endorser-candidate combination to find:
- Direct endorsements
- Statements of support
- News articles mentioning endorsements
- Social media posts about endorsements

## Features

### 1. Comprehensive Scraping
- Searches all endorser-candidate combinations
- Uses OpenAI's web search API with NYC location targeting
- Includes rate limiting to respect API limits
- Automatically saves found endorsements to database

### 2. Targeted Scraping
- Search for endorsements by specific endorser
- Search for endorsements by specific candidate
- Useful for focused research or updates

### 3. Smart Data Processing
- Extracts source URLs, titles, and quotes
- Classifies endorsement type (formal, informal, implied)
- Determines sentiment (positive, negative, neutral)
- Assesses confidence and strength levels
- Handles date parsing when available

## Setup

### 1. Environment Variables
Add your OpenAI API key to your environment:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Database Setup
The scraper requires the database to be initialized with endorsers and candidates:

```bash
# Initialize database (includes sample data)
npm run db:init
```

### 3. Dependencies
Install the required dependencies:

```bash
npm install openai
```

## Usage

### Web Interface
1. Navigate to `/admin/scraper` in your application
2. Choose scraping type:
   - **Comprehensive**: Search all endorser-candidate combinations
   - **Targeted**: Search for specific endorser or candidate
3. Click the appropriate button to start scraping

### API Endpoint
You can also trigger scraping via API:

```bash
# Comprehensive scraping
curl -X POST /api/admin/scrape-endorsements \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'

# Targeted scraping for specific endorser
curl -X POST /api/admin/scrape-endorsements \
  -H "Content-Type: application/json" \
  -d '{"type": "endorser", "id": "endorser-uuid"}'

# Targeted scraping for specific candidate
curl -X POST /api/admin/scrape-endorsements \
  -H "Content-Type: application/json" \
  -d '{"type": "candidate", "id": "candidate-uuid"}'
```

### Test Script
Run a quick test to verify the scraper works:

```bash
# From the endorse-nyc directory
npx tsx src/lib/test-scraper.ts
```

## Data Structure

### Endorsement Records
Each found endorsement is saved with:

```typescript
{
  endorser_id: string,
  candidate_id: string,
  source_url: string,
  source_title: string,
  quote: string,
  endorsement_type: 'formal' | 'informal' | 'implied',
  sentiment: 'positive' | 'negative' | 'neutral',
  confidence: 'high' | 'medium' | 'low',
  strength: 'strong' | 'moderate' | 'weak',
  endorsed_at?: Date
}
```

### Search Strategy
The scraper uses these search patterns:
- `"Endorser Name" "Candidate Name" endorsement 2025 NYC mayor election`
- Location targeting: New York, NY, USA
- Medium search context size for balanced results
- JSON response parsing with fallback text extraction

## Rate Limiting

The scraper includes built-in rate limiting:
- 2-second delay between searches
- Respects OpenAI API rate limits
- Handles API errors gracefully

## Cost Considerations

Using OpenAI's web search API incurs costs:
- Each search uses tokens from the model
- Web search context is billed separately
- Consider running targeted searches for cost efficiency

## Monitoring

Check the admin dashboard for:
- Scraping progress and results
- Found endorsement counts
- Error logs and status updates

## Troubleshooting

### Common Issues

1. **No endorsements found**
   - Check if endorsers and candidates exist in database
   - Verify OpenAI API key is set
   - Try targeted searches first

2. **API errors**
   - Check OpenAI API key validity
   - Verify account has web search access
   - Check rate limits and billing

3. **Database errors**
   - Ensure database is initialized
   - Check connection settings
   - Verify table structure

### Debug Mode
Enable detailed logging by setting:

```bash
DEBUG=endorsement-scraper
```

## Future Enhancements

- [ ] Batch processing for efficiency
- [ ] Historical endorsement tracking
- [ ] Social media integration
- [ ] Automated retraction detection
- [ ] Confidence scoring improvements
- [ ] Multi-language support 