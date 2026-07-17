import Groq from 'groq-sdk';
import { EngineInput, EngineOutput } from '../engine/types';

export async function generateExplanation(input: EngineInput, output: EngineOutput): Promise<string> {
  const { metrics, chosenOption } = output;
  const { itemSku, itemName, branchName, unitRevenue } = input;

  const coverDays = metrics.stockCover.toFixed(1);
  const safeStock = input.safeStock;
  const currentStock = metrics.usableStock;

  let actionText = '';
  if (chosenOption) {
    if (chosenOption.option.type === 'TRANSFER') {
      actionText = `transfer ${chosenOption.recommendedQuantity} units from ${chosenOption.option.name}`;
    } else if (chosenOption.option.type === 'PURCHASE') {
      actionText = `purchase ${chosenOption.recommendedQuantity} units from ${chosenOption.option.name}`;
    } else if (chosenOption.option.type === 'HYBRID') {
      actionText = `transfer ${chosenOption.option.transferQuantity} units from ${chosenOption.option.transferOption.name} and purchase ${chosenOption.option.purchaseQuantity} units from ${chosenOption.option.purchaseOption.name}`;
    }
  }

  // Deterministic Template Fallback
  const fallback = `${itemName} at ${branchName} is ${output.riskLevel}: ${currentStock} units vs safe ${safeStock} units, ~${coverDays} days cover. Recommend ${actionText}.`;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.log("No GROQ_API_KEY found, using deterministic fallback.");
    return fallback;
  }

  try {
    const groq = new Groq({ apiKey });

    const prompt = `You are ProcureIQ, an exception-based procurement decision engine.
Explain the following calculated decision in a short business-language paragraph (max 3 sentences). Cite the actual numbers provided. Do NOT invent any numbers or recommendations. 

Context:
Item: ${itemName} (${itemSku}) at ${branchName}
Risk Level: ${output.riskLevel}
Usable Stock: ${currentStock} units (Safe stock is ${safeStock} units)
Cover: ~${coverDays} days of expected demand
Revenue at Risk: ₹${metrics.revenueAtRisk.toFixed(2)}

Chosen Action:
${actionText}

Write a concise explanation for a manager to review.`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150
    });

    const textContent = completion.choices[0]?.message?.content;
    if (textContent) {
      return textContent.trim();
    }
    return fallback;
  } catch (error: any) {
    console.warn(`LLM Generation failed: ${error?.message || 'Unknown error'}. Using deterministic fallback.`);
    return fallback;
  }
}
