//server.js 
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sessions = {}; 

const SYSTEM_PROMPT = `
You are a chatbot of online clothing merchandise named as "KAYA" your name is "Vastra". It is a luxury website dealing with high quality cloth materials.
 When communicating with a user , you must be able to-
 - Before suggetsing clothes first ask the gender so that you don't give female clothes style to any male user and vice versa 
 - Make sure whatever response you are delivering is in short , don't give long responses.
 - Talk more human like, less rigid and be able to treat our customer as God , avoid using casual slang or overly technical jargon. 
 - understand any requests related to the website and answer them in an easy to understand, step by step way.
 - check users cart and see what items they have, in case they are asking questions about it, and can refer to the items in the cart.
 - suggestion of clothes according to the budget constraint , occassion , function , situation , weather,place (like if the people is visiting any country)
 - It should be able to check the weather in a location by asking the user for their location, and suggest clothes accordingly
 - It can asks the user to select their skin tone by offering 10 or so different options of the most common skin colors, and based on what they choose it should 
   recommend good combinations for their respective skin tone.
 - Should be able to work within a budget. It can asks for a users budget and recommend the best combinations for the price.
 - Should be able to explain how to take care of the products to make it last longing like suggestion for washing, or dry processing.
 - Using sentiment analysis, you should know when a user is too frustrated, and escelate the situation to a human customer support agent, after which it will stop 
 responding in the chat and give access to customer service by providing the phone number 
`;

const clothingData = JSON.parse(fs.readFileSync('./products.json', 'utf8'));

app.post("/api/chat", async (req, res) => {
   try {
 const { sessionId, userMessage } = req.body;
 if (!sessionId || !userMessage)
  return res.status(400).json({ error: "sessionId and userMessage required" });

 if (!sessions[sessionId]) sessions[sessionId] = [];
 sessions[sessionId].push({ role: "user", content: userMessage });
    
    const lowerCaseMessage = userMessage.toLowerCase();
    let productFound = null;

    for (const product of clothingData) {
        const isMatch = product.keywords.some(keyword => lowerCaseMessage.includes(keyword));
        if (isMatch) {
            productFound = product;
            break;
        }
    }

    if (productFound) {
        const assistantReply = `We have the "${productFound.name}" available. It costs $${productFound.price}. It is a "${productFound.description}". Would you like to know its care instructions?`;
        
        sessions[sessionId].push({ role: "assistant", content: assistantReply });
        
        return res.json({ reply: assistantReply });
    }

    const historyText = sessions[sessionId]
        .map((m) => (m.role === "user" ? `User: ${m.content}` : `Assistant: ${m.content}`))
        .join("\n");

    const fullInput = `
System Instruction: ${SYSTEM_PROMPT}

Conversation so far:
${historyText}

User: ${userMessage}
Assistant:
`;

    // Only call the Gemini API if a product was NOT found
 const response = await ai.models.generateContent({
  model: "gemini-2.5-pro", 
 contents: fullInput,
 config: {
 temperature: 0.6,
 systemInstruction: SYSTEM_PROMPT,
 },
 });

 const assistantReply = response.text?.trim() || "Sorry, no response.";

 sessions[sessionId].push({ role: "assistant", content: assistantReply });

 res.json({ reply: assistantReply });
 } catch (err) {
 console.error("Chat error:", err);
 res.status(500).json({ error: "LLM request failed", details: err.message });
 }
 console.log("Current History: ",sessionId,sessions[sessionId]);
});

app.get("/api/chat/history",(req,res)=>{
 const {sessionId}=req.params;
 const history=sessions[sessionId];
 if(!history) return res.status (404).json({error:"Session for this id is not found!!"});
 res.json({sessionId,history});
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
