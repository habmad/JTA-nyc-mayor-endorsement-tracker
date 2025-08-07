import { sql } from '@vercel/postgres';

interface EndorserData {
  name: string;
  display_name?: string;
  title?: string;
  organization?: string;
  category: 'politician' | 'union' | 'celebrity' | 'media' | 'business' | 'nonprofit' | 'academic' | 'religious';
  subcategory?: string;
  borough?: string;
  influence_score: number;
  twitter_handle?: string;
  instagram_handle?: string;
  is_organization?: boolean;
}

interface EndorsementData {
  endorser_name: string;
  candidate_name: string;
  source_url: string;
  source_title: string;
  quote?: string;
  endorsement_type: 'endorsement' | 'un_endorsement' | 'conditional' | 'rumored';
  confidence: 'rumored' | 'reported' | 'confirmed';
  endorsed_at: Date;
}

const endorsers: EndorserData[] = [
  // ZOHRAN MAMDANI Endorsers
  // Elected Officials
  {
    name: 'Elizabeth Warren',
    title: 'U.S. Senator',
    organization: 'U.S. Senate',
    category: 'politician',
    subcategory: 'federal_senator',
    influence_score: 95,
    twitter_handle: '@SenWarren'
  },
  {
    name: 'Bernie Sanders',
    title: 'U.S. Senator',
    organization: 'U.S. Senate',
    category: 'politician',
    subcategory: 'federal_senator',
    influence_score: 94,
    twitter_handle: '@BernieSanders'
  },
  {
    name: 'Alexandria Ocasio-Cortez',
    display_name: 'AOC',
    title: 'U.S. Representative',
    organization: 'U.S. House of Representatives',
    category: 'politician',
    subcategory: 'federal_representative',
    borough: 'Queens/Bronx',
    influence_score: 96,
    twitter_handle: '@AOC',
    instagram_handle: '@ocasio_cortez'
  },
  {
    name: 'Jerrold Nadler',
    title: 'U.S. Representative',
    organization: 'U.S. House of Representatives',
    category: 'politician',
    subcategory: 'federal_representative',
    borough: 'Manhattan',
    influence_score: 85,
    twitter_handle: '@RepJerryNadler'
  },
  {
    name: 'Nydia Velázquez',
    title: 'U.S. Representative',
    organization: 'U.S. House of Representatives',
    category: 'politician',
    subcategory: 'federal_representative',
    borough: 'Brooklyn',
    influence_score: 82,
    twitter_handle: '@NydiaVelazquez'
  },
  {
    name: 'Pramila Jayapal',
    title: 'U.S. Representative',
    organization: 'U.S. House of Representatives',
    category: 'politician',
    subcategory: 'federal_representative',
    influence_score: 88,
    twitter_handle: '@RepJayapal'
  },
  {
    name: 'Adriano Espaillat',
    title: 'U.S. Representative',
    organization: 'U.S. House of Representatives',
    category: 'politician',
    subcategory: 'federal_representative',
    borough: 'Manhattan',
    influence_score: 80,
    twitter_handle: '@RepEspaillat'
  },
  {
    name: 'Letitia James',
    title: 'Attorney General',
    organization: 'New York State',
    category: 'politician',
    subcategory: 'state_official',
    influence_score: 90,
    twitter_handle: '@NewYorkStateAG'
  },
  {
    name: 'Brad Lander',
    title: 'Comptroller',
    organization: 'New York City',
    category: 'politician',
    subcategory: 'city_official',
    borough: 'Brooklyn',
    influence_score: 85,
    twitter_handle: '@bradlander'
  },
  {
    name: 'Jumaane Williams',
    title: 'Public Advocate',
    organization: 'New York City',
    category: 'politician',
    subcategory: 'city_official',
    borough: 'Brooklyn',
    influence_score: 88,
    twitter_handle: '@JumaaneWilliams'
  },
  {
    name: 'Antonio Delgado',
    title: 'Lieutenant Governor',
    organization: 'New York State',
    category: 'politician',
    subcategory: 'state_official',
    influence_score: 85,
    twitter_handle: '@LtGovDelgado'
  },
  {
    name: 'Andrea Stewart-Cousins',
    title: 'State Senate Majority Leader',
    organization: 'New York State Senate',
    category: 'politician',
    subcategory: 'state_legislator',
    influence_score: 90,
    twitter_handle: '@AndreaSCousins'
  },
  {
    name: 'Brad Hoylman-Sigal',
    title: 'State Senator',
    organization: 'New York State Senate',
    category: 'politician',
    subcategory: 'state_legislator',
    borough: 'Manhattan',
    influence_score: 82,
    twitter_handle: '@bradhoylman'
  },
  {
    name: 'John Liu',
    title: 'State Senator',
    organization: 'New York State Senate',
    category: 'politician',
    subcategory: 'state_legislator',
    borough: 'Queens',
    influence_score: 80,
    twitter_handle: '@JohnLiu'
  },
  {
    name: 'Julia Salazar',
    title: 'State Senator',
    organization: 'New York State Senate',
    category: 'politician',
    subcategory: 'state_legislator',
    borough: 'Brooklyn',
    influence_score: 78,
    twitter_handle: '@JuliaSalazarNY'
  },
  {
    name: 'Jabari Brisport',
    title: 'State Senator',
    organization: 'New York State Senate',
    category: 'politician',
    subcategory: 'state_legislator',
    borough: 'Brooklyn',
    influence_score: 75,
    twitter_handle: '@JabariBrisport'
  },
  {
    name: 'Kristen Gonzalez',
    title: 'State Senator',
    organization: 'New York State Senate',
    category: 'politician',
    subcategory: 'state_legislator',
    borough: 'Queens',
    influence_score: 72,
    twitter_handle: '@KristenGonzalez'
  },
  {
    name: 'Gustavo Rivera',
    title: 'State Senator',
    organization: 'New York State Senate',
    category: 'politician',
    subcategory: 'state_legislator',
    borough: 'Bronx',
    influence_score: 80,
    twitter_handle: '@NYSenatorRivera'
  },
  {
    name: 'Michael Gianaris',
    title: 'State Senator',
    organization: 'New York State Senate',
    category: 'politician',
    subcategory: 'state_legislator',
    borough: 'Queens',
    influence_score: 85,
    twitter_handle: '@SenGianaris'
  },
  {
    name: 'Zellnor Myrie',
    title: 'State Senator',
    organization: 'New York State Senate',
    category: 'politician',
    subcategory: 'state_legislator',
    borough: 'Brooklyn',
    influence_score: 78,
    twitter_handle: '@zellnor4ny'
  },
  {
    name: 'Rodneyse Bichotte Hermelyn',
    title: 'Assembly Member',
    organization: 'New York State Assembly',
    category: 'politician',
    subcategory: 'state_legislator',
    borough: 'Brooklyn',
    influence_score: 85,
    twitter_handle: '@Rodneyse'
  },
  {
    name: 'Mark Levine',
    title: 'Manhattan Borough President',
    organization: 'Manhattan Borough President',
    category: 'politician',
    subcategory: 'borough_president',
    borough: 'Manhattan',
    influence_score: 88,
    twitter_handle: '@MarkLevineNYC'
  },
  {
    name: 'Antonio Reynoso',
    title: 'Brooklyn Borough President',
    organization: 'Brooklyn Borough President',
    category: 'politician',
    subcategory: 'borough_president',
    borough: 'Brooklyn',
    influence_score: 85,
    twitter_handle: '@BPEricAdams'
  },
  {
    name: 'Adrienne Adams',
    title: 'City Council Speaker',
    organization: 'New York City Council',
    category: 'politician',
    subcategory: 'city_council',
    borough: 'Queens',
    influence_score: 90,
    twitter_handle: '@AdrienneAdams'
  },

  // Labor Unions
  {
    name: 'District Council 37',
    organization: 'DC37',
    category: 'union',
    subcategory: 'public_sector',
    influence_score: 88,
    is_organization: true
  },
  {
    name: 'United Federation of Teachers',
    organization: 'UFT',
    category: 'union',
    subcategory: 'education',
    influence_score: 90,
    is_organization: true,
    twitter_handle: '@UFT'
  },
  {
    name: '32BJ SEIU',
    organization: '32BJ SEIU',
    category: 'union',
    subcategory: 'service_workers',
    influence_score: 85,
    is_organization: true,
    twitter_handle: '@32BJSEIU'
  },
  {
    name: 'NYC Central Labor Council AFL-CIO',
    organization: 'NYC CLC',
    category: 'union',
    subcategory: 'labor_council',
    influence_score: 92,
    is_organization: true
  },
  {
    name: 'Hotel and Gaming Trades Council',
    organization: 'HTC',
    category: 'union',
    subcategory: 'hospitality',
    influence_score: 80,
    is_organization: true
  },
  {
    name: 'New York State Nurses Association',
    organization: 'NYSNA',
    category: 'union',
    subcategory: 'healthcare',
    influence_score: 85,
    is_organization: true,
    twitter_handle: '@NYSNA'
  },
  {
    name: 'United Auto Workers Region 9A',
    organization: 'UAW Region 9A',
    category: 'union',
    subcategory: 'automotive',
    influence_score: 78,
    is_organization: true
  },
  {
    name: 'American Federation of Musicians Local 802',
    organization: 'AFM Local 802',
    category: 'union',
    subcategory: 'entertainment',
    influence_score: 75,
    is_organization: true
  },
  {
    name: '1199SEIU United Healthcare Workers East',
    organization: '1199SEIU',
    category: 'union',
    subcategory: 'healthcare',
    influence_score: 88,
    is_organization: true,
    twitter_handle: '@1199SEIU'
  },
  {
    name: 'Actors\' Equity Association',
    organization: 'AEA',
    category: 'union',
    subcategory: 'entertainment',
    influence_score: 82,
    is_organization: true,
    twitter_handle: '@ActorsEquity'
  },

  // Organizations
  {
    name: 'New York Working Families Party',
    organization: 'WFP',
    category: 'nonprofit',
    subcategory: 'political_party',
    influence_score: 85,
    is_organization: true,
    twitter_handle: '@NYWFP'
  },
  {
    name: 'New York City Democratic Socialists of America',
    organization: 'NYC DSA',
    category: 'nonprofit',
    subcategory: 'political_organization',
    influence_score: 80,
    is_organization: true,
    twitter_handle: '@nyc_dsa'
  },
  {
    name: 'Manhattan Democratic Party',
    organization: 'Manhattan Democrats',
    category: 'nonprofit',
    subcategory: 'political_party',
    influence_score: 85,
    is_organization: true
  },
  {
    name: 'Staten Island Democratic Party',
    organization: 'Staten Island Democrats',
    category: 'nonprofit',
    subcategory: 'political_party',
    borough: 'Staten Island',
    influence_score: 75,
    is_organization: true
  },
  {
    name: 'New York Immigration Coalition Action',
    organization: 'NYIC Action',
    category: 'nonprofit',
    subcategory: 'advocacy',
    influence_score: 80,
    is_organization: true,
    twitter_handle: '@thenyic'
  },

  // ERIC ADAMS Endorsers
  {
    name: 'NYC Uniformed Forces Coalition 2025',
    organization: 'NYC UFC 2025',
    category: 'union',
    subcategory: 'law_enforcement',
    influence_score: 85,
    is_organization: true
  },
  {
    name: 'George Santos',
    title: 'Former U.S. Representative',
    organization: 'Former Congress',
    category: 'politician',
    subcategory: 'former_federal_representative',
    influence_score: 30,
    twitter_handle: '@MrSantosNY'
  },
  {
    name: 'Herbert Daughtry',
    title: 'Reverend',
    organization: 'Religious Leader',
    category: 'religious',
    subcategory: 'protestant',
    borough: 'Brooklyn',
    influence_score: 75,
    twitter_handle: '@RevDaughtry'
  },
  {
    name: 'Fernando Mateo',
    title: 'Spokesman',
    organization: 'United Bodegas of America',
    category: 'business',
    subcategory: 'retail',
    influence_score: 70,
    twitter_handle: '@FernandoMateo'
  },
  {
    name: 'Bill Ackman',
    title: 'CEO',
    organization: 'Pershing Square Capital Management',
    category: 'business',
    subcategory: 'finance',
    borough: 'Manhattan',
    influence_score: 88,
    twitter_handle: '@BillAckman'
  },

  // CURTIS SLIWA Endorsers
  {
    name: 'Joann Ariola',
    title: 'City Council Member',
    organization: 'New York City Council',
    category: 'politician',
    subcategory: 'city_council',
    borough: 'Queens',
    influence_score: 65,
    twitter_handle: '@JoannAriola32'
  },
  {
    name: 'Vickie Paladino',
    title: 'City Council Member',
    organization: 'New York City Council',
    category: 'politician',
    subcategory: 'city_council',
    borough: 'Queens',
    influence_score: 68,
    twitter_handle: '@VickiePaladino'
  },
  {
    name: 'Inna Vernikov',
    title: 'City Council Member',
    organization: 'New York City Council',
    category: 'politician',
    subcategory: 'city_council',
    borough: 'Brooklyn',
    influence_score: 62,
    twitter_handle: '@InnaVernikov'
  },
  {
    name: 'Kristy Marmorato',
    title: 'City Council Member',
    organization: 'New York City Council',
    category: 'politician',
    subcategory: 'city_council',
    borough: 'Bronx',
    influence_score: 60,
    twitter_handle: '@KristyMarmorato'
  },
  {
    name: 'David Carr',
    title: 'City Council Member',
    organization: 'New York City Council',
    category: 'politician',
    subcategory: 'city_council',
    borough: 'Staten Island',
    influence_score: 58,
    twitter_handle: '@DavidCarrNYC'
  },
  {
    name: 'Frank Morano',
    title: 'City Council Member',
    organization: 'New York City Council',
    category: 'politician',
    subcategory: 'city_council',
    borough: 'Staten Island',
    influence_score: 55,
    twitter_handle: '@FrankMorano'
  },
  {
    name: 'Queens County Republican Party',
    organization: 'Queens GOP',
    category: 'nonprofit',
    subcategory: 'political_party',
    borough: 'Queens',
    influence_score: 75,
    is_organization: true
  },
  {
    name: 'Bronx County Republican Party',
    organization: 'Bronx GOP',
    category: 'nonprofit',
    subcategory: 'political_party',
    borough: 'Bronx',
    influence_score: 70,
    is_organization: true
  },
  {
    name: 'Kings County Republican Party',
    organization: 'Brooklyn GOP',
    category: 'nonprofit',
    subcategory: 'political_party',
    borough: 'Brooklyn',
    influence_score: 65,
    is_organization: true
  },
  {
    name: 'Staten Island Republican Party',
    organization: 'Staten Island GOP',
    category: 'nonprofit',
    subcategory: 'political_party',
    borough: 'Staten Island',
    influence_score: 80,
    is_organization: true
  },
  {
    name: 'Manhattan Republican Party',
    organization: 'Manhattan GOP',
    category: 'nonprofit',
    subcategory: 'political_party',
    borough: 'Manhattan',
    influence_score: 60,
    is_organization: true
  },
  {
    name: 'Rockland County Republican and Conservative Parties',
    organization: 'Rockland GOP/Conservative',
    category: 'nonprofit',
    subcategory: 'political_party',
    influence_score: 70,
    is_organization: true
  },
  {
    name: 'George Pataki',
    title: 'Former Governor',
    organization: 'Former New York State',
    category: 'politician',
    subcategory: 'former_state_official',
    influence_score: 75,
    twitter_handle: '@GovernorPataki'
  }
];

