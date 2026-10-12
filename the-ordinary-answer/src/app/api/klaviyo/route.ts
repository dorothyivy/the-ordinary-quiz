import { NextRequest, NextResponse } from 'next/server';
import type { KlaviyoPayload } from '@/types';

/**
 * Klaviyo Integration API Route
 *
 * Sends quiz results and skin profile data to Klaviyo for email/SMS marketing.
 * Requires KLAVIYO_API_KEY and KLAVIYO_LIST_ID environment variables.
 *
 * If Klaviyo is not configured, it gracefully logs and returns success
 * so the frontend still works in development.
 */
export async function POST(request: NextRequest) {
  try {
    const body: KlaviyoPayload = await request.json();
    const { email, phone, firstName, skinProfile, recommendation, quizCompletedAt } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.KLAVIYO_API_KEY;
    const listId = process.env.KLAVIYO_LIST_ID;

    if (!apiKey || !listId) {
      console.log('[Klaviyo] API key or List ID not configured. Skipping integration.');
      console.log('[Klaviyo] Would have sent:', { email, firstName, skinType: skinProfile.skinType });
      return NextResponse.json({
        success: true,
        message: 'Email captured (Klaviyo not configured - running in dev mode)',
      });
    }

    // ─── Create/Update Klaviyo Profile ─────────────────────────
    const profilePayload = {
      data: {
        type: 'profile',
        attributes: {
          email,
          first_name: firstName || undefined,
          phone_number: phone || undefined,
          properties: {
            skinType: skinProfile.skinType,
            skinConcerns: skinProfile.concerns.join(', '),
            ageRange: skinProfile.age,
            experienceLevel: skinProfile.experience,
            routinePreference: skinProfile.routinePreference,
            budget: skinProfile.budget,
            climate: skinProfile.climate,
            pregnancyStatus: skinProfile.pregnancyStatus,
            quizCompletedAt,
            morningProductCount: recommendation.morning.length,
            eveningProductCount: recommendation.evening.length,
            totalRoutineCost: recommendation.totalCost,
            conflictWarnings: recommendation.conflictWarnings.length,
            morningProducts: recommendation.morning.map(p => p.product.name).join(', '),
            eveningProducts: recommendation.evening.map(p => p.product.name).join(', '),
          },
        },
      },
    };

    // Create/update profile
    const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify(profilePayload),
    });

    let profileId: string | null = null;

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      profileId = profileData.data?.id;
    } else if (profileResponse.status === 409) {
      // Profile already exists - extract ID from the conflict response
      const conflictData = await profileResponse.json();
      profileId = conflictData.errors?.[0]?.meta?.duplicate_profile_id;
    }

    // ─── Subscribe to List ─────────────────────────────────────
    if (profileId) {
      await fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify({
          data: [{ type: 'profile', id: profileId }],
        }),
      });
    }

    // ─── Track Event ───────────────────────────────────────────
    const eventPayload = {
      data: {
        type: 'event',
        attributes: {
          metric: { data: { type: 'metric', attributes: { name: 'Quiz Completed' } } },
          profile: { data: { type: 'profile', attributes: { email } } },
          properties: {
            skinType: skinProfile.skinType,
            concerns: skinProfile.concerns,
            productCount: recommendation.morning.length + recommendation.evening.length,
            totalCost: recommendation.totalCost,
            products: [...recommendation.morning, ...recommendation.evening].map(p => ({
              name: p.product.name,
              price: p.product.price,
              priority: p.priority,
            })),
          },
          time: new Date().toISOString(),
        },
      },
    };

    await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify(eventPayload),
    });

    return NextResponse.json({
      success: true,
      message: 'Profile created and subscribed to list',
    });
  } catch (error) {
    console.error('[Klaviyo] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process email subscription' },
      { status: 500 }
    );
  }
}
