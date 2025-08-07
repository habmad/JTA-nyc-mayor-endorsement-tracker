'use client';

import { Header } from '../../components/ui/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Header title="About EndorseNYC" subtitle="Transparency in NYC's 2025 Mayoral Race" />
      
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About EndorseNYC
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform tracking endorsements and coalition building in New York City's 2025 mayoral race.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            EndorseNYC aims to bring transparency to the political process by tracking and analyzing endorsements 
            from influential individuals, organizations, and communities across New York City. We believe that 
            understanding who supports which candidates helps voters make informed decisions about the future 
            of our city.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            By aggregating data from multiple sources and providing real-time updates, we create a comprehensive 
            view of the political landscape that goes beyond traditional polling and media coverage.
          </p>
        </div>

        {/* What We Track */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Endorsements</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3">•</span>
                <span>Political leaders and elected officials</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3">•</span>
                <span>Labor unions and worker organizations</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3">•</span>
                <span>Community groups and nonprofits</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3">•</span>
                <span>Business leaders and organizations</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3">•</span>
                <span>Celebrities and public figures</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3">•</span>
                <span>Official campaign announcements</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3">•</span>
                <span>News articles and media coverage</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3">•</span>
                <span>Social media posts and statements</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3">•</span>
                <span>Press releases and official statements</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3">•</span>
                <span>Public events and rallies</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor endorsements as they happen with our automated data collection system.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Search</h3>
              <p className="text-gray-600">
                Filter endorsements by candidate, endorser type, confidence level, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Data</h3>
              <p className="text-gray-600">
                All endorsements are verified and categorized by confidence level for accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Data Collection</h3>
                <p className="text-gray-700">
                  Our system continuously monitors RSS feeds, news sources, and social media to identify 
                  new endorsements and political statements.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-700">
                  Advanced AI algorithms analyze the content to determine endorsement type, confidence level, 
                  and sentiment of each statement.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Human Verification</h3>
                <p className="text-gray-700">
                  Our team reviews and verifies each endorsement to ensure accuracy and proper categorization.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Public Access</h3>
                <p className="text-gray-700">
                  All verified data is made available to the public through our searchable, filterable platform.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 backdrop-blur-md rounded-2xl p-12 border border-yellow-200 shadow-lg">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Explore?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Start exploring the endorsements and coalition building happening in NYC's 2025 mayoral race. 
              See which communities and leaders are supporting each candidate.
            </p>
            <a 
              href="/" 
              className="inline-block px-8 py-4 text-lg font-medium text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explore Endorsements
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
