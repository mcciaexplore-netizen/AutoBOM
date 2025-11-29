
import { GoogleGenAI, Type } from "@google/genai";
import { BOMResult, AppSettings } from "../types";

export const generateBOM = async (
  rateListText: string,
  projectDescription: string,
  files: File[],
  settings: AppSettings
): Promise<BOMResult> => {
  
  const provider = settings.provider;
  const apiKey = provider === 'gemini' ? settings.geminiApiKey : settings.groqApiKey;
  
  if (!apiKey || !apiKey.trim()) {
    throw new Error(`${provider === 'gemini' ? 'Gemini' : 'Groq'} API Key is missing. Please add your API Key in Settings.`);
  }

  const base64Files = await Promise.all(
    files.map(async (file) => {
      const base64Data = await fileToGenerativePart(file);
      return {
        data: base64Data,
        mimeType: file.type,
      };
    })
  );

  const systemPrompt = `
    You are an expert Quantity Surveyor and Estimator for industrial assembly projects (e.g., Aluminum Profile Guarding, Conveyors, Automation).
    
    **Task**: Create a highly detailed Bill of Materials (BOM) & Cost Estimate from the provided drawings and rate list.

    **CONTEXT FROM IMAGES**:
    The images provided are technical drawings. 
    1. **Identify Project Details**: Extract "Project Name", "Drawing Number", "Client Name", "Date", and "Total Assembly Weight" if visible in the title block.
    2. **Analyze "Cut Lists"**: Look for tables in the drawings defining profile lengths (e.g., "Profile 45x90", Length: 1232mm, Qty: 4).
    3. **Calculate Profile Quantities**: 
       - The Rate List typically prices profiles **per Meter**.
       - You MUST calculate the **Total Length** in meters for each profile entry found in the drawing.
       - Formula: (Length_mm * Quantity) / 1000 = Billable Quantity (Meters).
       - Example: "Profile 45x90, L=1232, Qty=4" -> 1.232 * 4 = 4.928 Meters.
    4. **Assembly Breakdown**: If the drawing lists sub-assemblies (e.g., "DOOR ASM-01"), list the components required for them (Profiles, Sheets, Hinges, Handles) as separate line items or grouped clearly.
    5. **Categorization**: Group items strictly into categories numbered like:
       - "1. Aluminum Profiles"
       - "2. Door Assemblies Breakdown" (or similar functional groups)
       - "3. Polycarbonate Sheets" (Calculate Area in Sq.m if needed: L*W)
       - "4. MS Sheet / Top Sheet"
       - "5. Hardware & Accessories"
       - "6. Powder Coating & Finishing"
    6. **Rates**: Use the provided Rate List. If a rate is missing, estimate a market rate in **INR (₹)**.
    
    **Rate List**:
    """
    ${rateListText}
    """

    **User Scope / Notes**:
    """
    ${projectDescription}
    """

    **Output Structure**:
    Return a strictly valid JSON object (no markdown, no extra text) with 'metadata' and 'items'.
    Currency should be "INR".
    
    JSON Schema:
    {
      "metadata": {
        "projectName": "string",
        "drawingNumber": "string",
        "client": "string",
        "date": "string",
        "totalWeight": "string"
      },
      "items": [
        {
          "category": "string (Numbered Category)",
          "item": "string (Item Name)",
          "description": "string (Technical specs)",
          "unit": "string (m, sq.m, nos, kg)",
          "quantity": number,
          "rate": number,
          "amount": number
        }
      ],
      "totalCost": number,
      "currency": "string"
    }
  `;

  if (provider === 'gemini') {
    return generateGeminiBOM(apiKey, base64Files, systemPrompt);
  } else {
    // Pass the model from settings, or default fallback
    const model = settings.groqModel || "llama-3.2-11b-vision-preview";
    return generateGroqBOM(apiKey, model, base64Files, systemPrompt);
  }
};

// --- GEMINI IMPLEMENTATION ---
async function generateGeminiBOM(apiKey: string, files: {data: string, mimeType: string}[], prompt: string): Promise<BOMResult> {
  const ai = new GoogleGenAI({ apiKey });

  const fileParts = files.map(f => ({
    inlineData: {
      data: f.data,
      mimeType: f.mimeType,
    },
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: {
        parts: [
          ...fileParts,
          { text: prompt }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metadata: {
              type: Type.OBJECT,
              properties: {
                projectName: { type: Type.STRING },
                drawingNumber: { type: Type.STRING },
                client: { type: Type.STRING },
                date: { type: Type.STRING },
                totalWeight: { type: Type.STRING },
              }
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "Numbered Category" },
                  item: { type: Type.STRING, description: "Item Name" },
                  description: { type: Type.STRING, description: "Technical specs" },
                  unit: { type: Type.STRING, description: "Unit" },
                  quantity: { type: Type.NUMBER, description: "Billable Quantity" },
                  rate: { type: Type.NUMBER, description: "Unit Rate" },
                  amount: { type: Type.NUMBER, description: "Total Cost" },
                },
                required: ["category", "item", "quantity", "rate", "amount", "unit", "description"],
              },
            },
            totalCost: { type: Type.NUMBER },
            currency: { type: Type.STRING }
          }
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as BOMResult;

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

// --- GROQ IMPLEMENTATION ---
async function generateGroqBOM(apiKey: string, model: string, files: {data: string, mimeType: string}[], prompt: string): Promise<BOMResult> {
  try {
    // Construct messages for OpenAI-compatible endpoint
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...files.map(f => ({
            type: "image_url",
            image_url: {
              url: `data:${f.mimeType};base64,${f.data}`,
            },
          })),
        ],
      },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
        model: model, 
        temperature: 0.1,
        max_tokens: 8000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Groq API Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) throw new Error("No content returned from Groq");

    return JSON.parse(content) as BOMResult;

  } catch (error) {
    console.error("Groq Error:", error);
    throw error;
  }
}

async function fileToGenerativePart(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (!reader.result) {
        reject(new Error("File read failed"));
        return;
      }
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
