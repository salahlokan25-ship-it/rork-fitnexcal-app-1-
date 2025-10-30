import { FoodItem } from '@/types/nutrition';
import { API_CONFIG } from '@/constants/api-config';

let NX_APP_ID_RUNTIME: string | null = null;
let NX_API_KEY_RUNTIME: string | null = null;

export function setNutritionixCredentials(appId: string, apiKey: string) {
  NX_APP_ID_RUNTIME = appId?.trim() || null;
  NX_API_KEY_RUNTIME = apiKey?.trim() || null;
  console.log('[Nutritionix] Runtime credentials set');
}

export function getNutritionixCredentials() {
  const envApp = API_CONFIG.NUTRITIONX.APP_ID;
  const envKey = API_CONFIG.NUTRITIONX.API_KEY;
  const appId = NX_APP_ID_RUNTIME ?? envApp;
  const apiKey = NX_API_KEY_RUNTIME ?? envKey;
  return { appId, apiKey } as const;
}

function nutritionixEnabled() {
  const { appId, apiKey } = getNutritionixCredentials();
  const ok = !!appId && appId !== 'demo_app_id' && !!apiKey && apiKey !== 'demo_api_key';
  if (!ok) {
    console.log('[Nutritionix] disabled (missing APP_ID or API_KEY)');
  }
  return ok;
}

// Mock data for fallback when APIs are not available
const MOCK_FOODS: FoodItem[] = [
  {
    id: '1',
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    serving_size: '100g',
    image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop'
  },
  {
    id: '2',
    name: 'Brown Rice',
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    serving_size: '100g cooked',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Avocado',
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    serving_size: '100g',
    image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=200&fit=crop'
  },
  {
    id: '4',
    name: 'Greek Yogurt',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    serving_size: '100g',
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop'
  },
  {
    id: '5',
    name: 'Salmon Fillet',
    calories: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    serving_size: '100g',
    image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop'
  },
  {
    id: '6',
    name: 'Quinoa',
    calories: 120,
    protein: 4.4,
    carbs: 22,
    fat: 1.9,
    serving_size: '100g cooked',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop'
  },
  {
    id: '7',
    name: 'Sweet Potato',
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    serving_size: '100g',
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop'
  },
  {
    id: '8',
    name: 'Almonds',
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    serving_size: '100g',
    image_url: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=200&fit=crop'
  },
  {
    id: '9',
    name: 'Spinach',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    serving_size: '100g',
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop'
  },
  {
    id: '10',
    name: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    serving_size: '1 medium (118g)',
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop'
  },
  {
    id: '11',
    name: 'Oatmeal',
    calories: 68,
    protein: 2.4,
    carbs: 12,
    fat: 1.4,
    serving_size: '100g cooked',
    image_url: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300&h=200&fit=crop'
  },
  {
    id: '12',
    name: 'Eggs',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    serving_size: '2 large eggs',
    image_url: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=300&h=200&fit=crop'
  }
];

