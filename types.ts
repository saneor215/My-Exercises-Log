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
