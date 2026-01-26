# Implementation Plan: Marketplace Mandi

## Overview

This implementation plan breaks down the Marketplace Mandi platform into discrete coding tasks that build incrementally. The platform will be implemented using TypeScript with Next.js for the frontend and Node.js with Express for the backend, following the microservices architecture outlined in the design document.

## Tasks

- [x] 1. Project Setup and Core Infrastructure
  - Set up Next.js frontend with TypeScript and Tailwind CSS
  - Initialize Node.js backend with Express and TypeScript
  - Configure PostgreSQL database with initial schema
  - Set up Redis for caching and session management
  - Configure environment variables and basic project structure
  - _Requirements: All requirements depend on basic infrastructure_

- [ ] 2. Database Schema and Models
  - [x] 2.1 Create database tables and relationships
    - Implement users, product_listings, messages, chats, price_data, categories tables
    - Set up foreign key relationships and indexes
    - Create database migration scripts
    - _Requirements: 1.4, 2.2, 4.2, 7.1, 8.5_

  - [ ]* 2.2 Write property test for database schema integrity
    - **Property 17: Data Storage Metadata Completeness**
    - **Validates: Requirements 8.5**

  - [x] 2.3 Implement TypeScript data models and interfaces
    - Create User, ProductListing, Message, Chat, PriceData interfaces
    - Implement data validation schemas using Zod
    - Set up database connection and ORM (Prisma or TypeORM)
    - _Requirements: 1.2, 2.1, 4.2, 8.5_

- [ ] 3. Authentication and User Management System
  - [x] 3.1 Implement user registration and authentication
    - Create registration API with phone number verification
    - Implement JWT-based authentication system
    - Set up OTP verification for phone numbers
    - Create user profile management endpoints
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 3.2 Write property test for user registration completeness
    - **Property 1: User Registration Completeness**
    - **Validates: Requirements 1.2, 1.4**

  - [x] 3.3 Implement multilingual user interface setup
    - Configure next-i18next for 22 Indian languages
    - Create language selection component
    - Implement user preference storage and retrieval
    - _Requirements: 1.3, 1.5_

  - [ ]* 3.4 Write property test for language support universality
    - **Property 2: Language Support Universality**
    - **Validates: Requirements 1.3, 1.5, 6.1**

- [ ] 4. Product Listing Management
  - [x] 4.1 Create listing CRUD operations
    - Implement create, read, update, delete APIs for product listings
    - Add form validation for required fields
    - Set up image upload and storage functionality
    - Create listing status management (active, sold, expired)
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [ ]* 4.2 Write property test for listing creation with price insights
    - **Property 3: Listing Creation with Price Insights**
    - **Validates: Requirements 2.1, 2.3**

  - [ ]* 4.3 Write property test for listing lifecycle management
    - **Property 4: Listing Lifecycle Management**
    - **Validates: Requirements 2.4, 2.5**

  - [ ] 4.4 Implement listing search and filtering
    - Create search API with text search capabilities
    - Implement category, location, price range, and rating filters
    - Add search result ranking by relevance, proximity, and reputation
    - Set up search indexing and caching
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 4.5 Write property test for search functionality completeness
    - **Property 11: Search Functionality Completeness**
    - **Validates: Requirements 6.2, 6.3**

- [ ] 5. Checkpoint - Core Platform Functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Price Discovery Engine
  - [ ] 6.1 Implement price data collection system
    - Create web scraping service for IndiaMART, Amazon, Flipkart
    - Implement government API integration for MSP and mandi prices
    - Set up data validation and confidence scoring
    - Create scheduled jobs for daily data collection
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 6.2 Write property test for data collection reliability
    - **Property 16: Data Collection Reliability**
    - **Validates: Requirements 8.1, 8.2, 8.3**

  - [ ] 6.3 Build price insight calculation engine
    - Implement price range calculation using multiple data sources
    - Create market trend analysis (rising/falling/stable)
    - Add confidence score calculation based on data quality
    - Implement data freshness tracking and warnings
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 6.4 Write property test for price discovery completeness
    - **Property 5: Price Discovery Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ]* 6.5 Write property test for data freshness handling
    - **Property 6: Data Freshness Handling**
    - **Validates: Requirements 3.4, 3.5**

- [ ] 7. Multilingual Translation System
  - [ ] 7.1 Integrate Azure Translator API
    - Set up Azure Translator service integration
    - Implement translation caching to reduce API calls
    - Create language detection functionality
    - Add translation confidence scoring
    - _Requirements: 4.1, 4.2_

  - [ ]* 7.2 Write property test for translation system integrity
    - **Property 7: Translation System Integrity**
    - **Validates: Requirements 4.1, 4.2, 4.5**

  - [ ] 7.3 Implement translation error handling
    - Add fallback mechanisms for translation failures
    - Create translation status indicators for UI
    - Implement graceful degradation when translation service is unavailable
    - _Requirements: 4.3, 4.4_

  - [ ]* 7.4 Write property test for translation error handling
    - **Property 8: Translation Error Handling**
    - **Validates: Requirements 4.3, 4.4**

