interface AIFoodAnalysis {
  foods: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving_size: string;
    confidence: number;
  }[];
  total_calories: number;
}

export const analyzeFoodImage = async (imageBase64: string): Promise<AIFoodAnalysis> => {
  try {
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a nutrition expert. Analyze food images and provide detailed nutritional information. 
            Return a JSON object with this exact structure:
            {
              "foods": [
                {
                  "name": "food name",
                  "calories": number,
                  "protein": number (grams),
                  "carbs": number (grams),
                  "fat": number (grams),
                  "serving_size": "description of portion size",
                  "confidence": number (0-1)
                }
              ],
              "total_calories": number
            }
            
            Be as accurate as possible with portion sizes and nutritional values. If you see multiple food items, list each separately.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this food image and provide detailed nutritional information.'
              },
              {
                type: 'image',
                image: imageBase64
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze image');
    }

    const analysisText = data.completion;
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const analysis: AIFoodAnalysis = JSON.parse(jsonMatch[0]);
    if (!analysis.foods || !Array.isArray(analysis.foods)) {
      throw new Error('Invalid analysis format');
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw new Error('Failed to analyze food image. Please try again.');
  }
};

export const analyzeFoodFromText = async (description: string): Promise<AIFoodAnalysis> => {
  try {
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a strict nutrition parser. Given a casual text description of what a person ate, extract foods and estimate macros.
Return JSON with this exact shape:
{
  "foods": [
    {"name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "serving_size": string, "confidence": number}
  ],
  "total_calories": number
}
Use common portions when missing. Respond with ONLY JSON.`
          },
          {
            role: 'user',
            content: description
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze text');
    }

    const analysisText = data.completion as string;
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    const analysis: AIFoodAnalysis = JSON.parse(jsonMatch[0]);
    if (!analysis.foods || !Array.isArray(analysis.foods)) {
      throw new Error('Invalid analysis format');
    }
    return analysis;
  } catch (error) {
    console.error('Error analyzing food text:', error);
    throw new Error('Failed to analyze the description. Please try again.');
  }
};

export const generateNutritionPlan = async (userProfile: any, preferences: string): Promise<string> => {
  try {
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a certified nutritionist and meal planning expert. Create personalized nutrition plans based on user profiles and preferences.`
          },
          {
            role: 'user',
            content: `Create a personalized nutrition plan for:
            - Age: ${userProfile.age}
            - Gender: ${userProfile.gender}
            - Weight: ${userProfile.weight}kg
            - Height: ${userProfile.height}cm
            - Activity Level: ${userProfile.activity_level}
            - Goal: ${userProfile.goal}
            - Daily Calorie Goal: ${userProfile.goal_calories}
            - Preferences/Restrictions: ${preferences}
            
            Please provide a detailed meal plan with specific food recommendations, portion sizes, and timing.`
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate nutrition plan');
    }

    return data.completion;
  } catch (error) {
    console.error('Error generating nutrition plan:', error);
    throw new Error('Failed to generate nutrition plan. Please try again.');
  }
};

export const askNutritionQuestion = async (question: string, userContext?: any): Promise<string> => {
  try {
    const contextInfo = userContext ? `
    User Context:
    - Goal: ${userContext.goal}
    - Daily Calories: ${userContext.goal_calories}
    - Current intake today: ${userContext.current_calories || 0} calories
    ` : '';

    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a knowledgeable nutrition assistant. Provide helpful, accurate, and personalized nutrition advice. 
            Keep responses concise but informative. Always prioritize health and safety.${contextInfo}`
          },
          {
            role: 'user',
            content: question
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get nutrition advice');
    }

    return data.completion;
  } catch (error) {
    console.error('Error asking nutrition question:', error);
    throw new Error('Failed to get nutrition advice. Please try again.');
  }
};