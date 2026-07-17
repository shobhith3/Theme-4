"use server";

import Groq from 'groq-sdk';
import prisma from "@/lib/prisma";

export async function askAssistant(chatHistory: { role: "user" | "ai"; content: string }[]) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return "I'm currently running in offline mode because the GROQ_API_KEY is not set. Please set the API key in your environment to chat with me!";
    }

    // 1. Fetch a lightweight context snapshot
    // We fetch branches, minimal inventory (name, stock, safety), and any pending decisions.
    const branches = await prisma.branch.findMany({
      select: { id: true, name: true }
    });
    
    const inventory = await prisma.branchInventory.findMany({
      include: {
        item: { select: { name: true, sku: true, unit: true } },
      },
      take: 50 // Limit to avoid massive tokens in a real app, sufficient for hackathon
    });

    const pendingDecisions = await prisma.decision.findMany({
      where: { status: 'PENDING' },
      take: 5,
      select: { 
        id: true,
        riskLevel: true,
        dataPayload: true
      }
    });

    // 2. Format Context
    // We map DB models into a smaller readable JSON to save tokens.
    const contextData = {
      branches,
      inventory: inventory.map((inv: any) => ({
        branchId: inv.branchId,
        itemName: inv.item.name,
        sku: inv.item.sku,
        currentStock: inv.currentStock,
        safeStock: inv.safeStock,
        unit: inv.item.unit,
        isAtRisk: inv.currentStock <= inv.safeStock
      })),
      pendingDecisions: pendingDecisions.map((d: any) => ({
        riskLevel: d.riskLevel,
        payload: typeof d.dataPayload === 'string' ? JSON.parse(d.dataPayload) : d.dataPayload
      }))
    };

    const systemPrompt = `You are ProcureIQ Assistant, an expert AI Procurement Advisor. 
Your job is to answer the user's questions strictly using the live database context provided below in JSON format.
You must be precise, concise, and helpful. Use exact numbers from the context.
If the user asks about risk, reference items where currentStock <= safeStock.
If the user asks about decisions, reference the pendingDecisions.
Do NOT hallucinate numbers, suppliers, or items that are not in the context.
Do NOT talk about yourself or explain that you are an AI. Just provide the business answer.

LIVE CONTEXT:
${JSON.stringify(contextData)}
`;

    // 3. Format Messages for Groq
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map(msg => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.content
      }))
    ];

    // 4. Call Groq
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: messages,
      temperature: 0.2, // Keep it deterministic
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return `An error occurred while generating a response: ${error.message || "Unknown error"}`;
  }
}
