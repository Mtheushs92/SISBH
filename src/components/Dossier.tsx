import React, { useState, useMemo } from 'react';
import { useTimeBank } from '../context/TimeBankContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { formatMinutesToHHMM } from '../lib/utils';
import { Download, Printer } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Dossier() {
  const { employees, logs, deleteLog } = useTimeBank();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  const employeeData = useMemo(() => {
    if (!selectedEmployeeId) return null;
    
    const emp = employees.find(e => e.id === selectedEmployeeId);
    const empLogs = logs.filter(l => l.employeeId === selectedEmployeeId)
                        .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date
    
    const bhPlus = empLogs.reduce((sum, log) => sum + log.bhPlus, 0);
    const bhMinus = empLogs.reduce((sum, log) => sum + log.bhMinus, 0);
    const balance = bhPlus - bhMinus;

    return { emp, logs: empLogs, bhPlus, bhMinus, balance };
  }, [selectedEmployeeId, employees, logs]);

  const handleExportCSV = () => {
    if (!employeeData) return;

    const headers = ['Data', 'BH +', 'BH -', 'Observacoes'];
    const rows = employeeData.logs.map(log => [
      log.date,
      formatMinutesToHHMM(log.bhPlus),
      formatMinutesToHHMM(log.bhMinus),
      log.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dossie_${employeeData.emp?.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!employeeData || !employeeData.emp) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138); // #1e3a8a
    doc.text("Relatório de Banco de Horas", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59); // #1e293b
    doc.text(`Servidor: ${employeeData.emp.name}`, 14, 32);
    doc.text(`Matrícula: ${employeeData.emp.id}`, 14, 38);
    if(employeeData.emp.sector) doc.text(`Setor: ${employeeData.emp.sector}`, 14, 44);
    
    // Totals
    const rightColX = 140;
    doc.setTextColor(16, 185, 129); // #10b981
    doc.text(`Total BH +: ${formatMinutesToHHMM(employeeData.bhPlus)}`, rightColX, 32);
    doc.setTextColor(239, 68, 68); // #ef4444
    doc.text(`Total BH -: ${formatMinutesToHHMM(employeeData.bhMinus)}`, rightColX, 38);
    
    doc.setFont('', 'bold');
    doc.setTextColor(30, 41, 59); // #1e293b
    doc.text(`Saldo Geral: ${formatMinutesToHHMM(employeeData.balance, true)}`, rightColX, 44);
    doc.setFont('', 'normal');

    // Table
    const tableColumn = ["Data", "BH +", "BH -", "Observações"];
    const tableRows = employeeData.logs.map(log => [
      format(parseISO(log.date), 'dd/MM/yyyy'),
      formatMinutesToHHMM(log.bhPlus),
      formatMinutesToHHMM(log.bhMinus),
      log.notes || '-'
    ]);

    autoTable(doc, {
      startY: 52,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] }, // #1e3a8a
      styles: { fontSize: 10 }
    });

    const safeName = employeeData.emp.name.replace(/\s+/g, '_');
    doc.save(`Dossie_${employeeData.emp.id}_${safeName}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Dossiê do Servidor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-[#1e293b]">Selecione o Servidor</label>
              <select
                className="flex w-full rounded-[6px] border border-[#e2e8f0] bg-white px-3 py-[8px] text-[0.875rem] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6]"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            {employeeData && (
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" /> Exportar CSV
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {employeeData && (
        <Card className="print:shadow-none print:border-none print:m-0 print:p-0">
          <CardHeader className="print:p-0">
            <h3 className="text-[1.5rem] font-bold tracking-tight text-[#1e293b] pb-4 border-b border-[#e2e8f0]">
              Relatório de Banco de Horas
            </h3>
            <div className="pt-4 grid grid-cols-2 gap-4 text-[0.875rem] text-[#1e293b]">
              <div>
                <p><span className="font-semibold text-[#64748b]">Servidor:</span> {employeeData.emp?.name}</p>
                <p><span className="font-semibold text-[#64748b]">Matrícula:</span> {employeeData.emp?.id}</p>
              </div>
              <div className="text-right">
                <p><span className="font-semibold text-[#10b981]">Total BH +:</span> {formatMinutesToHHMM(employeeData.bhPlus)}</p>
                <p><span className="font-semibold text-[#ef4444]">Total BH -:</span> {formatMinutesToHHMM(employeeData.bhMinus)}</p>
                <p className="text-lg mt-1">
                  <span className="font-bold text-[#1e293b]">Saldo Geral: </span> 
                  <span className={`font-bold ${employeeData.balance > 0 ? 'text-[#10b981]' : employeeData.balance < 0 ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
                    {formatMinutesToHHMM(employeeData.balance, true)}
                  </span>
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="print:p-0 print:pt-4">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="p-3 text-left align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">Data</th>
                    <th className="p-3 text-right align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">BH +</th>
                    <th className="p-3 text-right align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">BH -</th>
                    <th className="p-3 text-left align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px]">Observações</th>
                    <th className="p-3 text-right align-middle font-medium text-[#64748b] text-[0.75rem] uppercase tracking-[0.5px] print:hidden">Ação</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {employeeData.logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#64748b]">Nenhum lançamento encontrado.</td>
                    </tr>
                  )}
                  {employeeData.logs.map((log) => (
                    <tr key={log.id} className="border-b border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors">
                      <td className="p-3 align-middle text-[0.875rem]">
                        {format(parseISO(log.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-3 align-middle text-[0.875rem] text-right text-[#10b981]">{formatMinutesToHHMM(log.bhPlus)}</td>
                      <td className="p-3 align-middle text-[0.875rem] text-right text-[#ef4444]">{formatMinutesToHHMM(log.bhMinus)}</td>
                      <td className="p-3 align-middle text-[0.875rem] text-left max-w-xs">{log.notes || '-'}</td>
                      <td className="p-3 align-middle text-right print:hidden">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteLog(log.id)} 
                          className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#fef2f2]"
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
