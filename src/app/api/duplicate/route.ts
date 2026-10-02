import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { issueTitle, issueBody, otherIssues, apiKey } = await req.json();

    if (!issueTitle || !otherIssues) {
      return NextResponse.json({ error: 'Missing information.' }, { status: 400 });
    }

    const aiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!aiKey) {
      return NextResponse.json({ error: 'AI API key not configured.' }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(aiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an issue triage assistant. I have a NEW issue and a list of EXISTING issues.
Determine if the new issue is potentially a duplicate of any existing issues.

NEW ISSUE:
Title: ${issueTitle}
Body: ${issueBody}

EXISTING ISSUES (Paste):
${otherIssues}

Please respond ONLY with a valid JSON object using this structure:
{
  "similarIssues": [
    {
      "title": "string (the title of the existing issue)",
      "similarityEstimate": "string (e.g. 'High', 'Medium', 'Low')",
      "whySimilar": "string",
      "differences": "string",
      "possibleDuplicate": "boolean"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
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