const endorsements: EndorsementData[] = [
  // ZOHRAN MAMDANI Endorsements
  { endorser_name: 'Elizabeth Warren', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Bernie Sanders', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Alexandria Ocasio-Cortez', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Jerrold Nadler', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Nydia Velázquez', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Pramila Jayapal', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Adriano Espaillat', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Letitia James', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Brad Lander', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Jumaane Williams', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Antonio Delgado', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Andrea Stewart-Cousins', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Brad Hoylman-Sigal', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'John Liu', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Julia Salazar', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Jabari Brisport', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Kristen Gonzalez', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Gustavo Rivera', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Michael Gianaris', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Zellnor Myrie', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Rodneyse Bichotte Hermelyn', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Mark Levine', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Antonio Reynoso', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Adrienne Adams', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },

  // Labor Unions for Mamdani
  { endorser_name: 'District Council 37', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'United Federation of Teachers', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: '32BJ SEIU', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'NYC Central Labor Council AFL-CIO', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Hotel and Gaming Trades Council', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'New York State Nurses Association', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'United Auto Workers Region 9A', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'American Federation of Musicians Local 802', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: '1199SEIU United Healthcare Workers East', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Actors\' Equity Association', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },

  // Organizations for Mamdani
  { endorser_name: 'New York Working Families Party', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'New York City Democratic Socialists of America', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Manhattan Democratic Party', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Staten Island Democratic Party', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'New York Immigration Coalition Action', candidate_name: 'Zohran Mamdani', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },

  // ERIC ADAMS Endorsements
  { endorser_name: 'NYC Uniformed Forces Coalition 2025', candidate_name: 'Eric Adams', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'George Santos', candidate_name: 'Eric Adams', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Herbert Daughtry', candidate_name: 'Eric Adams', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Fernando Mateo', candidate_name: 'Eric Adams', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Bill Ackman', candidate_name: 'Eric Adams', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },

  // CURTIS SLIWA Endorsements
  { endorser_name: 'Joann Ariola', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Vickie Paladino', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Inna Vernikov', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Kristy Marmorato', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'David Carr', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Frank Morano', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Queens County Republican Party', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Bronx County Republican Party', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Kings County Republican Party', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Staten Island Republican Party', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Manhattan Republican Party', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'Rockland County Republican and Conservative Parties', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },
  { endorser_name: 'George Pataki', candidate_name: 'Curtis Sliwa', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') },

  // JIM WALDEN Endorsements
  { endorser_name: 'Cyrus Vance Jr.', candidate_name: 'Jim Walden', source_url: 'https://cityandstateny.com', source_title: 'City & State NY', endorsement_type: 'endorsement', confidence: 'confirmed', endorsed_at: new Date('2024-07-29') }
];

export async function populateEndorsements() {
  try {
    console.log('Starting to populate endorsers and endorsements...');

    // First, ensure candidates exist with proper duplicate checking
    const candidates = [
      { name: 'Zohran Mamdani', party: 'Democrat' },
      { name: 'Eric Adams', party: 'Democrat (Independent)' },
      { name: 'Andrew Cuomo', party: 'Democrat (Independent)' },
      { name: 'Jim Walden', party: 'Independent' },
      { name: 'Curtis Sliwa', party: 'Republican' }
    ];

    for (const candidate of candidates) {
      // Check if candidate already exists
      const existingCandidate = await sql`
        SELECT id FROM candidates WHERE name = ${candidate.name}
      `;
      
      if (existingCandidate.rows.length === 0) {
        await sql`
          INSERT INTO candidates (name, party) 
          VALUES (${candidate.name}, ${candidate.party})
        `;
        console.log(`✅ Added candidate: ${candidate.name}`);
      } else {
        console.log(`⏭️  Candidate already exists: ${candidate.name}`);
      }
    }

    // Insert endorsers with proper duplicate checking
    for (const endorser of endorsers) {
      // Check if endorser already exists by name
      const existingEndorser = await sql`
        SELECT id FROM endorsers WHERE name = ${endorser.name}
      `;
      
      if (existingEndorser.rows.length === 0) {
        await sql`
          INSERT INTO endorsers (
            name, display_name, title, organization, category, subcategory,
            borough, influence_score, twitter_handle, instagram_handle, is_organization
          ) VALUES (
            ${endorser.name}, ${endorser.display_name}, ${endorser.title}, 
            ${endorser.organization}, ${endorser.category}, ${endorser.subcategory},
            ${endorser.borough}, ${endorser.influence_score}, ${endorser.twitter_handle},
            ${endorser.instagram_handle}, ${endorser.is_organization || false}
          )
        `;
        console.log(`✅ Added endorser: ${endorser.name}`);
      } else {
        console.log(`⏭️  Endorser already exists: ${endorser.name}`);
      }
    }

    // Insert endorsements with proper duplicate checking
    for (const endorsement of endorsements) {
      // Check if this specific endorsement already exists
      const existingEndorsement = await sql`
        SELECT e.id 
        FROM endorsements e
        JOIN endorsers er ON e.endorser_id = er.id
        JOIN candidates c ON e.candidate_id = c.id
        WHERE er.name = ${endorsement.endorser_name} 
        AND c.name = ${endorsement.candidate_name}
        AND e.source_url = ${endorsement.source_url}
        AND e.endorsed_at = ${endorsement.endorsed_at.toISOString()}
      `;
      
      if (existingEndorsement.rows.length === 0) {
        await sql`
          INSERT INTO endorsements (
            endorser_id, candidate_id, source_url, source_type, source_title, 
            endorsement_type, confidence, sentiment, strength, endorsed_at
          ) 
          SELECT e.id, c.id, ${endorsement.source_url}, 'website', ${endorsement.source_title},
                 ${endorsement.endorsement_type}, ${endorsement.confidence}, 'positive', 'standard', ${endorsement.endorsed_at.toISOString()}
          FROM endorsers e, candidates c
          WHERE e.name = ${endorsement.endorser_name} 
          AND c.name = ${endorsement.candidate_name}
        `;
        console.log(`✅ Added endorsement: ${endorsement.endorser_name} → ${endorsement.candidate_name}`);
      } else {
        console.log(`⏭️  Endorsement already exists: ${endorsement.endorser_name} → ${endorsement.candidate_name}`);
      }
    }

    console.log('Successfully populated endorsers and endorsements!');
  } catch (error) {
    console.error('Error populating endorsements:', error);
    throw error;
  }
}

// Function to safely populate database with duplicate checking
export async function safePopulateDatabase() {
  try {
    console.log('🚀 Starting safe database population...');
    
    // Check current counts
    const endorserCount = await sql`SELECT COUNT(*) as count FROM endorsers`;
    const endorsementCount = await sql`SELECT COUNT(*) as count FROM endorsements`;
    const candidateCount = await sql`SELECT COUNT(*) as count FROM candidates`;
    
    console.log(`📊 Current database state:`);
    console.log(`   - Endorsers: ${endorserCount.rows[0].count}`);
    console.log(`   - Endorsements: ${endorsementCount.rows[0].count}`);
    console.log(`   - Candidates: ${candidateCount.rows[0].count}`);
    
    // Populate endorsers and endorsements
    await populateEndorsements();
    
    // Check final counts
    const finalEndorserCount = await sql`SELECT COUNT(*) as count FROM endorsers`;
    const finalEndorsementCount = await sql`SELECT COUNT(*) as count FROM endorsements`;
    const finalCandidateCount = await sql`SELECT COUNT(*) as count FROM candidates`;
    
    console.log(`📈 Final database state:`);
    console.log(`   - Endorsers: ${finalEndorserCount.rows[0].count} (added ${finalEndorserCount.rows[0].count - endorserCount.rows[0].count})`);
    console.log(`   - Endorsements: ${finalEndorsementCount.rows[0].count} (added ${finalEndorsementCount.rows[0].count - endorsementCount.rows[0].count})`);
    console.log(`   - Candidates: ${finalCandidateCount.rows[0].count} (added ${finalCandidateCount.rows[0].count - candidateCount.rows[0].count})`);
    
    console.log('✅ Safe database population completed!');
    
  } catch (error) {
    console.error('❌ Error during safe database population:', error);
    throw error;
  }
} 