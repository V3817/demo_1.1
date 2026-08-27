
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { RedesignSchema } from '@/lib/schemas';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { data, customPrompt } = body;

        // API KEY OVERRIDE
        // API KEY OVERRIDE
        let rawKey = req.headers.get("x-groq-api-key") || process.env.GROQ_API_KEY || "";
        if (rawKey.includes(",")) rawKey = rawKey.split(",")[0];
        const keyMatch = rawKey.match(/(gsk_[a-zA-Z0-9]{50,})/);
        const finalKey = keyMatch ? keyMatch[0] : rawKey.trim();

        const client = new Groq({
            apiKey: finalKey,
        });

        if (!data) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        const prompt = [
            "You are an expert UI / UX Designer and Product Architect.",
            "Based on the following website data, generate a complete, high-fidelity redesign plan.",
            "",
            "Website Data:",
            JSON.stringify({
                title: data.title,
                description: data.description,
                headings: data.headings.slice(0, 10),
                imageCount: data.imageCount
            }),
            "",
            customPrompt ? `USER STRICT INSTRUCTION: ${customPrompt}` : "",
            "",
            "Requirements:",
            "1. High-fidelity mockups description.",
            "2. Multiple layout variations (Desktop + Mobile).",
            "3. Updated modern color palette and typography.",
            "4. Component-level UI breakdown.",
            "",
            "CRITICAL: Provide a \"visual_preview\" object with content for a Hero section, 3 key Features, and 2 Testimonials.",
            customPrompt ? "Ensure the visual_preview and color_palette strictly reflect the USER INSTRUCTION above." : "Focus on improving engagement and quality.",
            "",
            "Return the response as a valid JSON object matching this schema:",
            "{",
            "    \"color_palette\": { \"primary\": \"#...\", \"secondary\": \"#...\", \"accent\": \"#...\", \"background\": \"#...\", \"text\": \"#...\" },",
            "    \"typography_recommendation\": { \"headings\": \"...\", \"body\": \"...\" },",
            "    \"layout_suggestions\": { \"hero_section\": \"...\", \"navigation\": \"...\", \"key_sections\": [\"...\"] },",
            "    \"wireframe_description\": \"...\",",
            "        \"visual_preview\": {",
            "        \"hero\": { \"headline\": \"...\", \"subheadline\": \"...\", \"cta_text\": \"...\" },",
            "        \"features\": [{ \"title\": \"...\", \"description\": \"...\", \"icon\": \"...\" }],",
            "            \"testimonials\": [{ \"quote\": \"...\", \"author\": \"...\" }]",
            "    }",
            "}"
        ].join("\n");

        const chatCompletion = await client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: 'json_object' }
        });

        const result = chatCompletion.choices[0]?.message?.content;
        if (!result) throw new Error("No content from AI");

        const json = JSON.parse(result);

        // Validate with Zod
        const validatedData = RedesignSchema.parse(json);

        return NextResponse.json(validatedData);

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Redesign error:', error);
        const status = error?.status || 500;
        if (status === 429) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }
        if (status === 401) {
            return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
