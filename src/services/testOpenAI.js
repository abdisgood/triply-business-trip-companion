// Simple test to verify OpenAI API key is working
import OpenAI from 'openai';

export const testOpenAIConnection = async () => {
  try {
    console.log('Testing OpenAI API connection...');
    console.log('API Key present:', !!process.env.REACT_APP_OPENAI_API_KEY);
    console.log('API Key starts with:', process.env.REACT_APP_OPENAI_API_KEY ? process.env.REACT_APP_OPENAI_API_KEY.substring(0, 7) + '...' : 'NOT SET');
    
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found in environment variables');
    }

    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    // Simple test call
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'OpenAI API is working!' in exactly 5 words."
        }
      ],
      max_tokens: 10
    });

    console.log('✅ OpenAI API test successful:', response.choices[0].message.content);
    return { success: true, message: response.choices[0].message.content };
  } catch (error) {
    console.error('❌ OpenAI API test failed:', error);
    return { success: false, error: error.message };
  }
}; 