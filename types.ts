export enum Gender {
  Male = 'Erkek',
  Female = 'Kadın'
}

export interface TemrinScores {
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  t5: number;
}

export interface Student {
  id: string;
  studentNo: string;
  fullName: string;
  gender: Gender;
  scores: TemrinScores;
  average: number;
  createdAt: number;
}

export type StudentFormData = Omit<Student, 'id' | 'average' | 'createdAt'>;

export interface ChartDataPoint {
  name: string;
  value: number;
}