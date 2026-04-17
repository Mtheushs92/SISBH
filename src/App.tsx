import React, { useState } from 'react';
import { TimeBankProvider, useTimeBank } from './context/TimeBankContext';
import { ViewState } from './types';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { EmployeeForm } from './components/EmployeeForm';
import { Dossier } from './components/Dossier';
import { LayoutDashboard, FileText, UserPlus, Users } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const { logs } = useTimeBank();

  return (
    <div className="h-screen w-full bg-[#f8fafc] text-[#1e293b] flex flex-col md:grid md:grid-cols-[280px_1fr] md:grid-rows-[64px_1fr] overflow-hidden" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <header className="md:col-span-2 bg-[#1e3a8a] text-white flex items-center justify-between px-6 shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-10 shrink-0 h-[64px] print:hidden">
        <div className="font-bold text-xl tracking-tight">SISTEMA DE PONTO WEB</div>
        <div className="flex items-center gap-3 text-sm">
          <span>Adm. Gestão de Pessoas</span>
          <div className="w-8 h-8 bg-white/20 rounded-full"></div>
        </div>
      </header>

      <aside className="bg-[#ffffff] border-r border-[#e2e8f0] p-5 flex flex-col gap-5 overflow-y-auto print:hidden">
        <div>
          <div className="text-[0.75rem] text-[#64748b] uppercase tracking-[0.5px] mb-2 font-medium">Menu Principal</div>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${
                currentView === 'dashboard' ? 'bg-[#eff6ff] text-[#1e3a8a] font-semibold border border-[#dbeafe]' : 'hover:bg-[#f1f5f9]'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard Central
            </button>
            <button
              onClick={() => setCurrentView('lancamentos')}
              className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${
                currentView === 'lancamentos' ? 'bg-[#eff6ff] text-[#1e3a8a] font-semibold border border-[#dbeafe]' : 'hover:bg-[#f1f5f9]'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Lançamento de Horas
            </button>
            <button
              onClick={() => setCurrentView('servidores')}
              className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${
                currentView === 'servidores' ? 'bg-[#eff6ff] text-[#1e3a8a] font-semibold border border-[#dbeafe]' : 'hover:bg-[#f1f5f9]'
              }`}
            >
              <Users className="h-4 w-4" />
              Cadastro de Servidor
            </button>
            <button
              onClick={() => setCurrentView('dossie')}
              className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${
                currentView === 'dossie' ? 'bg-[#eff6ff] text-[#1e3a8a] font-semibold border border-[#dbeafe]' : 'hover:bg-[#f1f5f9]'
              }`}
            >
              <FileText className="h-4 w-4" />
              Relatórios e Dossiês
            </button>
          </nav>
        </div>

        <div className="mt-auto bg-[#f1f5f9] border border-dashed border-[#64748b] p-5 rounded-xl text-center">
          <p className="text-[0.75rem] text-[#64748b]">Total de Lançamentos</p>
          <p className="text-xl font-bold text-[#1e3a8a]">{logs.length}</p>
        </div>
      </aside>

      <main className="p-6 md:p-8 overflow-y-auto w-full h-full bg-[#f8fafc] print:p-0 print:m-0">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'lancamentos' && <EntryForm />}
        {currentView === 'servidores' && <EmployeeForm />}
        {currentView === 'dossie' && <Dossier />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TimeBankProvider>
      <AppContent />
    </TimeBankProvider>
  );
}