const COUNTRY_FOODS = {
  ma: [
    {
      id: 'ma1',
      name: 'Tagine with Chicken',
      calories: 320,
      protein: 28,
      carbs: 15,
      fat: 18,
      serving_size: '1 serving (300g)',
      image_url: 'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?w=300&h=200&fit=crop'
    },
    {
      id: 'ma2',
      name: 'Couscous',
      calories: 112,
      protein: 3.8,
      carbs: 23,
      fat: 0.2,
      serving_size: '100g cooked',
      image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop'
    }
  ],
  us: [
    {
      id: 'us1',
      name: 'Hamburger',
      calories: 540,
      protein: 25,
      carbs: 40,
      fat: 31,
      serving_size: '1 burger',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop'
    },
    {
      id: 'us2',
      name: 'Caesar Salad',
      calories: 470,
      protein: 37,
      carbs: 7,
      fat: 40,
      serving_size: '1 serving',
      image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop'
    }
  ],
  it: [
    {
      id: 'it1',
      name: 'Spaghetti Carbonara',
      calories: 580,
      protein: 20,
      carbs: 55,
      fat: 30,
      serving_size: '1 serving (350g)',
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop'
    },
    {
      id: 'it2',
      name: 'Margherita Pizza',
      calories: 250,
      protein: 11,
      carbs: 33,
      fat: 9,
      serving_size: '1 slice',
      image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop'
    }
  ],
  es: [
    {
      id: 'es1',
      name: 'Paella Valenciana',
      calories: 350,
      protein: 18,
      carbs: 45,
      fat: 12,
      serving_size: '1 serving (300g)',
      image_url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=300&h=200&fit=crop'
    },
    {
      id: 'es2',
      name: 'Gazpacho',
      calories: 46,
      protein: 2,
      carbs: 8,
      fat: 1,
      serving_size: '1 cup (250ml)',
      image_url: 'https://images.unsplash.com/photo-1571197119282-7c4e2b2d9c6b?w=300&h=200&fit=crop'
    }
  ],
  tr: [
    {
      id: 'tr1',
      name: 'Kebab',
      calories: 280,
      protein: 25,
      carbs: 8,
      fat: 17,
      serving_size: '1 serving (200g)',
      image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&h=200&fit=crop'
    },
    {
      id: 'tr2',
      name: 'Turkish Delight',
      calories: 320,
      protein: 0,
      carbs: 80,
      fat: 0,
      serving_size: '100g',
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop'
    }
  ],
  gb: [
    {
      id: 'gb1',
      name: 'Fish and Chips',
      calories: 585,
      protein: 32,
      carbs: 45,
      fat: 32,
      serving_size: '1 serving',
      image_url: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=300&h=200&fit=crop'
    },
    {
      id: 'gb2',
      name: "Shepherd's Pie",
      calories: 290,
      protein: 18,
      carbs: 25,
      fat: 14,
      serving_size: '1 serving (250g)',
      image_url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=300&h=200&fit=crop'
    }
  ],
  jp: [
    {
      id: 'jp1',
      name: 'Sushi (Salmon Nigiri)',
      calories: 60,
      protein: 4,
      carbs: 8,
      fat: 2,
      serving_size: '1 piece',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop'
    },
    {
      id: 'jp2',
      name: 'Ramen (Tonkotsu)',
      calories: 500,
      protein: 22,
      carbs: 65,
      fat: 18,
      serving_size: '1 bowl (450g)',
      image_url: 'https://images.unsplash.com/photo-1604909052743-84f0ed803b81?w=300&h=200&fit=crop'
    }
  ],
  mx: [
    {
      id: 'mx1',
      name: 'Tacos al Pastor',
      calories: 150,
      protein: 8,
      carbs: 14,
      fat: 7,
      serving_size: '1 taco',
      image_url: 'https://images.unsplash.com/photo-1601924582971-b0c5be3d723b?w=300&h=200&fit=crop'
    },
    {
      id: 'mx2',
      name: 'Guacamole with Chips',
      calories: 220,
      protein: 3,
      carbs: 20,
      fat: 14,
      serving_size: '1 serving (90g)',
      image_url: 'https://images.unsplash.com/photo-1543332164-6e82f355bad8?w=300&h=200&fit=crop'
    }
  ],
  fr: [
    {
      id: 'fr1',
      name: 'Croissant',
      calories: 231,
      protein: 5,
      carbs: 26,
      fat: 12,
      serving_size: '1 medium (57g)',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop'
    },
    {
      id: 'fr2',
      name: 'Ratatouille',
      calories: 120,
      protein: 3,
      carbs: 14,
      fat: 6,
      serving_size: '1 cup (200g)',
      image_url: 'https://images.unsplash.com/photo-1625944524126-3d1c7fe8eb64?w=300&h=200&fit=crop'
    }
  ],
  in: [
    {
      id: 'in1',
      name: 'Chicken Biryani',
      calories: 360,
      protein: 18,
      carbs: 45,
      fat: 12,
      serving_size: '1 cup (250g)',
      image_url: 'https://images.unsplash.com/photo-1625944524126-3d1c7fe8eb64?w=300&h=200&fit=crop'
    },
    {
      id: 'in2',
      name: 'Masala Dosa',
      calories: 180,
      protein: 5,
      carbs: 30,
      fat: 4,
      serving_size: '1 dosa (150g)',
      image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=200&fit=crop'
    }
  ],
  cn: [
    {
      id: 'cn1',
      name: 'Kung Pao Chicken',
      calories: 280,
      protein: 20,
      carbs: 18,
      fat: 14,
      serving_size: '1 serving (200g)',
      image_url: 'https://images.unsplash.com/photo-1604909053309-799b5a68cc5e?w=300&h=200&fit=crop'
    },
    {
      id: 'cn2',
      name: 'Dumplings (Jiaozi)',
      calories: 45,
      protein: 2,
      carbs: 5,
      fat: 2,
      serving_size: '1 dumpling (15g)',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop'
    }
  ],
  th: [
    {
      id: 'th1',
      name: 'Pad Thai',
      calories: 400,
      protein: 18,
      carbs: 60,
      fat: 12,
      serving_size: '1 plate (350g)',
      image_url: 'https://images.unsplash.com/photo-1600628421055-4d8a9a35d1a5?w=300&h=200&fit=crop'
    },
    {
      id: 'th2',
      name: 'Green Curry',
      calories: 320,
      protein: 20,
      carbs: 10,
      fat: 22,
      serving_size: '1 bowl (300g)',
      image_url: 'https://images.unsplash.com/photo-1604908553700-ef3a3327762d?w=300&h=200&fit=crop'
    }
  ],
  ar: [
    {
      id: 'ar1',
      name: 'Asado (Grilled Beef)',
      calories: 300,
      protein: 30,
      carbs: 0,
      fat: 20,
      serving_size: '150g',
      image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&h=200&fit=crop'
    },
    {
      id: 'ar2',
      name: 'Empanada',
      calories: 250,
      protein: 10,
      carbs: 28,
      fat: 10,
      serving_size: '1 piece',
      image_url: 'https://images.unsplash.com/photo-1617093727343-370ee18d3c6e?w=300&h=200&fit=crop'
    }
  ],
  kr: [
    {
      id: 'kr1',
      name: 'Bibimbap',
      calories: 490,
      protein: 20,
      carbs: 70,
      fat: 12,
      serving_size: '1 bowl (450g)',
      image_url: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=300&h=200&fit=crop'
    },
    {
      id: 'kr2',
      name: 'Kimchi',
      calories: 15,
      protein: 1,
      carbs: 2,
      fat: 0,
      serving_size: '50g',
      image_url: 'https://images.unsplash.com/photo-1601050690114-2f4c5220d4c1?w=300&h=200&fit=crop'
    }
  ],
  vn: [
    {
      id: 'vn1',
      name: 'Pho',
      calories: 350,
      protein: 20,
      carbs: 50,
      fat: 8,
      serving_size: '1 bowl (400g)',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop'
    },
    {
      id: 'vn2',
      name: 'Banh Mi',
      calories: 420,
      protein: 18,
      carbs: 55,
      fat: 14,
      serving_size: '1 sandwich',
      image_url: 'https://images.unsplash.com/photo-1604909052743-84f0ed803b81?w=300&h=200&fit=crop'
    }
  ],
  be: [
    {
      id: 'be1',
      name: 'Belgian Waffle',
      calories: 291,
      protein: 6,
      carbs: 34,
      fat: 14,
      serving_size: '1 waffle (100g)',
      image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop'
    },
    {
      id: 'be2',
      name: 'Moules-Frites',
      calories: 650,
      protein: 35,
      carbs: 60,
      fat: 28,
      serving_size: '1 serving',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop'
    }
  ],
  gr: [
    {
      id: 'gr1',
      name: 'Greek Salad',
      calories: 180,
      protein: 6,
      carbs: 10,
      fat: 12,
      serving_size: '1 bowl (200g)',
      image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=200&fit=crop'
    },
    {
      id: 'gr2',
      name: 'Gyros',
      calories: 400,
      protein: 25,
      carbs: 35,
      fat: 16,
      serving_size: '1 pita',
      image_url: 'https://images.unsplash.com/photo-1617191519400-7e5f1dfbec20?w=300&h=200&fit=crop'
    }
  ],
  lb: [
    {
      id: 'lb1',
      name: 'Tabbouleh',
      calories: 180,
      protein: 5,
      carbs: 24,
      fat: 7,
      serving_size: '1 cup (200g)',
      image_url: 'https://images.unsplash.com/photo-1625944524126-3d1c7fe8eb64?w=300&h=200&fit=crop'
    },
    {
      id: 'lb2',
      name: 'Hummus',
      calories: 166,
      protein: 7,
      carbs: 14,
      fat: 9,
      serving_size: '1/2 cup (100g)',
      image_url: 'https://images.unsplash.com/photo-1604908554027-8aa0d82b34e4?w=300&h=200&fit=crop'
    }
  ],
  id: [
    {
      id: 'id1',
      name: 'Nasi Goreng',
      calories: 360,
      protein: 12,
      carbs: 55,
      fat: 10,
      serving_size: '1 plate (300g)',
      image_url: 'https://images.unsplash.com/photo-1566289289988-0d2439b17f5d?w=300&h=200&fit=crop'
    },
    {
      id: 'id2',
      name: 'Satay (Chicken)',
      calories: 200,
      protein: 18,
      carbs: 6,
      fat: 12,
      serving_size: '3 skewers',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop'
    }
  ],
  pt: [
    {
      id: 'pt1',
      name: 'Bacalhau à Brás',
      calories: 420,
      protein: 28,
      carbs: 25,
      fat: 22,
      serving_size: '1 plate (300g)',
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop'
    },
    {
      id: 'pt2',
      name: 'Pastel de Nata',
      calories: 210,
      protein: 5,
      carbs: 26,
      fat: 10,
      serving_size: '1 tart',
      image_url: 'https://images.unsplash.com/photo-1589307004173-3c952f7f1c35?w=300&h=200&fit=crop'
    }
  ],
  et: [
    {
      id: 'et1',
      name: 'Injera with Doro Wat',
      calories: 480,
      protein: 25,
      carbs: 55,
      fat: 16,
      serving_size: '1 plate (350g)',
      image_url: 'https://images.unsplash.com/photo-1630409349867-3c9aa47cd1ab?w=300&h=200&fit=crop'
    },
    {
      id: 'et2',
      name: 'Shiro Wat',
      calories: 220,
      protein: 10,
      carbs: 24,
      fat: 8,
      serving_size: '1 cup (200g)',
      image_url: 'https://images.unsplash.com/photo-1608142172760-7a6f66a701d1?w=300&h=200&fit=crop'
    }
  ],
  sy: [
    {
      id: 'sy1',
      name: 'Kibbeh',
      calories: 280,
      protein: 16,
      carbs: 24,
      fat: 12,
      serving_size: '3 pieces (150g)',
      image_url: 'https://images.unsplash.com/photo-1625944524126-3d1c7fe8eb64?w=300&h=200&fit=crop'
    },
    {
      id: 'sy2',
      name: 'Fattoush',
      calories: 190,
      protein: 5,
      carbs: 22,
      fat: 9,
      serving_size: '1 bowl (220g)',
      image_url: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=300&h=200&fit=crop'
    }
  ]
};

