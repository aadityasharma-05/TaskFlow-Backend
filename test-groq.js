const Groq = require('groq-sdk');
require('dotenv').config({ path: __dirname + '/.env', override: true });

const apiKey = process.env.GROQ_API_KEY;
console.log('Using API key:', apiKey ? 'Present' : 'Missing');

const groq = new Groq({ apiKey });

async function main() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Hello, what model are you?',
        },
      ],
      model: 'llama-3.1-8b-instant',
    });
    console.log('Success:', chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.error) console.error('Details:', err.error);
  }
}

main();
