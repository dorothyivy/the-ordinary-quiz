import { NextRequest, NextResponse } from 'next/server';
import { buildSkinProfile, generateRecommendation } from '@/lib/recommendation-engine';
import type { QuizAnswer } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body as { answers: QuizAnswer[] };

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid quiz answers provided' },
        { status: 400 }
      );
    }

    const profile = buildSkinProfile(answers);
    const recommendation = generateRecommendation(profile);

    // Encode for URL using btoa (no Buffer)
    const resultData = {
      profile,
      recommendation,
      completedAt: new Date().toISOString(),
    };

    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(resultData))));

    return NextResponse.json({
      success: true,
      profile,
      recommendation,
      encodedData: encoded,
      shareUrl: `/results?data=${encodeURIComponent(encoded)}&v=1`,
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