// Popular branded foods fallback
const BRANDED_FOODS: FoodItem[] = [
  {
    id: 'b1',
    name: 'Coca-Cola (12 fl oz can)',
    calories: 140,
    protein: 0,
    carbs: 39,
    fat: 0,
    serving_size: '355 ml',
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop'
  },
  {
    id: 'b2',
    name: 'Sprite (12 fl oz can)',
    calories: 140,
    protein: 0,
    carbs: 38,
    fat: 0,
    serving_size: '355 ml',
    image_url: 'https://images.unsplash.com/photo-1620207418302-439b387441b0?w=300&h=200&fit=crop'
  },
  {
    id: 'b3',
    name: 'Pepsi (12 fl oz can)',
    calories: 150,
    protein: 0,
    carbs: 41,
    fat: 0,
    serving_size: '355 ml',
    image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=200&fit=crop'
  },
  {
    id: 'b4',
    name: 'Fanta Orange (12 fl oz can)',
    calories: 160,
    protein: 0,
    carbs: 44,
    fat: 0,
    serving_size: '355 ml',
    image_url: 'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=300&h=200&fit=crop'
  },
  {
    id: 'b5',
    name: 'Red Bull (8.4 fl oz can)',
    calories: 110,
    protein: 1,
    carbs: 27,
    fat: 0,
    serving_size: '250 ml',
    image_url: 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=300&h=200&fit=crop'
  },
  {
    id: 'b6',
    name: 'Oreo Cookies (3 cookies)',
    calories: 160,
    protein: 2,
    carbs: 25,
    fat: 7,
    serving_size: '34 g',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476f?w=300&h=200&fit=crop'
  },
  {
    id: 'b7',
    name: 'KitKat Bar (1 bar)',
    calories: 218,
    protein: 3,
    carbs: 27,
    fat: 11,
    serving_size: '42 g',
    image_url: 'https://images.unsplash.com/photo-1590080876475-c8159d7b62db?w=300&h=200&fit=crop'
  },
  {
    id: 'b8',
    name: 'Snickers Bar (1 bar)',
    calories: 250,
    protein: 4,
    carbs: 33,
    fat: 12,
    serving_size: '52 g',
    image_url: 'https://images.unsplash.com/photo-1623653483621-257a7b82d49a?w=300&h=200&fit=crop'
  },
  {
    id: 'b9',
    name: "McDonald's Big Mac",
    calories: 550,
    protein: 25,
    carbs: 45,
    fat: 30,
    serving_size: '1 burger',
    image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=300&h=200&fit=crop'
  },
  {
    id: 'b10',
    name: "McDonald's Medium Fries",
    calories: 340,
    protein: 5,
    carbs: 44,
    fat: 16,
    serving_size: '117 g',
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=200&fit=crop'
  },
  {
    id: 'b11',
    name: 'Pepperoni Pizza (1 slice)',
    calories: 298,
    protein: 12,
    carbs: 34,
    fat: 12,
    serving_size: '1 slice (107 g)',
    image_url: 'https://images.unsplash.com/photo-1548367898-6b8a02ef7a1e?w=300&h=200&fit=crop'
  },
  {
    id: 'b12',
    name: 'KFC Original Recipe Drumstick',
    calories: 130,
    protein: 12,
    carbs: 3,
    fat: 7,
    serving_size: '1 piece (71 g)',
    image_url: 'https://images.unsplash.com/photo-1604908554027-8aa0d82b34e4?w=300&h=200&fit=crop'
  },
  {
    id: 'b13',
    name: 'Subway 6" Turkey Breast Sandwich',
    calories: 280,
    protein: 18,
    carbs: 46,
    fat: 3.5,
    serving_size: '1 sandwich',
    image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop'
  },
  {
    id: 'b14',
    name: 'Nutella (2 tbsp)',
    calories: 200,
    protein: 2,
    carbs: 22,
    fat: 11,
    serving_size: '37 g',
    image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop'
  },
  {
    id: 'b15',
    name: 'Pringles Original (1 oz)',
    calories: 150,
    protein: 1,
    carbs: 16,
    fat: 9,
    serving_size: '28 g',
    image_url: 'https://images.unsplash.com/photo-1592769568495-73f24264f0ff?w=300&h=200&fit=crop'
  },
  {
    id: 'b16',
    name: 'Doritos Nacho Cheese (1 oz)',
    calories: 150,
    protein: 2,
    carbs: 18,
    fat: 8,
    serving_size: '28 g',
    image_url: 'https://images.unsplash.com/photo-1619582136765-2f58e445a415?w=300&h=200&fit=crop'
  },
  {
    id: 'b17',
    name: "Lay's Classic (1 oz)",
    calories: 160,
    protein: 2,
    carbs: 15,
    fat: 10,
    serving_size: '28 g',
    image_url: 'https://images.unsplash.com/photo-1585237012444-f855745f7b36?w=300&h=200&fit=crop'
  },
  {
    id: 'b18',
    name: 'Twix Bar (1 bar)',
    calories: 250,
    protein: 3,
    carbs: 34,
    fat: 12,
    serving_size: '50 g',
    image_url: 'https://images.unsplash.com/photo-1586788224331-947205409241?w=300&h=200&fit=crop'
  },
  {
    id: 'b19',
    name: 'Starbucks Frappuccino (bottle 13.7 oz)',
    calories: 290,
    protein: 9,
    carbs: 46,
    fat: 4.5,
    serving_size: '405 ml',
    image_url: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=300&h=200&fit=crop'
  },
  {
    id: 'b20',
    name: "Ben & Jerry's Half Baked (100 g)",
    calories: 270,
    protein: 4,
    carbs: 32,
    fat: 14,
    serving_size: '100 g',
    image_url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=300&h=200&fit=crop'
  }
];

