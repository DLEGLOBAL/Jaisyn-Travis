import { GoogleGenAI } from "@google/genai";
import { Contestant, User } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are "CupidBot", the sassy, chaotic, and high-energy host of a dating elimination show called "LovePop".
Your job is to provide commentary on the contestants and the picker's choices.
You should be funny, slightly roast-y, but ultimately helpful in a reality-TV way.
Keep responses short (under 50 words) and punchy.
`;

export type AIMode = 'INTRO' | 'POP' | 'ADVICE' | 'ROAST' | 'ICEBREAKER' | 'WINGMAN' | 'TRUTH';

export const getAICommentary = async (
  contestants: Contestant[],
  action: AIMode,
  targetId?: string
): Promise<string> => {
  try {
    const activeContestants = contestants.filter(c => c.status === 'ACTIVE');
    const target = contestants.find(c => c.id === targetId);
    
    let prompt = "";

    switch (action) {
      case 'INTRO':
        prompt = `Introduce the show! We have ${activeContestants.length} contestants looking for love. Mention the high stakes.`;
        break;
      case 'POP':
        prompt = `The picker just POPPED the balloon for ${target?.name} (${target?.job}). Roast them slightly for being eliminated!`;
        break;
      case 'ADVICE':
        prompt = `Give the Picker advice on who to keep based on these bios: ${activeContestants.map(c => c.name + ':' + c.bio).join(', ')}.`;
        break;
      case 'ROAST':
        prompt = `Look at the remaining contestants (${activeContestants.map(c => c.name).join(', ')}). Pick one and roast their job or vibe specifically. Be savage but fun.`;
        break;
      case 'ICEBREAKER':
        prompt = `Generate a spicy, specific icebreaker question for the Picker to ask the group.`;
        break;
      case 'WINGMAN':
        prompt = `Whisper a secret "Wingman" tip to the Picker about how to flirt effectively right now.`;
        break;
      case 'TRUTH':
        prompt = `Analyze the vibe. Is ${target?.name || "someone"} lying about their bio? Give a playful "Truth Detection" result.`;
        break;
      default:
        prompt = "Say something chaotic.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
      }
    });

    return response.text || "System overload! Too much hotness!";
  } catch (error) {
    console.error("AI Error:", error);
    return "CupidBot is rebooting... wait for it...";
  }
};

export const generateProfileTheme = async (prompt: string, user: User): Promise<string> => {
  try {
    const avatar = user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
    
    const htmlPrompt = `
      You are an expert Frontend Designer. Create a single, self-contained HTML/CSS string for a User Profile Card.
      
      User Data to Embed:
      - Username: ${user.username}
      - Bio: ${user.bio || 'No bio yet.'}
      - Avatar URL: ${avatar}
      - Followers: ${user.followers || 0}
      - Following: ${user.following || 0}

      User Request: "${prompt}"

      Constraints:
      1. Return ONLY the raw HTML string. Do NOT include \`\`\`html or markdown blocks.
      2. Use internal <style> tags for CSS. 
      3. The container should be responsive (max-width: 100%).
      4. Make it visually stunning and matching the User Request vibe.
      5. Ensure text is readable.
      6. Do NOT include <html>, <head>, or <body> tags. Just the container <div> and its contents/styles.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: htmlPrompt,
    });

    let code = response.text || "";
    // Clean up potential markdown if the model hallucinates it
    code = code.replace(/```html/g, '').replace(/```/g, '').trim();
    return code;

  } catch (error) {
    console.error("AI HTML Gen Error:", error);
    return "<div style='color:white'>AI Generator Failed. Try again!</div>";
  }
};