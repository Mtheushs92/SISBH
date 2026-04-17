import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, TimeLog } from '../types';

const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhZ4AvkYuZL5qvp5UJMSThFYo3y0WyPRAyziFaLIVLD5ntFwtosT6lig3I8y9pVoZW/exec";

interface TimeBankContextType {
  employees: Employee[];
  logs: TimeLog[];
  isLoadingLogs: boolean;
  addLog: (log: Omit<TimeLog, 'id' | 'createdAt'>) => void;
  deleteLog: (id: string) => void;
  getEmployeeBalance: (employeeId: string, startDate?: string, endDate?: string) => { bhPlus: number, bhMinus: number, balance: number };
  addEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
}

const TimeBankContext = createContext<TimeBankContextType | undefined>(undefined);

export function TimeBankProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Load from App Script API
  useEffect(() => {
    setIsLoadingLogs(true);
    // Add cache buster to ensure it never catches a stale empty response
    const noCacheToken = Date.now();
    
    // Busca Lançamentos
    fetch(`${APP_SCRIPT_URL}?action=getLogs&t=${noCacheToken}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map((d: any) => ({
            ...d,
            id: String(d.id || '').trim(),
            employeeId: String(d.employeeId || '').trim(),
            bhPlus: Number(d.bhPlus || 0),
            bhMinus: Number(d.bhMinus || 0),
          }));
          setLogs(formatted); // Sempre seta o que vier da nuvem (mesmo se vazio)
        }
      })
      .catch(err => console.error("Erro ao conectar Google Sheets (Logs):", err))
      .finally(() => setIsLoadingLogs(false));

    // Busca Servidores
    fetch(`${APP_SCRIPT_URL}?action=getEmployees&t=${noCacheToken}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formattedEmps = data.map((d: any) => ({
            ...d,
            id: String(d.id || '').trim(), 
            name: String(d.name || 'SERVIDOR SEM NOME').trim()
          }));
          setEmployees(formattedEmps); // Sempre seta o que vier da nuvem (mesmo se vazio)
        }
      })
      .catch(err => console.error("Erro ao conectar Google Sheets (Servidores):", err));
  }, []);

  const addEmployee = (emp: Employee) => {
    setEmployees(prev => {
      // Evitar matricula duplicada
      if (prev.some(e => e.id === emp.id)) {
        alert("Já existe um servidor com esta matrícula.");
        return prev;
      }
      return [...prev, emp].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });

    // Envia pro Sheets
    fetch(APP_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: 'addEmployee', ...emp }) 
    }).catch(err => console.error("Erro ao salvar Servidor no Google Sheets:", err));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    
    // Deleta no Sheets
    fetch(APP_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: 'deleteEmployee', id }) 
    }).catch(err => console.error("Erro ao deletar Servidor no Google Sheets:", err));
  };

  const addLog = (newLogData: Omit<TimeLog, 'id' | 'createdAt'>) => {
    const newLog: TimeLog = {
      ...newLogData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now()
    };
    
    // Otimista: Insere localmente
    setLogs(prev => [...prev, newLog]);

    // Envia pro Sheets
    fetch(APP_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: 'addLog', ...newLog }) 
    }).catch(err => console.error("Erro ao salvar Lançamento no Google Sheets:", err));
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
    
    // Deleta no Sheets
    fetch(APP_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: 'deleteLog', id }) 
    }).catch(err => console.error("Erro ao deletar Lançamento no Google Sheets:", err));
  };

  const getEmployeeBalance = (employeeId: string, startDate?: string, endDate?: string) => {
    let filteredLogs = logs.filter(l => String(l.employeeId).trim() === String(employeeId).trim());
    
    if (startDate) {
      filteredLogs = filteredLogs.filter(l => l.date >= startDate);
    }
    if (endDate) {
      filteredLogs = filteredLogs.filter(l => l.date <= endDate);
    }

    const bhPlus = filteredLogs.reduce((sum, log) => sum + log.bhPlus, 0);
    const bhMinus = filteredLogs.reduce((sum, log) => sum + log.bhMinus, 0);
    return { bhPlus, bhMinus, balance: bhPlus - bhMinus };
  };

  return (
    <TimeBankContext.Provider value={{ employees, logs, isLoadingLogs, addLog, deleteLog, getEmployeeBalance, addEmployee, deleteEmployee }}>
      {children}
    </TimeBankContext.Provider>
  );
}

export function useTimeBank() {
  const context = useContext(TimeBankContext);
  if (context === undefined) {
    throw new Error('useTimeBank must be used within a TimeBankProvider');
  }
  return context;
}
