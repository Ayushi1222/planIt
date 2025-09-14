import { GoogleGenAI, Type, Chat, Content } from "@google/genai";
import type { Preferences, Itinerary, GroundingMetadataSource, SavedPlan, ManualActivity } from '../shared/types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const itineraryResponseSchema: any = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy, short, and descriptive title for the entire weekend plan. For example, 'Varanasi Voyage: A Spiritual & Culinary Journey'." },
        totalEstimatedCost: { type: Type.STRING, description: "The total estimated cost for the entire weekend plan. This should be a single string, e.g., 'Approx. ₹4,500'." },
        itinerary: {
            type: Type.ARRAY,
            description: "An array of daily plans, covering all requested days.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "The day of the week and date. MUST be 'Saturday, [Date]' or 'Sunday, [Date]' etc." },
                    theme: { type: Type.STRING, description: "A short theme for the day's activities (e.g., 'Spiritual Sunrise & Silk Weaving')." },
                    activities: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                time: { type: Type.STRING, description: "Suggested time for the activity (e.g., '8:00 PM', '11:00 AM - 1:00 PM'). This field is mandatory." },
                                title: { type: Type.STRING, description: "The name of the activity or place (e.g., 'Evening Ganga Aarti at Dashashwamedh Ghat')." },
                                description: { type: Type.STRING, description: "A brief, appealing description of the activity, including a pro-tip." },
                                location: {
                                    type: Type.OBJECT,
                                    description: "The location of the activity. Must contain at least an address.",
                                    properties: {
                                        name: { type: Type.STRING, description: "The optional name of the place (e.g., 'Kashi Vishwanath Temple')." },
                                        address: { type: Type.STRING, description: "The full, specific address of the location." }
                                    },
                                    required: ['address']
                                },
                                category: {
                                    type: Type.STRING,
                                    enum: ['Dining', 'Entertainment', 'Relaxation', 'Activity', 'Nightlife', 'Shopping', 'Culture', 'History & Heritage', 'Nature & Parks', 'Special Event', 'Outdoor Activities', 'Travel', 'Art & Culture', 'Live Music'],
                                    description: "The category of the activity. Use 'Special Event' for time-sensitive events you discover."
                                },
                                estimatedCost: { type: Type.STRING, description: "An estimated cost for this specific activity (e.g., 'Approx. ₹1200', 'Free'). This field is mandatory." },
                                isSpecialEvent: {
                                    type: Type.BOOLEAN,
                                    description: "Set to true if this is a specific, date-sensitive event (like a concert, festival, or exhibition) you discovered."
                                },
                                bookingPartner: {
                                    type: Type.STRING,
                                    enum: ['Zomato', 'BookMyShow', 'Internal'],
                                    description: "Suggested booking partner, if applicable.",
                                    nullable: true,
                                },
                                travelInfo: {
                                    type: Type.OBJECT,
                                    description: "Details on the travel from the previous location to this activity. For the first activity of the day, this is from the user's home.",
                                    properties: {
                                        mode: { type: Type.STRING, description: "Recommended mode of transport (e.g., 'Ride-Sharing', 'Auto-Rickshaw', 'Walk')." },
                                        duration: { type: Type.STRING, description: "Estimated travel time (e.g., 'Approx. 15 mins')." },
                                    },
                                    required: ['mode', 'duration']
                                },
                            },
                            required: ['time', 'title', 'description', 'location', 'category', 'estimatedCost', 'isSpecialEvent', 'travelInfo']
                        }
                    }
                },
                required: ['day', 'theme', 'activities']
            }
        }
    },
    required: ['title', 'totalEstimatedCost', 'itinerary']
};

const ideasResponseSchema: any = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Dining', 'Outdoors', 'Relaxing', 'Entertainment', 'Family', 'Culture'] },
            notes: { type: Type.STRING, description: "A short, engaging one-sentence description for the activity." }
        },
        required: ['title', 'category', 'notes']
    }
};

const cleanJsonText = (text: string) => {
    if (!text || typeof text.indexOf !== 'function') {
        console.error("Received invalid text input for JSON cleaning:", text);
        throw new Error("Received no response from the AI architect.");
    }
    let cleanText = text.replace(/^```json/, '').replace(/```$/, '').trim();
    const jsonStart = cleanText.indexOf('{');
    const arrayStart = cleanText.indexOf('[');
    
    let firstBracket = -1;
    if (jsonStart !== -1 && arrayStart !== -1) {
        firstBracket = Math.min(jsonStart, arrayStart);
    } else if (jsonStart !== -1) {
        firstBracket = jsonStart;
    } else {
        firstBracket = arrayStart;
    }

    if (firstBracket === -1) {
         console.error("Failed to find a valid JSON object or array in the text.", { text });
        throw new Error("Received malformed JSON from the AI architect.");
    }

    const lastObjectBracket = cleanText.lastIndexOf('}');
    const lastArrayBracket = cleanText.lastIndexOf(']');
    const lastBracket = Math.max(lastObjectBracket, lastArrayBracket);

    const jsonString = cleanText.substring(firstBracket, lastBracket + 1);
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON string:", e);
        console.error("Original text from AI:", text);
        throw new Error("Received malformed JSON from the AI architect.");
    }
}

