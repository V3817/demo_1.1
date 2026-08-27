import { z } from "zod";

export const ScrapeDataSchema = z.object({
    url: z.string().url(),
    title: z.string(),
    description: z.string(),
    headings: z.array(z.object({ level: z.string(), text: z.string() })),
    imageCount: z.number(),
    images: z.array(z.object({ src: z.string(), alt: z.string() })),
    content: z.array(z.string()),
    rawHtml: z.number().optional()
});

export const RedesignSchema = z.object({
    color_palette: z.object({
        primary: z.string().optional().catch(""),
        secondary: z.string().optional().catch(""),
        accent: z.string().optional().catch(""),
        background: z.string().optional().catch(""),
        text: z.string().optional().catch("")
    }).optional().catch({}),
    typography_recommendation: z.object({
        headings: z.union([z.string(), z.any()]).transform(v => typeof v === 'string' ? v : JSON.stringify(v)),
        body: z.union([z.string(), z.any()]).transform(v => typeof v === 'string' ? v : JSON.stringify(v))
    }).optional().catch({ headings: "", body: "" }),
    layout_suggestions: z.object({
        hero_section: z.union([z.string(), z.any()]).transform(v => typeof v === 'string' ? v : JSON.stringify(v)),
        navigation: z.union([z.string(), z.any()]).transform(v => typeof v === 'string' ? v : JSON.stringify(v)),
        key_sections: z.array(z.union([z.string(), z.any()]).transform(v => typeof v === 'string' ? v : JSON.stringify(v))).optional().catch([])
    }).optional().catch({ hero_section: "", navigation: "", key_sections: [] }),
    wireframe_description: z.union([z.string(), z.any()]).transform(v => typeof v === 'string' ? v : JSON.stringify(v)).optional().catch(""),
    visual_preview: z.object({
        hero: z.object({
            headline: z.string().optional().catch(""),
            subheadline: z.string().optional().catch(""),
            cta_text: z.string().optional().catch("")
        }).optional().catch({}),
        features: z.array(z.object({
            title: z.string().optional().catch(""),
            description: z.string().optional().catch(""),
            icon: z.string().optional().catch("star")
        })).optional().catch([]),
        testimonials: z.array(z.object({
            quote: z.string().optional().catch(""),
            author: z.string().optional().catch("")
        })).optional().catch([])
    }).optional().catch({})
});

export const AnalyzeSchema = z.object({
    ui_ux_audit: z.object({
        score: z.number(),
        issues: z.array(z.string()),
        positive_findings: z.array(z.string())
    }),
    seo_audit: z.object({
        score: z.number(),
        issues: z.array(z.string()),
        missing_elements: z.array(z.string())
    }),
    performance_audit: z.object({
        score_estimation: z.number(),
        notes: z.string()
    }),
    mobile_responsiveness_audit: z.object({
        score: z.number(),
        issues: z.array(z.string())
    }),
    accessibility_audit: z.object({
        score: z.number(),
        issues: z.array(z.string())
    }),
    innovation_suggestions: z.array(z.object({
        name: z.string(),
        description: z.string(),
        category: z.enum(["Personalization", "Gamification", "AI/Chatbot", "Interactive", "Micro-interaction", "Other"])
    })),
    recommendation_engine: z.object({
        priority_actions: z.array(z.object({
            action: z.string(),
            impact: z.enum(["High", "Medium", "Low"]),
            difficulty: z.enum(["High", "Medium", "Low"]),
            why_it_matters: z.string().describe("Explanation of importance"),
            description: z.string()
        }))
    })
});

export const RoadmapSchema = z.object({
    tech_stack_recommendation: z.object({
        frontend: z.string().optional().catch("Next.js"),
        backend: z.string().optional().catch("Node.js"),
        tools: z.array(z.string()).optional().catch([])
    }).optional().catch({ frontend: "Next.js", backend: "Node.js", tools: [] }),
    migration_steps: z.array(z.union([z.string(), z.any()]).transform(v => typeof v === 'string' ? v : JSON.stringify(v))).optional().catch([]),
    component_list: z.array(z.union([z.string(), z.any()]).transform(v => typeof v === 'string' ? v : JSON.stringify(v))).optional().catch([]),
    estimated_timeline: z.string().optional().catch("2-4 weeks")
});
