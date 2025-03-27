# Gemini 2.0 Live API Demo

## Overview
This project showcases Gemini 2.0 real-time multimodal AI capabilities in a web application using Angular. Currently the Live API is only available for `Gemini 2.0 Flash Experimental`.

This project demonstrates integration with Google's Gemini AI models through the `@google/genai` library now in (Technical) [Preview](https://github.com/googleapis/js-genai/commit/da38b6df88705c8ff1ea9a2e1c5ffa596054b382).

> This project started as a migration to Angular of the [Live API - Web console](https://github.com/google-gemini/multimodal-live-api-web-console) as is only available in React at the moment.

## Core Features
- Starter kit based on [Live API - Web console](https://github.com/google-gemini/multimodal-live-api-web-console)
- TypeScript GenAI SDK for Gemini 2.0 API
- Real-time streaming voice from and to Gemini 2.0 API
- Real-time streaming video from webcam or screen to Gemini 2.0 API
- Natural language text generation
- Interactive chat functionality
- Google Search integration for current information
- Secure Python code execution in sandbox
- Automated function calling for API integration
- Live transcription for streamed audio (user and model) via Deepgram API (optional)

## What's Gemini 2.0 Live?

Gemini Live API enables a new generation of dynamic, multimodal AI real-time experiences.

### Gemini Live (available on Pixel 9)
Gemini Live powers innovative applications across devices and platforms:

- **Hands-free AI Assistance**: Users interact naturally through voice while cooking, driving, or multitasking
- **Real-time Visual Understanding**: Get instant AI responses as you show objects, documents, or scenes through your camera
- **Smart Home Automation**: Control your environment with natural voice commands - from adjusting lights to managing thermostats
- **Seamless Shopping**: Browse products, compare options, and complete purchases through conversation
- **Live Problem Solving**: Share your screen to get real-time guidance, troubleshooting, or explanations
- **Integration with Google services**: leverage existing Google services like Search or Maps to enhance its capabilities

[![Gemini Live on Pixel 9](https://img.youtube.com/vi/mNTGbi5ReMc/0.jpg)](https://www.youtube.com/watch?v=mNTGbi5ReMc)

### Project Astra

Project Astra is a research initiative aimed at developing a universal AI assistant with advanced capabilities. It's designed to process multimodal information, including text, speech, images, and video, allowing for a more comprehensive understanding of user needs and context.

![Project Astra](https://i.imgur.com/VEPikJN.png)

[More details](https://deepmind.google/technologies/project-astra/)

## Setup Instructions

### System Requirements
- Node.js and npm (latest stable version)
- Angular CLI (globally installed via `npm install -g @angular/cli`)
- Google AI API key from [Google AI Studio](https://makersuite.google.com/)
- Deepgram API key from [Deepgram](https://deepgram.com/) (optional)

> Note that currently `Gemini 2.0 Flash Experimental` (audio modality) doesn't send any transcript which may confuse you. We are using Deepgram to transcribe both the user's audio and the model's audio. To enable it just create an Api Key and add it to the development environment.

### Installation Steps

1. **Set Up Environment Variables**
   ```bash
   ng g environments
   ```
   Create `environment.development.ts` in `src/environments/` with:
   ```typescript
   export const environment = {
     API_KEY: 'YOUR_GOOGLE_AI_API_KEY',
     DEEPGRAM_API_KEY: 'YOUR_DEEPGRAM_API_KEY', // optional
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
let config: LiveConnectConfig = {
   // For text responses in chat window
   responseModalities: [Modality.TEXT], // note "audio" doesn't send a text response over
   
   // For audio responses (uncomment to enable)
   // responseModalities: [Modality.AUDIO],
   // speechConfig: {
   //   voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
   // },
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
- Built with Angular CLI version 19.2.3
- Logging state management including Dev Tools with NgRx version 19.0.1
- TypeScript GenAI SDK version 0.6.1
- Features automatic reload during development
- Includes production build optimizations

## Additional Resources
- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Google AI Studio](https://makersuite.google.com/)
- Browser Developer Tools for debugging
