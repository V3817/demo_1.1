
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { RoadmapSchema } from '@/lib/schemas';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { data, redesign } = body; // Expects analysis + redesign plan

        // API KEY OVERRIDE
        // API KEY OVERRIDE
        let rawKey = req.headers.get("x-groq-api-key") || process.env.GROQ_API_KEY || "";
        if (rawKey.includes(",")) rawKey = rawKey.split(",")[0];
        const keyMatch = rawKey.match(/(gsk_[a-zA-Z0-9]{50,})/);
        const finalKey = keyMatch ? keyMatch[0] : rawKey.trim();

        const client = new Groq({
            apiKey: finalKey,
        });

        const prompt = [
            "Create a Technical Implementation Roadmap for upgrading this website.",
            "Context:",
            `Title: ${data.title}`,
            `Proposed Redesign: ${JSON.stringify(redesign || "Modernize UI and stack")}`,
            "",
            "Requirements:",
            "1. Information Architecture updates.",
            "2. Required React components list.",
            "3. Suggested Tech Stack (Frontend, Backend, Tools).",
            "4. Integration/Migration steps.",
            "5. Developer-ready guidelines.",
            "",
            "Provide a JSON response with:",
            "1. tech_stack_recommendation(frontend, backend, tools)",
            "2. migration_steps(step-by-step list including IA updates)",
            "3. component_list(list of React components needed)",
            "4. estimated_timeline(in weeks)",
            "",
            "Strict JSON format."
        ].join("\n");

        const chatCompletion = await client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.5,
            max_tokens: 2048,
            response_format: { type: 'json_object' }
        });

        const result = chatCompletion.choices[0]?.message?.content;
        if (!result) throw new Error("No content from AI");

        const json = JSON.parse(result);

        // Robustness: Handle non-array tools
        if (json.tech_stack_recommendation) {
            if (typeof json.tech_stack_recommendation.tools === 'string') {
                json.tech_stack_recommendation.tools = json.tech_stack_recommendation.tools.split(',').map((t: string) => t.trim());
            }
            // Fix: Handle arrays for frontend/backend
            if (Array.isArray(json.tech_stack_recommendation.frontend)) {
                json.tech_stack_recommendation.frontend = json.tech_stack_recommendation.frontend.join(", ");
            }
            if (Array.isArray(json.tech_stack_recommendation.backend)) {
                json.tech_stack_recommendation.backend = json.tech_stack_recommendation.backend.join(", ");
            }
        }

        // Fix: Handle object migration steps
        if (Array.isArray(json.migration_steps)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            json.migration_steps = json.migration_steps.map((step: any) => {
                if (typeof step === 'object' && step !== null) {
                    return step.step || step.description || step.title || JSON.stringify(step);
                }
                return String(step);
            });
        }

        // Robustness: Handle object timeline
        if (json.estimated_timeline && typeof json.estimated_timeline !== 'string') {
            if (typeof json.estimated_timeline === 'object') {
                json.estimated_timeline = json.estimated_timeline.duration || json.estimated_timeline.timeline || JSON.stringify(json.estimated_timeline);
            } else {
                json.estimated_timeline = String(json.estimated_timeline);
            }
        }

        const validatedData = RoadmapSchema.parse(json);

        return NextResponse.json(validatedData);

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Roadmap error:', error);
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
