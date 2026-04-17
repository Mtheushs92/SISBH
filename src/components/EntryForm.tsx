import React, { useState } from 'react';
import { useTimeBank } from '../context/TimeBankContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { parseHHMMToMinutes } from '../lib/utils';
import { format } from 'date-fns';

export function EntryForm() {
  const { employees, addLog } = useTimeBank();
  
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bhPlusHHMM, setBhPlusHHMM] = useState('');
  const [bhMinusHHMM, setBhMinusHHMM] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !date) return;

    const bhPlus = parseHHMMToMinutes(bhPlusHHMM);
    const bhMinus = parseHHMMToMinutes(bhMinusHHMM);

    if (bhPlus === 0 && bhMinus === 0) {
      alert("Por favor, preencha as horas positivas ou negativas.");
      return;
    }

    addLog({
      employeeId,
      date,
      bhPlus,
      bhMinus,
      notes
    });

    // Reset fields
    setBhPlusHHMM('');
    setBhMinusHHMM('');
    setNotes('');
    alert("Horas lançadas com sucesso!");
  };

  return (
    <Card className="max-w-xl mx-auto w-full">
      <CardHeader>
        <CardTitle>Lançamento de Banco de Horas</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1e293b]">Servidor</label>
            <select
              className="flex w-full rounded-[6px] border border-[#e2e8f0] bg-white px-3 py-[8px] text-[0.875rem] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6]"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            >
              <option value="" disabled>Selecione um servidor</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1e293b]">Data</label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#10b981]">BH + (Horas Positivas)</label>
              <Input 
                type="time" 
                value={bhPlusHHMM} 
                onChange={(e) => setBhPlusHHMM(e.target.value)} 
                placeholder="HH:mm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#ef4444]">BH - (Horas Negativas)</label>
              <Input 
                type="time" 
                value={bhMinusHHMM} 
                onChange={(e) => setBhMinusHHMM(e.target.value)} 
                placeholder="HH:mm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1e293b]">Observações (Opcional)</label>
            <Input 
              type="text" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Justificativa..."
            />
          </div>

          <Button type="submit" className="w-full">Salvar Lançamento</Button>
        </form>
      </CardContent>
    </Card>
  );
}
