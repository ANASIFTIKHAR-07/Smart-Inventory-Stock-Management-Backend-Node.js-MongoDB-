import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'Set ✓' : 'Missing ✗');
  
  const modelsToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'models/gemini-pro',
    'models/gemini-1.5-pro'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\n🧪 Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Say "Hello" in JSON format: {"message": "Hello"}');
      const text = result.response.text();
      
      console.log(`✅ SUCCESS with ${modelName}`);
      console.log('Response:', text);
      return modelName; // Return the working model
    } catch (error) {
      console.log(`❌ FAILED with ${modelName}:`, error.message);
    }
  }
  
  console.log('\n⚠️ No working model found. Check your API key or quota.');
}

testGemini();
