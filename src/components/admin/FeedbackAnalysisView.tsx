
"use client";

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useDoc, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, MessageSquare, UserCheck, ShieldCheck, ArrowRight, Save, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function FeedbackAnalysisView() {
  const db = useFirestore();
  const { toast } = useToast();
  const [messageTemplate, setMessageTemplate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Officials for status monitoring
  const membersQuery = useMemoFirebase(() => query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc')), [db]);
  const { data: officials, isLoading } = useCollection(membersQuery);

  // Fetch WhatsApp Config
  const configRef = useMemoFirebase(() => doc(db, 'system_settings', 'whatsapp_config'), [db]);
  const { data: config, isLoading: isConfigLoading } = useDoc(configRef);

  useEffect(() => {
    if (config) {
      setMessageTemplate(config.messageTemplate || '');
    }
  }, [config]);

  const handleSaveTemplate = () => {
    setIsSaving(true);
    setDocumentNonBlocking(configRef, {
      messageTemplate,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Templat Disimpan",
        description: "Format pesan WhatsApp otomatis telah diperbarui.",
      });
    }, 500);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary flex items-center gap-2 uppercase tracking-tighter">
            <Zap className="w-6 h-6" />
            Kontrol Aspirasi Digital
          </h2>
          <p className="text-muted-foreground font-medium text-sm">Kelola alur komunikasi langsung warga ke pengurus melalui WhatsApp.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Templat Pesan */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <div className="p-8 border-b border-secondary/50 bg-secondary/10 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Templat Pesan Warga
            </h3>
            <Button onClick={handleSaveTemplate} disabled={isSaving || isConfigLoading} size="sm" className="h-9 rounded-xl bg-primary gap-2 font-black uppercase tracking-widest text-[9px]">
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Simpan Format
            </Button>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Isi Pesan Otomatis</label>
              <Textarea 
                value={messageTemplate} 
                onChange={(e) => setMessageTemplate(e.target.value)}
                placeholder="Contoh: Halo {{target}}, saya ingin menyampaikan..."
                className="min-h-[160px] bg-secondary/30 border-none rounded-2xl p-6 font-medium leading-relaxed shadow-inner"
              />
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest mb-2">
                  <Info className="w-3 h-3" /> Placeholder Dinamis:
                </div>
                <div className="flex flex-wrap gap-2">
                  <code className="bg-white px-2 py-0.5 rounded text-[8px] font-black text-primary border border-primary/20">{'{{target}}'}</code>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Nama Pejabat</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Pengurus & Nomor WA */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <div className="p-8 border-b border-secondary/50 bg-secondary/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Daftar WhatsApp Pengurus
            </h3>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-secondary/50 max-h-[440px] overflow-y-auto">
              {isLoading ? (
                <div className="p-20 text-center"><Zap className="w-10 h-10 animate-pulse mx-auto text-primary/20" /></div>
              ) : officials?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-xs font-bold italic">Belum ada pengurus terdaftar.</div>
              ) : officials?.map((official) => (
                <div key={official.id} className="p-6 flex items-center justify-between hover:bg-secondary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-none mb-1">{official.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{official.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {official.contactNumber ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[8px] font-black uppercase tracking-widest">
                        {official.contactNumber}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[8px] font-black uppercase tracking-widest">
                        NO WA KOSONG
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alur Kerjra */}
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-zinc-900 text-white p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/30 transition-all duration-1000"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center text-black shrink-0 shadow-2xl">
            <Zap className="w-10 h-10" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-black uppercase tracking-tighter text-accent">Alur Kerja Aspirasi Digital</h3>
            <p className="text-xs font-medium opacity-80 leading-relaxed max-w-2xl">
              Sistem ini tidak menyimpan pesan aspirasi di database aplikasi. Warga memilih pengurus tujuan, dan aplikasi secara otomatis merangkai pesan sesuai templat di atas, lalu membuka aplikasi WhatsApp warga untuk mengirimkannya langsung ke nomor pengurus.
            </p>
          </div>
          <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest text-[9px] h-12 px-6">
            Pelajari Detail <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
