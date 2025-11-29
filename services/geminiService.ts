import { GoogleGenAI, Type } from "@google/genai";
import { BOMResult } from "../types";

export const generateBOM = async (
  rateListText: string,
  projectDescription: string,
  files: File[],
  userApiKey?: string
): Promise<BOMResult> => {
  
  // Use user provided key, fallback to env var, or throw error
  const apiKey = userApiKey || process.env.API_KEY || "";
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please add your API Key in Settings.");
  }

  // Initialize client dynamically with the specific key
  const ai = new GoogleGenAI({ apiKey });

  const fileParts = await Promise.all(
    files.map(async (file) => {
      const base64Data = await fileToGenerativePart(file);
      return {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };
    })
  );

  const prompt = `
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
    Return a JSON object with 'metadata' and 'items'.
    Currency should be "INR".
  `;

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
                  category: { type: Type.STRING, description: "Numbered Category (e.g., '1. Aluminum Profiles')" },
                  item: { type: Type.STRING, description: "Item Name" },
                  description: { type: Type.STRING, description: "Technical specs, cut length (mm), or sub-assembly ref" },
                  unit: { type: Type.STRING, description: "Unit (m, sq.m, nos, kg)" },
                  quantity: { type: Type.NUMBER, description: "Billable Quantity (e.g. Total Meters)" },
                  rate: { type: Type.NUMBER, description: "Unit Rate in INR" },
                  amount: { type: Type.NUMBER, description: "Total Cost in INR" },
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
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as BOMResult;
    return result;

  } catch (error) {
    console.error("Error generating BOM:", error);
    throw error;
  }
};

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