import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { issueTitle, issueBody, issueLabels, apiKey } = await req.json();

    if (!issueTitle || !issueBody) {
      return NextResponse.json({ error: 'Missing issue information.' }, { status: 400 });
    }

    const aiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!aiKey) {
      return NextResponse.json({ error: 'AI API key not configured. Local analysis fallback.' }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(aiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert open-source maintainer and issue triage assistant.
Analyze the following GitHub issue and provide a structured JSON response.

Issue Title: ${issueTitle}
Labels: ${issueLabels?.join(', ')}
Issue Body:
${issueBody}

Please respond ONLY with a valid JSON object using the following structure:
{
  "type": "string (Bug, Feature Request, Enhancement, Documentation, Question, Performance, Security, Other)",
  "priority": "string (Critical, High, Medium, Low)",
  "severity": "string (Blocker, Major, Moderate, Minor, Informational)",
  "labels": [
    { "name": "string (suggested label like bug, help-wanted, etc.)", "reason": "string (why this label)" }
  ],
  "missingInfo": {
    "stepsToReproduce": "boolean",
    "expectedBehavior": "boolean",
    "actualBehavior": "boolean",
    "environment": "boolean",
    "logsOrScreenshots": "boolean"
  },
  "summary": {
    "problem": "string",
    "expected": "string",
    "impact": "string",
    "evidence": "string"
  },
  "maintainerResponse": "string (A polite, professional response a maintainer could copy-paste)",
  "completenessScore": "number (0 to 100)",
  "completenessReason": "string (explanation of the score)"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Attempt to extract JSON if it was wrapped in code blocks
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7);
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.substring(0, jsonText.length - 3);
      }
    } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.substring(3);
        if (jsonText.endsWith('```')) {
          jsonText = jsonText.substring(0, jsonText.length - 3);
        }
    }
    
    const parsedData = JSON.parse(jsonText.trim());

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: 'AI analysis failed: ' + error.message }, { status: 500 });
  }
}
