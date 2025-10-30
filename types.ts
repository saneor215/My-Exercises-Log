export type BodyPartId = 'upper' | 'lower' | 'friday' | string;

export type View = 'log' | 'calendar' | 'progress' | 'diet' | 'settings';

export interface BodyPart {
    id: BodyPartId;
    name: string;
    icon: string;
    color: string;
    gradient: string;
}

export interface Exercise {
    name:string;
    image: string;
}

export interface WorkoutEntry {
    id: string;
    part: BodyPartId;
    exercise: string;
    weight: number;
    reps: number;
    date: string;
    image: string;
    comment?: string;
    week: number;
}

export interface RoutineExercise {
    partId: BodyPartId;
    exerciseName: string;
}

export interface WorkoutRoutine {
    id: string;
    name: string;
    exercises: RoutineExercise[];
}

// Nutrition Tracking Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string; // e.g., "100g", "1 cup", "1 piece"
}

export interface LoggedFood {
    id: string;
    foodId: string;
    servings: number;
}

export interface DailyDietLog {
    [date: string]: { // YYYY-MM-DD format
        [meal in MealType]?: LoggedFood[];
    };
}

export interface NutritionGoals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

// For Import/Export
export interface AppData {
    log: WorkoutEntry[];
    bodyParts: BodyPart[];
    exercises: Record<BodyPartId, Exercise[]>;
    routines: WorkoutRoutine[];
    nutritionGoals: NutritionGoals;
    foodDatabase: FoodItem[];
    dailyDietLogs: DailyDietLog;
}
