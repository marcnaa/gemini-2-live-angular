# Gemini 2.0 Live API Demo

## Overview
This project showcases Gemini 2.0 real-time multimodal AI capabilities in a web application using Angular.

This project demonstrates integration with Google's Gemini AI models through the `@google/generative-ai` library.

## Core Features
- Real-time streaming voice responses from Gemini 2.0 API
- Natural language text generation
- Interactive chat functionality
- Google Search integration for current information
- Secure Python code execution in sandbox
- Automated function calling for API integration

## Setup Instructions

### System Requirements
- Node.js and npm (latest stable version)
- Angular CLI (globally installed via `npm install -g @angular/cli`)
- Google AI API key from [Google AI Studio](https://makersuite.google.com/)

### Installation Steps

1. **Set Up Environment Variables**
   ```bash
   ng g environments
   ```
   Create `environment.development.ts` in `src/environments/` with:
   ```typescript
   export const environment = {
     API_KEY: 'YOUR_GOOGLE_AI_API_KEY',
   };
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Usage Guide

### Getting Started
1. Launch the application and click the `Connect` button under `Connection Status`
2. The demo uses Gemini 2.0 LIVE API which requires a WebSocket connection
3. Monitor the browser's Developer Tools Console for connection issues
4. Before diving into development, explore Gemini 2.0's Live capabilities (voice interactions, webcam, and screen sharing) using [Google AI Studio Live](https://aistudio.google.com/live). This interactive playground will help you understand the available features and integration options before implementing them in your project.

### Feature Testing Examples
Test the various capabilities using these example prompts:

1. **Google Search Integration**
   - "Tell me the scores for the last 3 games of FC Barcelona."

2. **Code Execution**
   - "What's the 50th prime number?"
   - "What's the square root of 342.12?"

3. **Function Calling**
   - "What's the weather in London?" (Note: Currently returns mock data of 25 degrees)

### Configuration Options

The main configuration is handled in `src/app.component`. You can toggle between audio and text modalities:

```typescript
let config: LiveConfig = {
  model: "models/gemini-2.0-flash-exp",
  generationConfig: {
    // For text responses in chat window
    responseModalities: "text",
    
    // For audio responses (uncomment to enable)
    // responseModalities: "audio",
    // speechConfig: {
    //   voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
    // },
  },
}
```

### Usage Limits
- Daily and session-based limits apply
- Token count restrictions to prevent abuse
- If limits are exceeded, wait until the next day to resume

## Development Guide

### Local Development
Start the development server:
```bash
ng serve
```
Access the application at `http://localhost:4200/`

### Available Commands

1. **Generate New Components**
   ```bash
   ng generate component component-name
   ```

2. **Build Project**
   ```bash
   ng build
   ```
   Build artifacts will be stored in the `dist/` directory

3. **Run Tests**
   - Unit Tests:
     ```bash
     ng test
     ```
   - E2E Tests:
     ```bash
     ng e2e
     ```
     Note: Select and install your preferred E2E testing framework

## Project Information
- Built with Angular CLI version 19.1.6
- Features automatic reload during development
- Includes production build optimizations

## Additional Resources
- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Google AI Studio](https://makersuite.google.com/)
- Browser Developer Tools for debugging