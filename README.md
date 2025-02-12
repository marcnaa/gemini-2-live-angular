# Gemini 2.0 Realtime API Demo

This project showcases integration with Google's Gemini AI models using the `@google/generative-ai` library. 

Key features include:

*   **Streaming:** Real-time responses from the Gemini 2.0 API via stream
*   **Text Generation:** Natural language responses from the model
*   **Chat:** Interactive conversational capabilities
*   **Search:** Integration with Google Search for up-to-date information
*   **Code Execution:** Python code execution in a sandboxed environment
*   **Function Calling:** API integration and automation through defined functions

## Prerequisites

Before running the application, ensure you have the following:

*   **Angular CLI:**  Make sure you have Angular CLI installed globally (`npm install -g @angular/cli`).
*   **Node.js and npm:**  Ensure Node.js and npm are installed on your system.
*   **Google AI API Key:** Obtain an API key from [Google AI Studio](https://makersuite.google.com/) and set it in the `environment.ts` file.

## Configuration

1.  **Environment Variables:**
    *   Run the command `ng g environments` to create a file named `environment.development.ts` in the `src/environments/` directory.
    *   Add your Google AI API key to the `environment.development.ts` file:

    ```typescript
    export const environment = {
      API_KEY: 'YOUR_GOOGLE_AI_API_KEY',
    };
    ```

2.  **Install Dependencies:**

    Run `npm install` to install the necessary dependencies, including `@google/generative-ai` and other required packages.


## Gemini2LiveAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.