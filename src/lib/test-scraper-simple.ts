import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

interface ScrapedEndorsement {
  endorser_name: string;
  candidate_name: string;
  source_url: string;
  source_title: string;
  quote: string;
  endorsement_type: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: 'high' | 'medium' | 'low';
  strength: 'strong' | 'moderate' | 'weak';
  endorsed_at?: Date;
}

async function testOpenAISearch() {
  try {
    console.log('🚀 Testing OpenAI web search for endorsements...');
    
    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY environment variable is not set');
      console.log('Please set your OpenAI API key:');
      console.log('export OPENAI_API_KEY=your_api_key_here');
      return;
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Test with a well-known endorser
    const testEndorser = 'Alexandria Ocasio-Cortez';
    console.log(`🔍 Testing search for: "${testEndorser}" endorsement 2025 NYC mayor election`);
    
    const completion = await openai.chat.completions.create({
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
        content: `Search for recent news articles and statements about ${testEndorser} making endorsements for NYC mayor in 2025. 

Please provide:
1. Any direct endorsements or statements of support for any NYC mayoral candidate
2. The source URL and title
3. Any relevant quotes
4. The date of the endorsement (if mentioned)
5. The type of endorsement (formal, informal, implied, etc.)
6. Which candidate they endorsed (if mentioned)

If no endorsement is found, respond with "NO ENDORSEMENT FOUND".

Format your response as JSON with this structure:
{
  "endorsements": [
    {
      "source_url": "URL",
      "source_title": "Article title",
      "quote": "Relevant quote",
      "endorsement_type": "formal|informal|implied",
      "sentiment": "positive|negative|neutral",
      "confidence": "high|medium|low",
      "strength": "strong|moderate|weak",
      "endorsed_at": "YYYY-MM-DD" (if available),
      "candidate_name": "Name of endorsed candidate" (if mentioned)
    }
  ]
}`
      }],
    });

    const response = completion.choices[0].message.content;
    console.log('\n📄 Raw response:');
    console.log(response);
    
    if (!response || response.includes("NO ENDORSEMENT FOUND")) {
      console.log('\n❌ No endorsements found for this search');
    } else {
      try {
        // Try to extract JSON from the response (handle cases where AI adds extra text)
        let jsonStart = response.indexOf('{');
        let jsonEnd = response.lastIndexOf('}') + 1;
        
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          const jsonString = response.substring(jsonStart, jsonEnd);
          const parsed = JSON.parse(jsonString);
          
          if (parsed.endorsements && Array.isArray(parsed.endorsements)) {
            console.log('\n✅ Found endorsements:');
            parsed.endorsements.forEach((endorsement: any, index: number) => {
              console.log(`\n${index + 1}. ${endorsement.source_title}`);
              console.log(`   URL: ${endorsement.source_url}`);
              console.log(`   Quote: ${endorsement.quote}`);
              console.log(`   Candidate: ${endorsement.candidate_name || 'Unknown'}`);
              console.log(`   Type: ${endorsement.endorsement_type}`);
              console.log(`   Sentiment: ${endorsement.sentiment}`);
              console.log(`   Confidence: ${endorsement.confidence}`);
              console.log(`   Strength: ${endorsement.strength}`);
              if (endorsement.endorsed_at) {
                console.log(`   Date: ${endorsement.endorsed_at}`);
              }
            });
          } else {
            console.log('\n⚠️  Response format was not as expected');
          }
        } else {
          console.log('\n⚠️  No JSON found in response');
        }
      } catch (parseError) {
        console.log('\n⚠️  Failed to parse JSON response');
        console.log('This might be due to the AI not following the exact format');
      }
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testOpenAISearch()
    .then(() => {
      console.log('🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export default testOpenAISearch; 