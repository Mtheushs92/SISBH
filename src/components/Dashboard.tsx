import React, { useState, useMemo } from 'react';
import { useTimeBank } from '../context/TimeBankContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { formatMinutesToHHMM } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { employees, getEmployeeBalance } = useTimeBank();
  
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [filterEmployeeId, setFilterEmployeeId] = useState('');

  const summary = useMemo(() => {
    // Generate start and end date for the selected month
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    if (filterMonth) {
      startDate = `${filterMonth}-01`;
      endDate = `${filterMonth}-31`; 
    }

    let filteredEmployees = employees;
    if (filterEmployeeId) {
      filteredEmployees = employees.filter(e => e.id === filterEmployeeId);
    }

    return filteredEmployees.map(emp => {
      const balance = getEmployeeBalance(emp.id, startDate, endDate);
      return {
        ...emp,
        ...balance,
        // Convert to hours for charting
        bhPlusHours: Number((balance.bhPlus / 60).toFixed(2)),
        bhMinusHours: Number((balance.bhMinus / 60).toFixed(2)),
        balanceHours: Number((balance.balance / 60).toFixed(2)),
      };
    }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [employees, filterMonth, filterEmployeeId, getEmployeeBalance]);

  const totals = useMemo(() => {
    const bhPlus = summary.reduce((acc, curr) => acc + curr.bhPlus, 0);
    const bhMinus = summary.reduce((acc, curr) => acc + curr.bhMinus, 0);
    return { bhPlus, bhMinus, balance: bhPlus - bhMinus };
  }, [summary]);

  const chartData = useMemo(() => summary.filter(s => s.bhPlus > 0 || s.bhMinus > 0), [summary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div className="title-group">
          <h1 className="text-[1.5rem] font-bold tracking-tight text-[#1e293b]">Dashboard</h1>
          <p className="text-[#64748b] text-[0.875rem]">Visão consolidada e gráficos analíticos</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-4 bg-white p-3 rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-[0.7rem] font-bold text-[#64748b] uppercase tracking-wider">Filtro Servidor</label>
            <select
              className="flex h-[38px] w-full sm:w-[220px] rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-[0.875rem] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6]"
              value={filterEmployeeId}
              onChange={e => setFilterEmployeeId(e.target.value)}
            >
              <option value="">[ Todos os Servidores ]</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-[0.7rem] font-bold text-[#64748b] uppercase tracking-wider">Mês de Referência</label>
            <Input 
              type="month" 
              value={filterMonth} 
              onChange={e => setFilterMonth(e.target.value)}
              className="w-full sm:w-[160px] bg-[#f8fafc] h-[38px] py-0"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Servidores Analisados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1e3a8a]">{summary.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total BH +</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#10b981]">{formatMinutesToHHMM(totals.bhPlus)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total BH -</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#ef4444]">{formatMinutesToHHMM(totals.bhMinus)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saldo Líquido Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.balance > 0 ? 'text-[#10b981]' : totals.balance < 0 ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
              {formatMinutesToHHMM(totals.balance, true)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Banco de Horas (em horas)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{fontSize: 11, fill: '#64748b'}} 
                    tickFormatter={(val) => val ? String(val).split(' ')[0] : ''} 
                    stroke="#e2e8f0"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{fontSize: 11, fill: '#64748b'}} stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    formatter={(value: number) => [`${value}h`, undefined]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', bottom: 10 }}/>
                  <Bar dataKey="bhPlusHours" name="BH+ (Horas)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="bhMinusHours" name="BH- (Horas)" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#64748b] bg-[#f8fafc] rounded-lg border border-dashed border-[#e2e8f0]">
                <p className="text-sm font-medium">Nenhum lançamento no período filtrado</p>
                <p className="text-xs mt-1">Os servidores não possuem horas registradas para exibição gráfica.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabela de Saldos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto mt-2">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th className="p-3 text-left align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">Matrícula</th>
                  <th className="p-3 text-left align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">Nome do Servidor</th>
                  <th className="p-3 text-right align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">BH +</th>
                  <th className="p-3 text-right align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">BH -</th>
                  <th className="p-3 text-right align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">Líquido</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {summary.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-[#64748b]">Nenhum servidor encontrado com estes filtros.</td>
                  </tr>
                )}
                {summary.map((row) => (
                  <tr key={row.id} className="border-b border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors">
                    <td className="p-3 align-middle text-[0.875rem]">{row.id}</td>
                    <td className="p-3 align-middle text-[0.875rem] font-medium text-[#1e293b]">{row.name}</td>
                    <td className="p-3 align-middle text-[0.875rem] text-right text-[#10b981]">{formatMinutesToHHMM(row.bhPlus)}</td>
                    <td className="p-3 align-middle text-[0.875rem] text-right text-[#ef4444]">{formatMinutesToHHMM(row.bhMinus)}</td>
                    <td className={`p-3 align-middle text-[0.875rem] text-right font-bold ${row.balance > 0 ? 'text-[#10b981]' : row.balance < 0 ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
                      {formatMinutesToHHMM(row.balance, true)}
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