- [ ] 8. Real-time Chat System
  - [ ] 8.1 Implement WebSocket-based chat
    - Set up Socket.io for real-time messaging
    - Create chat room management (buyer-seller pairs)
    - Implement message storage with original and translated versions
    - Add typing indicators and online status
    - _Requirements: 4.2, 4.5_

  - [ ] 8.2 Integrate chat with translation system
    - Connect chat messages to translation service
    - Implement real-time message translation display
    - Add translation status indicators in chat UI
    - Create message history with both original and translated versions
    - _Requirements: 4.2, 4.3, 4.5_

  - [ ]* 8.3 Write unit tests for chat functionality
    - Test message sending and receiving
    - Test translation integration
    - Test error handling scenarios
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 9. AI Negotiation Assistant
  - [ ] 9.1 Implement AI service integration
    - Set up OpenAI GPT-4 or Claude API integration
    - Create prompt templates for negotiation analysis
    - Implement sentiment analysis for chat messages
    - Add context management for negotiation history
    - _Requirements: 5.1, 5.2_

  - [ ]* 9.2 Write property test for AI negotiation advisory constraints
    - **Property 9: AI Negotiation Advisory Constraints**
    - **Validates: Requirements 5.1, 5.3, 5.5**

  - [ ] 9.3 Build negotiation suggestion engine
    - Implement counter-offer calculation logic
    - Create negotiation strategy recommendations
    - Add market trend and reputation factor integration
    - Ensure AI suggestions never auto-send messages
    - _Requirements: 5.2, 5.3_

  - [ ]* 9.4 Write property test for AI negotiation context awareness
    - **Property 10: AI Negotiation Context Awareness**
    - **Validates: Requirements 5.2**

- [ ] 10. Trust and Reputation System
  - [ ] 10.1 Implement reputation calculation system
    - Create rating collection after deal completion
    - Implement weighted reputation scoring (recent ratings weighted more)
    - Add verified seller badge logic for high-rated sellers
    - Create reputation display components
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 10.2 Write property test for reputation system consistency
    - **Property 13: Reputation System Consistency**
    - **Validates: Requirements 7.1, 7.2, 10.4**

  - [ ] 10.3 Integrate reputation with AI system
    - Connect user reputation data to AI negotiation engine
    - Implement reputation-based negotiation strategy adjustments
    - Add reputation factors to counter-offer calculations
    - _Requirements: 7.5_

  - [ ]* 10.4 Write property test for AI reputation integration
    - **Property 15: AI Reputation Integration**
    - **Validates: Requirements 7.5**

- [ ] 11. Deal Management System
  - [ ] 11.1 Implement deal tracking and completion
    - Create deal confirmation interfaces
    - Implement deal status tracking (pending, completed, cancelled)
    - Add negotiation history storage and display
    - Create deal completion workflow with rating prompts
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 11.2 Write property test for deal management completeness
    - **Property 21: Deal Management Completeness**
    - **Validates: Requirements 10.1, 10.3, 10.5**

  - [ ] 11.3 Connect deal completion to reputation system
    - Trigger reputation updates on deal completion
    - Implement rating prompt system for both parties
    - Add deal outcome tracking for reputation calculation
    - _Requirements: 10.2, 10.4_

- [ ] 12. Checkpoint - Core Features Integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Frontend User Interface
  - [ ] 13.1 Build responsive web interface
    - Create mobile-first responsive design with Tailwind CSS
    - Implement touch-optimized controls for mobile devices
    - Build registration and login forms with validation
    - Create product listing creation and management interfaces
    - _Requirements: 9.1, 9.3, 9.4_

  - [ ]* 13.2 Write property test for mobile functionality parity
    - **Property 19: Mobile Functionality Parity**
    - **Validates: Requirements 9.1, 9.3**

  - [ ] 13.3 Implement search and discovery interface
    - Create search interface with filters and sorting
    - Build product listing display components
    - Implement search result pagination and loading states
    - Add empty state handling with suggestions
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 13.4 Write property test for search result prioritization
    - **Property 12: Search Result Prioritization**
    - **Validates: Requirements 6.5**

  - [ ] 13.5 Build chat and negotiation interface
    - Create real-time chat UI with translation indicators
    - Implement AI negotiation suggestion panel
    - Add deal confirmation and completion interfaces
    - Build user profile and reputation display components
    - _Requirements: 4.3, 5.3, 10.1, 7.3_

- [ ] 14. System Resilience and Error Handling
  - [ ] 14.1 Implement comprehensive error handling
    - Add graceful degradation for external service failures
    - Implement retry logic with exponential backoff
    - Create user-friendly error messages and fallback states
    - Add system health monitoring and logging
    - _Requirements: 8.4_

  - [ ]* 14.2 Write property test for system resilience
    - **Property 18: System Resilience**
    - **Validates: Requirements 8.4**

  - [ ] 14.3 Add form validation and user feedback
    - Implement comprehensive form validation with clear error messages
    - Add loading states and progress indicators
    - Create validation feedback for all user inputs
    - _Requirements: 9.4_

  - [ ]* 14.4 Write property test for form validation clarity
    - **Property 20: Form Validation Clarity**
    - **Validates: Requirements 9.4**

- [ ] 15. Integration and Final Wiring
  - [ ] 15.1 Connect all system components
    - Wire frontend to all backend APIs
    - Integrate real-time features (chat, notifications)
    - Connect AI suggestions to chat interface
    - Ensure price insights display in listing views
    - _Requirements: All requirements integration_

  - [ ]* 15.2 Write integration tests for end-to-end workflows
    - Test complete user registration to deal completion flow
    - Test multilingual communication workflows
    - Test price discovery and AI negotiation integration
    - _Requirements: All requirements_

  - [ ] 15.3 Performance optimization and caching
    - Implement Redis caching for frequently accessed data
    - Optimize database queries and add proper indexing
    - Add image optimization and CDN integration
    - Implement API rate limiting and request throttling
    - _Requirements: Performance aspects of all requirements_

- [ ] 16. Final Checkpoint - Complete System Validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows the microservices architecture outlined in the design
- All external API integrations include proper error handling and fallback mechanisms
- The system is designed to be resilient and continue operating even when some services are unavailable