export const searchFoods = async (query: string): Promise<FoodItem[]> => {
  if (!query.trim()) {
    return [...BRANDED_FOODS.slice(0, 6), ...MOCK_FOODS.slice(0, 6)];
  }

  try {
    const [off, nx] = await Promise.all([
      searchOpenFoodFactsAPI(query).catch((e) => {
        console.error('[OpenFoodFacts] search error (ignored):', e instanceof Error ? e.message : String(e));
        return [] as FoodItem[];
      }),
      searchNutritionXAPI(query).catch((e) => {
        console.error('[Nutritionix] search error (ignored):', e instanceof Error ? e.message : String(e));
        return [] as FoodItem[];
      }),
    ]);

    const merged: FoodItem[] = [];
    const seen = new Set<string>();

    const local = searchMockFoods(query);

    [...local, ...off, ...nx].forEach((item) => {
      const key = `${item.name}|${item.serving_size}|${item.calories}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    });

    if (merged.length > 0) return merged.slice(0, 20);

    return searchMockFoods(query);
  } catch (error) {
    console.error('Error searching foods:', error);
    return searchMockFoods(query);
  }
};

// Nutritionix API integration
const searchNutritionXAPI = async (query: string): Promise<FoodItem[]> => {
  if (!nutritionixEnabled()) {
    return [];
  }

  const creds = getNutritionixCredentials();
  console.log('Searching Nutritionix API for:', query);

  try {
    const response = await fetch(`${API_CONFIG.NUTRITIONX.BASE_URL}/search/instant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': creds.appId,
        'x-app-key': creds.apiKey,
        'x-remote-user-id': '0',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NutritionX API error response:', errorText);
      throw new Error(`NutritionX API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const foods: FoodItem[] = [];

    if (Array.isArray(data.common)) {
      data.common.slice(0, 8).forEach((item: any, index: number) => {
        const nutrients = item.full_nutrients || [];
        const calories = nutrients.find((n: any) => n.attr_id === 208)?.value || 0;
        const protein = nutrients.find((n: any) => n.attr_id === 203)?.value || 0;
        const carbs = nutrients.find((n: any) => n.attr_id === 205)?.value || 0;
        const fat = nutrients.find((n: any) => n.attr_id === 204)?.value || 0;

        foods.push({
          id: `nutritionx_common_${index}`,
          name: item.food_name,
          calories: Math.round(calories),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fat: Math.round(fat),
          serving_size: `${item.serving_qty || 1} ${item.serving_unit || 'serving'}`,
          image_url: item.photo?.thumb || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
        });
      });
    }

    if (Array.isArray(data.branded)) {
      data.branded.slice(0, 7).forEach((item: any, index: number) => {
        foods.push({
          id: `nutritionx_branded_${index}`,
          name: item.food_name,
          calories: Math.round(item.nf_calories || 0),
          protein: Math.round(item.nf_protein || 0),
          carbs: Math.round(item.nf_total_carbohydrate || 0),
          fat: Math.round(item.nf_total_fat || 0),
          serving_size: `${item.serving_qty || 1} ${item.serving_unit || 'serving'}`,
          image_url: item.photo?.thumb || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
        });
      });
    }

    console.log(`[Nutritionix] results: ${foods.length}`);
    return foods.slice(0, 10);
  } catch (error) {
    console.error('[Nutritionix] API error (suppressed to fallback):', error instanceof Error ? error.message : String(error));
    return [];
  }
};

// OpenFoodFacts API integration
const searchOpenFoodFactsAPI = async (query: string): Promise<FoodItem[]> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15&fields=product_name,nutriments,image_url,serving_size,brands`
    );

    if (!response.ok) {
      throw new Error(`OpenFoodFacts API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return [];
    }

    const foods: FoodItem[] = data.products
      .filter((product: any) => {
        return product.product_name &&
               product.nutriments &&
               (product.nutriments['energy-kcal_100g'] || product.nutriments.energy_100g) &&
               product.product_name.length > 2;
      })
      .map((product: any, index: number) => {
        const calories = product.nutriments['energy-kcal_100g'] ||
                        (product.nutriments.energy_100g ? product.nutriments.energy_100g / 4.184 : 0);

        return {
          id: `openfoodfacts_${index}`,
          name: product.brands ? `${product.product_name} (${String(product.brands).split(',')[0]})` : product.product_name,
          calories: Math.round(calories),
          protein: Math.round(product.nutriments.proteins_100g || 0),
          carbs: Math.round(product.nutriments.carbohydrates_100g || 0),
          fat: Math.round(product.nutriments.fat_100g || 0),
          serving_size: product.serving_size || '100g',
          image_url: product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
        } as FoodItem;
      });

    return foods.slice(0, 10);
  } catch (error) {
    console.error('OpenFoodFacts API error:', error);
    return [];
  }
};

// Mock search fallback
const searchMockFoods = (query: string): FoodItem[] => {
  const searchTerms = query.toLowerCase().split(' ');
  const pool = [...MOCK_FOODS, ...BRANDED_FOODS];
  
  return pool.filter(food => {
    const foodName = food.name.toLowerCase();
    return searchTerms.some(term => 
      foodName.includes(term) || 
      (term.length > 2 && foodName.includes(term.substring(0, 3)))
    );
  }).sort((a, b) => {
    const aExact = a.name.toLowerCase().includes(query.toLowerCase());
    const bExact = b.name.toLowerCase().includes(query.toLowerCase());
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });
};

export const getFoodsByCountry = async (countryCode: string): Promise<FoodItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const foods = COUNTRY_FOODS[countryCode as keyof typeof COUNTRY_FOODS] || [];
  return foods;
};

export const getFoodSuggestions = async (): Promise<FoodItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const healthyFoods = MOCK_FOODS.filter(food => 
    food.calories < 200 || food.protein > 15
  );
  const shuffled = [...healthyFoods].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};

export const scanBarcode = async (barcode: string): Promise<FoodItem | null> => {
  try {
    const response = await fetch(`${API_CONFIG.OPENFOODFACTS.BASE_URL}/product/${barcode}.json`);
    if (!response.ok) {
      throw new Error(`OpenFoodFacts barcode API error: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 0 || !data.product) {
      return null;
    }
    const product = data.product;
    const foodItem: FoodItem = {
      id: `barcode_${barcode}`,
      name: product.product_name || 'Unknown Product',
      calories: Math.round(product.nutriments['energy-kcal_100g'] || (product.nutriments.energy_100g ? product.nutriments.energy_100g / 4.184 : 0) || 0),
      protein: Math.round(product.nutriments.proteins_100g || 0),
      carbs: Math.round(product.nutriments.carbohydrates_100g || 0),
      fat: Math.round(product.nutriments.fat_100g || 0),
      serving_size: product.serving_size || '100g',
      image_url: product.image_url || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
    };
    return foodItem;
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return {
      id: `barcode_${barcode}`,
      name: 'Scanned Product',
      calories: 150,
      protein: 5,
      carbs: 20,
      fat: 6,
      serving_size: '1 package',
      image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop'
    } as FoodItem;
  }
};

export const getNutritionDetails = async (foodName: string): Promise<FoodItem | null> => {
  if (!nutritionixEnabled()) {
    return null;
  }
  const creds = getNutritionixCredentials();
  try {
    const response = await fetch(`${API_CONFIG.NUTRITIONX.BASE_URL}/natural/nutrients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': creds.appId,
        'x-app-key': creds.apiKey,
        'x-remote-user-id': '0',
      },
      body: JSON.stringify({ query: foodName }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NutritionX details API error response:', errorText);
      throw new Error(`NutritionX details API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.foods || data.foods.length === 0) {
      return null;
    }
    const food = data.foods[0];
    return {
      id: `nutritionx_detail_${Date.now()}`,
      name: food.food_name,
      calories: Math.round(food.nf_calories || 0),
      protein: Math.round(food.nf_protein || 0),
      carbs: Math.round(food.nf_total_carbohydrate || 0),
      fat: Math.round(food.nf_total_fat || 0),
      serving_size: `${food.serving_qty} ${food.serving_unit}`,
      image_url: food.photo?.highres || food.photo?.thumb || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
    } as FoodItem;
  } catch (error) {
    console.error('[Nutritionix] Details API error (suppressed to fallback):', error instanceof Error ? error.message : String(error));
    return null;
  }
};

export const searchNutritionXFoods = async (query: string, filters?: {
  maxCalories?: number;
  minProtein?: number;
  category?: string;
}): Promise<FoodItem[]> => {
  let results = await searchFoods(query);
  if (filters) {
    results = results.filter(food => {
      if (filters.maxCalories !== undefined && food.calories > filters.maxCalories) return false;
      if (filters.minProtein !== undefined && food.protein < filters.minProtein) return false;
      return true;
    });
  }
  return results;
};

export const searchFoodsByCategory = async (category: string): Promise<FoodItem[]> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}&json=1&page_size=25&fields=product_name,nutriments,image_url,serving_size,brands`
    );

    if (!response.ok) {
      throw new Error(`OpenFoodFacts category API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.products || data.products.length === 0) {
      return [];
    }

    const foods: FoodItem[] = data.products
      .filter((product: any) => {
        return product.product_name && 
               product.nutriments && 
               (product.nutriments['energy-kcal_100g'] || product.nutriments.energy_100g) &&
               product.product_name.length > 2;
      })
      .map((product: any, index: number) => {
        const calories = product.nutriments['energy-kcal_100g'] || 
                        (product.nutriments.energy_100g ? product.nutriments.energy_100g / 4.184 : 0);
        return {
          id: `category_${category}_${index}`,
          name: product.brands ? `${product.product_name} (${String(product.brands).split(',')[0]})` : product.product_name,
          calories: Math.round(calories),
          protein: Math.round(product.nutriments.proteins_100g || 0),
          carbs: Math.round(product.nutriments.carbohydrates_100g || 0),
          fat: Math.round(product.nutriments.fat_100g || 0),
          serving_size: product.serving_size || '100g',
          image_url: product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
        } as FoodItem;
      })
      .slice(0, 20);

    return foods;
  } catch (error) {
    console.error('Category search error:', error);
    return [];
  }
};
