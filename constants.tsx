import type { BodyPart, BodyPartId, Exercise, NutritionGoals, FoodItem, DailyDietLog } from './types';

export const INITIAL_BODY_PARTS: BodyPart[] = [
    { id: 'upper', name: 'علوي', icon: '💪', color: 'blue', gradient: 'from-blue-500 to-cyan-400' },
    { id: 'lower', name: 'سفلي', icon: '🦵', color: 'green', gradient: 'from-green-500 to-lime-400' },
    { id: 'friday', name: 'معدة', icon: '🔥', color: 'yellow', gradient: 'from-yellow-500 to-amber-400' }
];

export const INITIAL_EXERCISES: Record<BodyPartId, Exercise[]> = {
  upper: [
    { name: "Lat Pulldown (ظهر1)", image: "https://picsum.photos/seed/latpulldown/100/100" },
    { name: "Seated Row (ظهر2)", image: "https://picsum.photos/seed/seatedrow/100/100" },
    { name: "Chest Press (صدر1)", image: "https://picsum.photos/seed/chestpress/100/100" },
    { name: "Incline Chest Press (صدر2)", image: "https://picsum.photos/seed/inclinepress/100/100" },
    { name: "Barbell Bench Press (صدر3)", image: "https://picsum.photos/seed/benchpress/100/100" },
    { name: "Butterfly (صدر4)", image: "https://picsum.photos/seed/butterfly/100/100" },
    { name: "Lateral Raise (أكتاف جانبي)", image: "https://picsum.photos/seed/latraise/100/100" },
    { name: "Shoulder Press (ضغط أكتاف)", image: "https://picsum.photos/seed/shoulderpress/100/100" },
    { name: "Pushdown (تراي)", image: "https://picsum.photos/seed/pushdown/100/100" },
    { name: "Seated Triceps Extension (تراي آلة)", image: "https://picsum.photos/seed/tricepsext/100/100" },
    { name: "Cable Curl (باي)", image: "https://picsum.photos/seed/cablecurl/100/100" },
    { name: "Biceps Curl Machine (باي آلة)", image: "https://picsum.photos/seed/bicepcurl/100/100" }
  ],
  lower: [
    { name: "Leg Press (رجل1)", image: "https://picsum.photos/seed/legpress/100/100" },
    { name: "Leg Curl (رجل2)", image: "https://picsum.photos/seed/legcurl/100/100" },
    { name: "Leg Extension (رجل3)", image: "https://picsum.photos/seed/legextension/100/100" },
    { name: "Seated Calf Raise (سمانة1)", image: "https://picsum.photos/seed/calfraise/100/100" },
    { name: "Standing Calf Raise (سمانة2)", image: "https://picsum.photos/seed/standingcalf/100/100" },
    { name: "Seated Adductor Machine (رجل داخلي)", image: "https://picsum.photos/seed/adductor/100/100" },
    { name: "Seated Hip Abduction (رجل خارجي)", image: "https://picsum.photos/seed/abduction/100/100" }
  ],
  friday: [
    { name: "Abdominal Crunch (معدة)", image: "https://picsum.photos/seed/crunch/100/100" },
    { name: "Abdominal Machine (معدة واقف)", image: "https://picsum.photos/seed/abmachine/100/100" },
    { name: "Rotary torso machine (خواصر)", image: "https://picsum.photos/seed/torso/100/100" },
    { name: "Back Extension (تمدد الظهر)", image: "https://picsum.photos/seed/backext/100/100" },
    { name: "Cardio Bike (دراجة)", image: "https://picsum.photos/seed/bike/100/100" },
    { name: "Cardio Treadmill (مشاية)", image: "https://picsum.photos/seed/treadmill/100/100" }
  ]
};


// Nutrition Constants
export const INITIAL_NUTRITION_GOALS: NutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
};

export const INITIAL_FOOD_DATABASE: FoodItem[] = [
    { id: 'food-1', name: 'صدر دجاج', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g' },
    { id: 'food-2', name: 'رز أبيض', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g مطبوخ' },
    { id: 'food-3', name: 'بيضة مسلوقة', calories: 78, protein: 6, carbs: 0.6, fat: 5, servingSize: '1 كبيرة' },
    { id: 'food-4', name: 'زيت زيتون', calories: 119, protein: 0, carbs: 0, fat: 13.5, servingSize: '1 ملعقة كبيرة' },
];

export const INITIAL_DAILY_DIET_LOGS: DailyDietLog = {};