const getSystemInstruction = (preferences: Preferences) => {
    const city = preferences.location.address.split(',').slice(-2, -1)[0]?.trim() || 'the user\'s specified city';
    return `
You are "planIt"—a world-class AI concierge and expert on ${city}. Your mission is to craft a hyper-personalized, logistically flawless weekend itinerary.
PRIMARY DIRECTIVES:
1.  LOCATION IS PARAMOUNT: Generate an itinerary ONLY for ${city}.
2.  JSON ONLY & SCHEMA PERFECT: Your output MUST be a single, valid JSON object that strictly conforms to the provided schema. No prose or markdown.
3.  HARD CONSTRAINTS: Strictly satisfy all user preferences:
    -   Dates: ${preferences.dates.start} to ${preferences.dates.end}
    -   Budget (per person): ${preferences.budget}
    -   Vibe: ${preferences.vibe}; Group: ${preferences.group}
    -   Interests: ${preferences.interests.join(', ')}
    -   Pace: ${preferences.pace}
4. LOGISTICS & REALISM: Group activities geographically to minimize travel. Ensure commute times in \`travelInfo\` are realistic for ${city}.
5. SPECIAL EVENTS: For each day, try to find one real, time-sensitive event in ${city} matching the user’s interests and dates. Set \`isSpecialEvent\` to \`true\` for these.
`;
};

export const generateItinerary = async (preferences: Preferences): Promise<Itinerary> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Please generate the initial itinerary based on my preferences.",
            config: {
                systemInstruction: getSystemInstruction(preferences),
                temperature: 0.3,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                responseSchema: itineraryResponseSchema,
            },
        });

        const text = response.text;
        if (!text) {
            console.error("Gemini API returned an empty text response.", { response });
            const finishReason = response.candidates?.[0]?.finishReason;
            if (finishReason && finishReason !== 'STOP') {
                throw new Error(`The AI's response was blocked due to: ${finishReason}.`);
            }
            throw new Error("The AI architect provided an empty response.");
        }

        const parsedData = cleanJsonText(text);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web) as GroundingMetadataSource[] || [];

        return {
            ...parsedData,
            preferences: preferences,
            sources: sources.filter(s => s && s.uri)
        } as Itinerary;

    } catch (error) {
        console.error("Error generating itinerary from Gemini API:", error);
        throw error;
    }
};

export const generateIdeas = async (prompt: string): Promise<Omit<ManualActivity, 'id'>[]> => {
    try {
        const fullPrompt = `Based on the following request, generate a list of 5 creative and relevant weekend activity ideas. The request is: "${prompt}".`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                responseMimeType: "application/json",
                responseSchema: ideasResponseSchema,
            },
        });
        const text = response.text;
         if (!text) {
             throw new Error("The AI provided an empty response for ideas.");
         }
        return cleanJsonText(text);
    } catch (error) {
         console.error("Error generating ideas from Gemini API:", error);
        throw error;
    }
};


export const initializeChatFromPlan = (plan: SavedPlan): Chat => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: plan.chatHistory || [],
        config: {
            systemInstruction: getSystemInstruction(plan.preferences),
        }
    });
    return chat;
};

export const continueItineraryChat = async (
    chat: Chat,
    userInput: string,
    preferences: Preferences,
): Promise<{ updatedItinerary: Itinerary; updatedHistory: Content[] }> => {
    try {
        const prompt = `Please update the itinerary based on this request: "${userInput}". Important: Your entire response must be ONLY the raw, updated JSON object for the itinerary, conforming to the original schema. Do not include markdown, comments, or any other text.`;

        const result = await chat.sendMessage({ message: prompt });
        const text = result.text;
        
        if (!text) {
             const finishReason = result.candidates?.[0]?.finishReason;
            if (finishReason && finishReason !== 'STOP') {
                throw new Error(`The AI's response was blocked due to: ${finishReason}.`);
            }
            throw new Error("The AI architect provided an empty response for the update.");
        }
        
        const parsedData = cleanJsonText(text);
        const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web) as GroundingMetadataSource[] || [];
        
        const updatedItinerary: Itinerary = {
            ...parsedData,
            preferences: preferences,
            sources: sources.filter(s => s && s.uri),
        };

        const updatedHistory = await (chat as any).getHistory();
        return { updatedItinerary, updatedHistory };

    } catch (error) {
        console.error("Error continuing itinerary chat:", error);
        if (error instanceof Error && error.message.includes("JSON")) {
             throw new Error("The AI returned an invalid plan structure. Please try rephrasing your request.");
        }
        throw error;
    }
};
