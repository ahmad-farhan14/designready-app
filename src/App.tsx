import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { ChecklistArea } from './components/ChecklistArea';
import { LoginPage } from './components/LoginPage';
import { PanduanUkuran } from './components/PanduanUkuran';
import { PricingModal } from './components/PricingModal';
import { Sidebar } from './components/Sidebar';
import { TeamSettingsPage } from './components/TeamSettingsPage';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // State Enterprise Workspace
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [currentOrgName, setCurrentOrgName] = useState<string>('Personal Workspace');
  const [showTeamSettings, setShowTeamSettings] = useState(false);

  // State Task & Modal
  const [activeTaskId, setActiveTaskId] = useState<string | null>('task-1');
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Dummy tasks state
  const [tasks, setTasks] = useState([
    { id: 'task-1', name: 'ui ux umkm', categoryLabel: 'UI/UX HANDOFF', progressPercent: 60, isActive: true },
    { id: 'task-2', name: 'logo umkm', categoryLabel: 'BRANDING & LOGO', progressPercent: 10, isActive: false },
    { id: 'task-3', name: 'aset umkm', categoryLabel: 'ASET MEDIA SOSIAL', progressPercent: 80, isActive: false },
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSelectWorkspace = (orgId: string | null, orgName: string) => {
    setCurrentOrgId(orgId);
    setCurrentOrgName(orgName);
    if (orgId) {
      setShowTeamSettings(true);
    } else {
      setShowTeamSettings(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-xs font-semibold">Memuat...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500 selection:text-white">
      {/* Header Utama */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-white tracking-tight">DesignReady</h1>
            <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold">
              {currentOrgId ? 'ENTERPRISE' : 'PRO STUDIO'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPricingOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition"
            >
              Upgrade Pro
            </button>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sidebar dengan Workspace Switcher */}
        <div className="lg:col-span-3">
          <Sidebar
            tasks={tasks}
            activeTaskId={activeTaskId}
            currentOrgId={currentOrgId}
            onSelectWorkspace={handleSelectWorkspace}
            onSelectTask={(id) => {
              setActiveTaskId(id);
              setShowTeamSettings(false);
            }}
            onCreateTask={() => alert('Buat task baru')}
            onRequestDeleteTask={(id) => setTasks(tasks.filter((t) => t.id !== id))}
          />
        </div>

        {/* Center Column: Halaman Tim atau Area Checklist Task */}
        <div className="lg:col-span-6">
          {showTeamSettings && currentOrgId ? (
            <TeamSettingsPage
              organizationId={currentOrgId}
              organizationName={currentOrgName}
            />
          ) : (
            <ChecklistArea
              taskId={activeTaskId || 'task-1'}
              taskName="ui ux umkm"
              categoryLabel="UI/UX HANDOFF"
              items={[
                'Layer & Komponen Diberi Nama Rapi',
                'Spacing & Grid Konsisten (8pt grid)',
                'Typografi Menggunakan Style Token',
                'Color Variables / Styles Terorganisir',
                'Semua Aset Diekspor Dalam Resolusi Tepat',
              ]}
              checkedState={{ 0: true, 1: true, 2: true }}
              onToggleItem={() => {}}
              onReset={() => {}}
            />
          )}
        </div>

        {/* Right Column: Panduan Ukuran & Ekspor */}
        <div className="lg:col-span-3">
          <PanduanUkuran />
        </div>
      </main>

      {/* Modal Pricing */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectEnterprise={() => {
          setIsPricingOpen(false);
        }}
      />
    </div>
  );
}