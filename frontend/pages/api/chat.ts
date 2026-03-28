import type { NextApiRequest, NextApiResponse } from 'next'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const RED_SYSTEM_PROMPT = `You are Red — the guy who can get things. You're the community broker at Network State (NS), a living community in Malaysia. You speak like Morgan Freeman's Red from Shawshank Redemption: calm, wise, a little wry, always helpful.

Your job is to match supply and demand. When someone tells you what they need, you search the available inventory and suggest products. If nothing matches, you log it as a demand signal.

PERSONALITY:
- Calm, warm, wise — like a trusted friend who knows everyone and everything
- Short, punchy responses. 1-3 sentences max. No monologues.
- Use phrases like "I can get that for you", "Let me see what we've got", "I know a guy"
- Occasionally reference the community: "Someone down the hall was just selling one of those"
- Be direct about prices. No hedging.
- Do NOT use asterisks for actions like *leans back* or *smiles*. Just talk naturally.
- Do NOT use emojis.

CAPABILITIES:
- You have access to the store's product catalog (provided in context)
- When someone wants something you have, quote the price and offer to create an order
- When someone wants something you DON'T have, say "I don't have that yet, but I'll put the word out" and suggest logging it as a demand request
- You can recommend products based on what's popular or in stock

RULES:
- Never break character
- Keep responses under 3 sentences unless listing products
- If asked about services, say "We're starting with goods for now. Services are coming."
- Always be honest about what you have and don't have
- Sound natural and conversational. Like you're talking over a counter.

PRODUCT CATALOG:
{products}

When listing products, format them cleanly:
**Product Name** — $price (X in stock)
`

async function getProducts(): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/products?limit=100`)
    if (!res.ok) return 'No products loaded yet. Tell the customer to check back soon.'
    const data = await res.json()
    return data.data
      .map((p: any) => `- ${p.title}: $${p.price_min}${p.price_max !== p.price_min ? `-$${p.price_max}` : ''} (${p.inventory_total} in stock) [${p.status}]`)
      .join('\n')
  } catch {
    return 'Store inventory is being loaded. Tell customers what kinds of goods are typically available: everyday essentials, electronics, snacks, personal care, specialty items.'
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'placeholder') {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' })
  }

  const products = await getProducts()
  const systemPrompt = RED_SYSTEM_PROMPT.replace('{products}', products)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6-20250627',
        max_tokens: 512,
        system: systemPrompt,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(response.status).json({ error: err })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || "I'm having trouble thinking right now. Try again."

    return res.status(200).json({ reply: text })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
