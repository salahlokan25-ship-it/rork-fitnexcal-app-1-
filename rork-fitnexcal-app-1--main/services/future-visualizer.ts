type Scenario = 'current' | 'reduce_15' | 'increase_protein';

export type VisualizationParams = {
  scenario: Scenario;
  horizon: '2w' | '1m' | '3m';
  imageBase64: string;
  userStats?: {
    heightCm?: number;
    weightKg?: number;
    sex?: 'male' | 'female' | 'other';
    bodyFatPct?: number;
    avgDailyCalories?: number;
    avgProteinGrams?: number;
    trainingStyle?: string;
  };
};

export type VisualizationResult = {
  imageBase64: string;
  explanation: string;
};

function scenarioText(s: Scenario): string {
  switch (s) {
    case 'current':
      return 'Continue current habits with similar calories and protein';
    case 'reduce_15':
      return 'Reduce daily calories by about 15% while keeping protein adequate';
    case 'increase_protein':
      return 'Increase protein intake to ~1.6-2.2 g/kg while keeping calories similar';
  }
}

function horizonText(h: VisualizationParams['horizon']): string {
  switch (h) {
    case '2w':
      return 'after 2 weeks';
    case '1m':
      return 'after 1 month';
    case '3m':
      return 'after 3 months';
  }
}

export async function generateFutureBodyVisualization(params: VisualizationParams): Promise<VisualizationResult> {
  try {
    const { scenario, horizon, imageBase64, userStats } = params;

    if (!imageBase64 || imageBase64.length < 1000) {
      throw new Error('Invalid or empty image provided');
    }

    const statsText = userStats
      ? `User stats: ${[
          userStats.sex ? `sex ${userStats.sex}` : null,
          userStats.heightCm ? `height ${userStats.heightCm} cm` : null,
          userStats.weightKg ? `weight ${userStats.weightKg} kg` : null,
          userStats.bodyFatPct ? `estimated body fat ${userStats.bodyFatPct}%` : null,
          userStats.avgDailyCalories ? `avg calories ${userStats.avgDailyCalories}` : null,
          userStats.avgProteinGrams ? `avg protein ${userStats.avgProteinGrams}g` : null,
          userStats.trainingStyle ? `training ${userStats.trainingStyle}` : null,
        ]
          .filter(Boolean)
          .join(', ')}.`
      : '';

    const basePrompt = `Fitness-safe edit. Fully clothed adult. Neutral background.
You are a fitness body recomposition visualizer. Given a real full-body photo, generate a realistic prediction of the SAME person ${horizonText(
      horizon
    )} if they ${scenarioText(
      scenario
    )}.

${statsText}

STRICT VISUAL RULES:
- Preserve identity perfectly: same face, facial features, skin tone, hair
- Keep pose, clothing style, camera angle, framing, and background unchanged
- Apply scientifically plausible body composition changes only, proportional to the timeline
- Magnitude guidance: subtle at 2w, moderate at 1m, clearly noticeable at 3m
- Recomposition details: realistic fat loss (abdomen/hips/thighs), improved muscle definition (arms/shoulders/chest/back/legs)
- Photo quality: photo-realistic, clean lighting, minimal artifacts

WATERMARK/TEXT POLICY:
- Do NOT add any text, logos, brand marks, or watermarks
- If ANY watermark/text is present or would be produced, REMOVE it cleanly and reconstruct the underlying pixels naturally

SAFETY:
- Only edit fully clothed adults; if unsure, produce an extremely subtle, safe edit preserving the original

Return only the edited image.`;

    const doRequest = async (img: string, prompt: string) => {
      console.log('[FutureVisualizer] request start');
      const res = await fetch('https://toolkit.rork.com/images/edit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          images: [{ type: 'image', image: img }],
        }),
      });
      console.log('[FutureVisualizer] request status', res.status);
      return res;
    };

    let res = await doRequest(imageBase64, basePrompt);
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 700));
      res = await doRequest(imageBase64, basePrompt);
    }

    let data = (await res.json()) as { image?: { base64Data: string; mimeType: string }; error?: string };
    const lowerError = (data.error || '').toLowerCase();
    const noImage = !data.image?.base64Data;

    if (!res.ok || noImage) {
      if (lowerError.includes('blocked') || lowerError.includes('safety')) {
        throw new Error('blocked');
      }

      const dataUrlCandidate = `data:image/jpeg;base64,${imageBase64}`;
      console.log('[FutureVisualizer] retry with data URL prefix');
      const res2 = await doRequest(dataUrlCandidate, `${basePrompt}\nMake very subtle, safe edits.`);
      let data2: { image?: { base64Data: string; mimeType: string }; error?: string };
      try {
        data2 = (await res2.json()) as { image?: { base64Data: string; mimeType: string }; error?: string };
      } catch (e) {
        console.error('[FutureVisualizer] retry parse error', e);
        throw new Error('Could not generate future visualization. Please try a clearer full-body photo and try again.');
      }

      if (!res2.ok || !data2.image?.base64Data) {
        const err2 = (data2.error || '').toLowerCase();
        if (err2.includes('blocked') || err2.includes('safety')) {
          throw new Error('blocked');
        }
        const detail = data.error || data2.error || '';
        console.warn('[FutureVisualizer] edit failed', detail);
        throw new Error('Could not generate future visualization. Please try a clearer full-body photo and try again.');
      }

      const explanation2 = `Prediction ${horizonText(horizon)} for scenario: ${scenarioText(scenario)}.`;
      return { imageBase64: data2.image.base64Data, explanation: explanation2 };
    }

    const explanation = `Prediction ${horizonText(horizon)} for scenario: ${scenarioText(scenario)}.`;
    const imgOut = data.image?.base64Data ?? '';
    if (!imgOut) {
      throw new Error('Could not generate future visualization. Please try a clearer full-body photo and try again.');
    }
    return { imageBase64: imgOut, explanation };
  } catch (e) {
    console.error('[FutureVisualizer] generation error', e);
    if (e instanceof Error && e.message === 'blocked') {
      throw new Error(
        'Content was blocked for safety. Please use a well-lit, fully clothed, single-person, front-facing full-body photo on a neutral background.'
      );
    }
    throw new Error('Could not generate future visualization. Please try a clearer full-body photo and try again.');
  }
}
