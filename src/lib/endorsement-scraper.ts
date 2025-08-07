import OpenAI from 'openai';
import { sql } from '@vercel/postgres';

interface EndorsementResult {
  endorser_id: string;
  candidate_id: string;
  source_url: string;
  source_title: string;
  quote: string;
  endorsement_type: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: 'high' | 'medium' | 'low';
  strength: 'strong' | 'moderate' | 'weak';
  endorsed_at?: Date;
}

interface ScrapedEndorsement {
  endorser_name: string;
  candidate_name: string;
  source_url: string;
  source_title: string;
  quote: string;
  endorsement_type: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: 'rumored' | 'reported' | 'confirmed';
  strength: 'weak' | 'standard' | 'strong' | 'enthusiastic';
  endorsed_at?: Date;
}

export class EndorsementScraper {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Main method to scrape endorsements for all endorsers
   */
  async scrapeAllEndorsements(): Promise<void> {
    console.log('🔍 Starting comprehensive endorsement scraping...');

    // Get all endorsers
    const endorsers = await this.getEndorsers();

    console.log(`📊 Found ${endorsers.length} endorsers to search`);

    let totalSearches = 0;
    let foundEndorsements = 0;

    // Search for endorsements for each endorser
    for (const endorser of endorsers) {
      totalSearches++;
      console.log(`🔍 Searching: ${endorser.name} (${totalSearches}/${endorsers.length})`);

      try {
        const endorsements = await this.searchForEndorsements(endorser);
        
        if (endorsements.length > 0) {
          console.log(`✅ Found ${endorsements.length} endorsement(s) for ${endorser.name}`);
          await this.saveEndorsements(endorsements, endorser.id);
          foundEndorsements += endorsements.length;
        } else {
          console.log(`❌ No endorsements found for ${endorser.name}`);
        }

        // Rate limiting - wait between searches
        await this.delay(2000);
      } catch (error) {
        console.error(`❌ Error searching ${endorser.name}:`, error);
      }
    }

    console.log(`🎉 Scraping complete! Found ${foundEndorsements} total endorsements from ${totalSearches} searches`);
  }

