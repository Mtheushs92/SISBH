export interface Employee {
  id: string; // Matricula
  name: string;
  sector?: string;
  contact?: string;
  email?: string;
}

export interface TimeLog {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  bhPlus: number; // in minutes
  bhMinus: number; // in minutes
  notes?: string;
  createdAt: number;
}

export type ViewState = 'dashboard' | 'lancamentos' | 'dossie' | 'servidores';
