import React, { useState } from 'react';
import { useTimeBank } from '../context/TimeBankContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2 } from 'lucide-react';

export function EmployeeForm() {
  const { employees, addEmployee, deleteEmployee } = useTimeBank();
  
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [sector, setSector] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !id) return;

    addEmployee({
      id,
      name,
      sector,
      contact,
      email
    });

    // Reset fields
    setName('');
    setId('');
    setSector('');
    setContact('');
    setEmail('');
  };

  const handleDelete = (id: string, name: string) => {
    deleteEmployee(id);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <Card>
        <CardHeader>
          <div className="title-group">
            <h1 className="text-[1.5rem] font-bold tracking-tight text-[#1e293b]">Cadastro de Servidor</h1>
            <p className="text-[#64748b] text-[0.875rem]">Adicione um novo colaborador ao sistema</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1e293b]">Nome Completo</label>
              <Input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value.toUpperCase())} 
                required 
                placeholder="Ex: JOÃO BATISTA DE SOUZA"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1e293b]">Matrícula</label>
                <Input 
                  type="text" 
                  value={id} 
                  onChange={(e) => setId(e.target.value)} 
                  required 
                  placeholder="Apenas números"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1e293b]">Setor</label>
                <Input 
                  type="text" 
                  value={sector} 
                  onChange={(e) => setSector(e.target.value)} 
                  placeholder="Ex: Recursos Humanos"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1e293b]">Contato</label>
                <Input 
                  type="text" 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  placeholder="(11) 9 9999-9999"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1e293b]">E-mail</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="joao.batista@exemplo.com"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2">Cadastrar Servidor</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Servidores Cadastrados ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto mt-2">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th className="p-3 text-left align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">Matrícula</th>
                  <th className="p-3 text-left align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">Nome</th>
                  <th className="p-3 text-left align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">Setor</th>
                  <th className="p-3 text-right align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">Ação</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {employees.map(emp => (
                  <tr key={emp.id} className="border-b border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors">
                    <td className="p-3 align-middle text-[0.875rem]">{emp.id}</td>
                    <td className="p-3 align-middle text-[0.875rem] font-medium text-[#1e293b]">{emp.name}</td>
                    <td className="p-3 align-middle text-[0.875rem]">{emp.sector || '-'}</td>
                    <td className="p-3 align-middle text-right">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDelete(emp.id, emp.name)} 
                        className="text-red-500 hover:text-red-700 bg-white hover:bg-red-50 border-[#e2e8f0]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
