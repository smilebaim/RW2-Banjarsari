
"use client";

import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, MessageSquare, UserCheck, ShieldCheck, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FeedbackAnalysisView() {
  const db = useFirestore();

  // Fetch Officials for status monitoring
  const membersQuery = useMemoFirebase(() => query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc')), [db]);
  const { data: officials, isLoading } = useCollection(membersQuery);

  // Fetch WhatsApp Config
  const configRef = useMemoFirebase(() => doc(db, 'system_settings', 'whatsapp_config'), [db]);
  const { data: config } = useDoc(configRef);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary flex items-center gap-2 uppercase tracking-tighter">
            <Zap className="w-6 h-6" />
            Kontrol Aspirasi Digital
          </h2>
          <p className="text-muted-foreground font-medium text-sm">Monitoring alur aspirasi warga langsung ke WhatsApp pengurus.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Pengurus */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <div className="p-8 border-b border-secondary/50 bg-secondary/10">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Kesiapan Respon Pengurus
            </h3>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-secondary/50 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-20 text-center"><Zap className="w-10 h-10 animate-pulse mx-auto text-primary/20" /></div>
              ) : officials?.map((official) => (
                <div key={official.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-none mb-1">{official.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{official.role}</p>
                    </div>
                  </div>
                  <Badge className={official.contactNumber ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {official.contactNumber ? "WA AKTIF" : "NO WA KOSONG"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Konfigurasi Pesan Aktif */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-black uppercase tracking-tighter text-xl">Templat Pesan Aktif</h3>
              </div>
              
              <div className="bg-black/20 p-6 rounded-2xl italic text-sm border border-white/10 leading-relaxed">
                "{config?.messageTemplate || 'Belum diatur...'}"
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                <Settings className="w-3 h-3" /> Diperbarui: {config?.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : '-'}
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-zinc-900 text-white p-8">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-4 text-accent">Cara Kerja Aspirasi</h3>
            <div className="space-y-4 text-xs font-medium opacity-80 leading-relaxed">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-accent text-black flex items-center justify-center font-black shrink-0">1</div>
                <p>Warga memilih pengurus yang sedang bertugas atau relevan dengan masalah mereka.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-accent text-black flex items-center justify-center font-black shrink-0">2</div>
                <p>Sistem merangkai pesan otomatis berdasarkan templat yang Anda buat di tab Pengaturan.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-accent text-black flex items-center justify-center font-black shrink-0">3</div>
                <p>Ponsel warga akan membuka WhatsApp dan mengirim pesan tersebut langsung ke pengurus terkait.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
