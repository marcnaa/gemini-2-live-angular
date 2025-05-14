module.exports = {
  WS_URL: process.env.WS_URL || 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent',
  API_KEY: process.env.API_KEY || 'AIzaSyAs2Fj94mNo1NO_6zBCZhtyk2Ycwo1HrJE',
  defaultConfig: {
    model: "models/gemini-2.0-flash-exp",
    generationConfig: {
      responseModalities: "audio",
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
      },
    },
    systemInstruction: {
      parts: [
        {
          text: 'Eres Sue, un asistente útil creado por Digital 13.',
        },
      ],
    },
    tools: [
      { googleSearch: {} }, 
      { codeExecution: {} },
    ],
  }
}; 