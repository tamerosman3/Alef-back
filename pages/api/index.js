import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let chatLog = []; // initialize an empty chat log array

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const input = req.body.animal || '';
  if (input.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid input",
      }
    });
    return;
  }

  chatLog.push({ role: "user", content: input }); // add user input to chat log

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: chatLog, // pass chat log to generatePrompt function
      temperature: 0,
      max_tokens: 100,
    });
    const outputString = completion.data.choices[0].message.content;
    chatLog.push({ role: "assistant", content: outputString }); // add AI response to chat log
    res.status(200).json({ result: outputString });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}
