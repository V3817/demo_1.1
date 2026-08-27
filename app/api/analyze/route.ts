import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { AnalyzeSchema } from '@/lib/schemas';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { data } = body; // The scraper output

        let rawKey = req.headers.get("x-groq-api-key") || process.env.GROQ_API_KEY || "";
        // Sanitize: Handle comma-separated or concatenated keys (e.g. double entry)
        if (rawKey.includes(",")) rawKey = rawKey.split(",")[0];
        // Regex to find the first valid-looking Groq key (gsk_ followed by ~52 alphanumeric chars)
        const keyMatch = rawKey.match(/(gsk_[a-zA-Z0-9]{50,})/);
        const finalKey = keyMatch ? keyMatch[0] : rawKey.trim();

        const client = new Groq({
            apiKey: finalKey,
        });
        console.log(`Analyze Route: Using Key: ${finalKey.substring(0, 10)}... Length: ${finalKey.length}`);

        if (!data) {
            return NextResponse.json({ error: 'Data is required' }, { status: 400 });
        }

        const prompt = [
            "You are an expert Website Auditor, UX Strategist, and Product Designer.",
            "Analyze the following website data and produce a comprehensive audit.",
            "",
            "Website Data:",
            `Title: ${data.title}`,
            `Description: ${data.description}`,
            `Headings: ${JSON.stringify(data.headings)}`,
            `Image Count: ${data.imageCount}`,
            `Content Snippets: ${JSON.stringify(data.content)}`,
            "",
            "Return a strict JSON response with the following structure:",
            "{",
            "  \"ui_ux_audit\": {",
            "    \"score\": number (0-100),",
            "    \"issues\": [\"string\"],",
            "    \"positive_findings\": [\"string\"]",
            "  },",
            "  \"seo_audit\": {",
            "    \"score\": number (0-100),",
            "    \"issues\": [\"string\"],",
            "    \"missing_elements\": [\"string\"]",
            "  },",
            "  \"performance_audit\": {",
            "    \"score_estimation\": number (0-100),",
            "    \"notes\": \"string\"",
            "  },",
            "  \"mobile_responsiveness_audit\": {",
            "    \"score\": number (0-100),",
            "    \"issues\": [\"string\"]",
            "  },",
            "  \"accessibility_audit\": {",
            "    \"score\": number (0-100),",
            "    \"issues\": [\"string\"]",
            "  },",
            "  \"innovation_suggestions\": [",
            "    { \"name\": \"string\", \"description\": \"string\", \"category\": \"Personalization\" | \"Gamification\" | \"AI/Chatbot\" | \"Interactive\" | \"Micro-interaction\" | \"Other\" }",
            "  ],",
            "  \"recommendation_engine\": {",
            "    \"priority_actions\": [",
            "        {",
            "           \"action\": \"string\",",
            "           \"impact\": \"High\" | \"Medium\" | \"Low\",",
            "           \"difficulty\": \"High\" | \"Medium\" | \"Low\",",
            "           \"why_it_matters\": \"string\",",
            "           \"description\": \"string\"",
            "        }",
            "    ]",
            "  }",
            "}",
            "",
            "Ensure 'innovation_suggestions' are creative and modern.",
            "Do not include any markdown formatting or explanation outside the JSON."
        ].join("\n");

        const chatCompletion = await client.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.5,
            stream: false,
            response_format: { type: "json_object" }
        });

        const result = chatCompletion.choices[0]?.message?.content;

        if (!result) {
            throw new Error("No content from AI");
        }

        const json = JSON.parse(result);
        // Validate with Zod
        const validatedData = AnalyzeSchema.parse(json);

        return NextResponse.json(validatedData);

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Analysis error:', error);
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