  /**
   * Search for endorsements between a specific endorser and candidate
   */
  private async searchForEndorsements(endorser: any): Promise<ScrapedEndorsement[]> {
    const searchQuery = `"${endorser.name}" endorsement 2025 NYC mayor election`;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-search-preview",
        web_search_options: {
          search_context_size: "medium",
          user_location: {
            type: "approximate",
            approximate: {
              country: "US",
              city: "New York",
              region: "New York",
            },
          },
        },
        messages: [{
          role: "user",
          content: `Search for recent news articles and statements about ${endorser.name} making endorsements for NYC mayor in 2025. 

Please provide:
1. Any direct endorsements or statements of support for any NYC mayoral candidate
2. The source URL and title
3. Any relevant quotes
4. The date of the endorsement (if mentioned)
5. The type of endorsement (endorsement, un_endorsement, conditional, rumored)
6. Which candidate they endorsed (if mentioned)

If no endorsement is found, respond with exactly: "NO ENDORSEMENT FOUND"

If endorsements are found, respond with ONLY valid JSON in this exact format:
{
  "endorsements": [
    {
      "source_url": "URL",
      "source_title": "Article title",
      "quote": "Relevant quote",
      "endorsement_type": "endorsement|un_endorsement|conditional|rumored",
      "sentiment": "positive|negative|neutral",
      "confidence": "rumored|reported|confirmed",
      "strength": "weak|standard|strong|enthusiastic",
      "endorsed_at": "YYYY-MM-DD",
      "candidate_name": "Name of endorsed candidate"
    }
  ]
}

IMPORTANT: Respond with ONLY the JSON or "NO ENDORSEMENT FOUND". Do not include any other text, explanations, or formatting.`
        }],
      });

      const response = completion.choices[0].message.content;
      
      if (!response || response.includes("NO ENDORSEMENT FOUND")) {
        return [];
      }

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(response);
        if (parsed.endorsements && Array.isArray(parsed.endorsements)) {
          return parsed.endorsements.map((endorsement: any) => ({
            endorser_name: endorser.name,
            candidate_name: endorsement.candidate_name || 'Unknown',
            ...endorsement
          }));
        }
      } catch (parseError) {
        console.log('Failed to parse JSON response, trying to extract manually...');
        console.log('Raw response:', response.substring(0, 500) + '...');
        
        // Try to extract JSON from markdown code blocks
        const jsonMatch = response.match(/```json\s*(\{.*?\})\s*```/);
        if (jsonMatch) {
          try {
            const extractedJson = JSON.parse(jsonMatch[1]);
            if (extractedJson.endorsements && Array.isArray(extractedJson.endorsements)) {
              console.log('✅ Successfully extracted JSON from markdown code block');
              return extractedJson.endorsements.map((endorsement: any) => ({
                endorser_name: endorser.name,
                candidate_name: endorsement.candidate_name || 'Unknown',
                ...endorsement
              }));
            }
          } catch (extractError) {
            console.log('Failed to parse extracted JSON from markdown');
          }
        }
        
        return this.extractEndorsementsFromText(response, endorser.name);
      }

      return [];
    } catch (error) {
      console.error('Error in web search:', error);
      return [];
    }
  }

  /**
   * Fallback method to extract endorsements from unstructured text
   */
  private extractEndorsementsFromText(text: string, endorserName: string): ScrapedEndorsement[] {
    const endorsements: ScrapedEndorsement[] = [];
    
    // Simple pattern matching for URLs and quotes
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    const quoteMatch = text.match(/"([^"]+)"/);
    
    // Try to extract candidate names from the text with more variations
    // Order by specificity (full names first, then partial matches)
    const candidateMatches = [
      { search: 'Zohran Mamdani', result: 'Zohran Mamdani' },
      { search: 'Eric Adams', result: 'Eric Adams' },
      { search: 'Andrew Cuomo', result: 'Andrew Cuomo' },
      { search: 'Curtis Sliwa', result: 'Curtis Sliwa' },
      { search: 'Mamdani', result: 'Zohran Mamdani' },
      { search: 'Adams', result: 'Eric Adams' },
      { search: 'Cuomo', result: 'Andrew Cuomo' },
      { search: 'Sliwa', result: 'Curtis Sliwa' },
      { search: 'Mayor Adams', result: 'Eric Adams' },
      { search: 'Governor Cuomo', result: 'Andrew Cuomo' }
    ];
    
    let foundCandidate = 'Unknown';
    
    // Search for the most specific match first
    for (const match of candidateMatches) {
      if (text.toLowerCase().includes(match.search.toLowerCase())) {
        foundCandidate = match.result;
        console.log(`🎯 Found candidate match: "${match.search}" → "${match.result}"`);
        break;
      }
    }
    
    // If we found any content that looks like an endorsement, include it
    if (urlMatch || quoteMatch || text.toLowerCase().includes('endors') || text.toLowerCase().includes('support')) {
      endorsements.push({
        endorser_name: endorserName,
        candidate_name: foundCandidate,
        source_url: urlMatch ? urlMatch[0] : '',
        source_title: 'Extracted from search results',
        quote: quoteMatch ? quoteMatch[1] : text.substring(0, 300),
        endorsement_type: 'endorsement',
        sentiment: 'positive',
        confidence: 'reported', // Use 'reported' for manually extracted data
        strength: 'standard'
      });
    }
    
    return endorsements;
  }

  /**
   * Get all endorsers from database
   */
  private async getEndorsers(): Promise<any[]> {
    const result = await sql`
      SELECT id, name, display_name, title, organization, category, influence_score
      FROM endorsers 
      ORDER BY influence_score DESC
    `;
    return result.rows;
  }

  /**
   * Get all candidates from database
   */
  private async getCandidates(): Promise<any[]> {
    const result = await sql`
      SELECT id, name, party, photo_url, website, bio
      FROM candidates 
      ORDER BY name
    `;
    return result.rows;
  }

  /**
   * Save endorsements to database
   */
  private async saveEndorsements(endorsements: ScrapedEndorsement[], endorserId: string): Promise<void> {
    console.log(`💾 Attempting to save ${endorsements.length} endorsement(s)`);
    
    for (const endorsement of endorsements) {
      try {
        console.log(`📝 Processing endorsement: ${endorsement.endorser_name} → ${endorsement.candidate_name}`);
        
        // If candidate_name is provided, try to find the candidate in our database
        let candidateId = null;
        if (endorsement.candidate_name && endorsement.candidate_name !== 'Unknown') {
          const candidate = await this.findCandidateByName(endorsement.candidate_name);
          if (candidate) {
            candidateId = candidate.id;
          }
        }

        // Only save if we found a matching candidate
        if (candidateId) {
          await sql`
            INSERT INTO endorsements (
              endorser_id, candidate_id, source_url, source_type, source_title, quote,
              endorsement_type, sentiment, confidence, strength, endorsed_at
            ) VALUES (
              ${endorserId}, 
              ${candidateId}, 
              ${endorsement.source_url || null}, 
              'website', 
              ${endorsement.source_title || 'Unknown Source'}, 
              ${endorsement.quote || ''}, 
              ${endorsement.endorsement_type}, 
              ${endorsement.sentiment}, 
              ${endorsement.confidence}, 
              ${endorsement.strength}, 
              ${endorsement.endorsed_at ? new Date(endorsement.endorsed_at).toISOString() : null}
            )
          `;
          console.log(`✅ Successfully saved endorsement: ${endorsement.endorser_name} → ${endorsement.candidate_name}`);
        } else {
          console.log(`⚠️  Skipping endorsement for unknown candidate: ${endorsement.candidate_name}`);
          console.log(`   Source: ${endorsement.source_url}`);
          console.log(`   Quote: ${endorsement.quote.substring(0, 100)}...`);
        }
      } catch (error) {
        console.error('❌ Error saving endorsement:', error);
      }
    }
  }

  /**
   * Utility method to add delay between requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Search for endorsements for a specific endorser
   */
  async scrapeEndorsementsForEndorser(endorserId: string): Promise<ScrapedEndorsement[]> {
    const endorser = await this.getEndorserById(endorserId);

    if (!endorser) {
      throw new Error(`Endorser with ID ${endorserId} not found`);
    }

    console.log(`🔍${endorser.name} making endorsements for NYC mayor in 2025`);

    try {
      const endorsements = await this.searchForEndorsements(endorser);
      
      if (endorsements.length > 0) {
        console.log(`✅ Found ${endorsements.length} endorsement(s) for ${endorser.name}`);
        await this.saveEndorsements(endorsements, endorser.id);
      } else {
        console.log(`❌ No endorsements found for ${endorser.name}`);
      }
      
      await this.delay(2000);
      return endorsements;
    } catch (error) {
      console.error(`❌ Error searching ${endorser.name}:`, error);
      return [];
    }
  }

  /**
   * Search for endorsements for a specific candidate
   */
  async scrapeEndorsementsForCandidate(candidateId: string): Promise<ScrapedEndorsement[]> {
    const candidate = await this.getCandidateById(candidateId);
    const endorsers = await this.getEndorsers();

    if (!candidate) {
      throw new Error(`Candidate with ID ${candidateId} not found`);
    }

    console.log(`🔍 Searching endorsements for ${candidate.name}...`);

    const allResults: ScrapedEndorsement[] = [];

    for (const endorser of endorsers) {
      try {
        const endorsements = await this.searchForEndorsements(endorser);
        
        // Filter endorsements for this specific candidate
        const candidateEndorsements = endorsements.filter(e => 
          e.candidate_name && e.candidate_name.toLowerCase().includes(candidate.name.toLowerCase())
        );
        
        if (candidateEndorsements.length > 0) {
          console.log(`✅ Found ${candidateEndorsements.length} endorsement(s) for ${endorser.name} → ${candidate.name}`);
          await this.saveEndorsements(candidateEndorsements, endorser.id);
          allResults.push(...candidateEndorsements);
        }
        
        await this.delay(2000);
      } catch (error) {
        console.error(`❌ Error searching ${endorser.name}:`, error);
      }
    }

    return allResults;
  }

  /**
   * Get endorser by ID
   */
  async getEndorserById(id: string): Promise<any> {
    const result = await sql`
      SELECT id, name, display_name, title, organization, category, influence_score
      FROM endorsers 
      WHERE id = ${id}
    `;
    return result.rows[0];
  }

  /**
   * Get candidate by ID
   */
  async getCandidateById(id: string): Promise<any> {
    const result = await sql`
      SELECT id, name, party, photo_url, website, bio
      FROM candidates 
      WHERE id = ${id}
    `;
    return result.rows[0];
  }

  /**
   * Find candidate by name (fuzzy matching)
   */
  private async findCandidateByName(name: string): Promise<any> {
    const candidates = await this.getCandidates();
    
    console.log(`🔍 Looking for candidate: "${name}"`);
    console.log(`📋 Available candidates:`, candidates.map(c => c.name));
    
    // Try exact match first
    let candidate = candidates.find(c => 
      c.name.toLowerCase() === name.toLowerCase()
    );
    
    if (candidate) {
      console.log(`✅ Exact match found: ${candidate.name}`);
      return candidate;
    }
    
    // Try partial matches
    candidate = candidates.find(c => 
      c.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(c.name.toLowerCase())
    );
    
    if (candidate) {
      console.log(`✅ Partial match found: ${candidate.name}`);
      return candidate;
    }
    
    // Try matching first/last name parts
    const nameParts = name.toLowerCase().split(' ');
    candidate = candidates.find(c => {
      const candidateParts = c.name.toLowerCase().split(' ');
      return nameParts.some(part => 
        candidateParts.some((candidatePart: string) => 
          candidatePart.includes(part) || part.includes(candidatePart)
        )
      );
    });
    
    if (candidate) {
      console.log(`✅ Name part match found: ${candidate.name}`);
      return candidate;
    }
    
    console.log(`❌ No match found for: "${name}"`);
    return null;
  }
}

// Export for use in other files
export default EndorsementScraper; 