
"use client";

import { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Save, Loader2, Phone, Info } from 'lucide-react';

export function SystemSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const configRef = useMemoFirebase(() => doc(db, 'system_settings', 'whatsapp_config'), [db]);
  const { data: config, isLoading } = useDoc(configRef);

  useEffect(() => {
    if (config) {
      setPhoneNumber(config.phoneNumber || '');
      setMessageTemplate(config.messageTemplate || '');
    }
  }, [config]);

  const handleSave = () => {
    setIsSaving(true);
    setDocumentNonBlocking(configRef, {
      phoneNumber,
      messageTemplate,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Pengaturan Disimpan",
        description: "Konfigurasi WhatsApp telah diperbarui.",
      });
    }, 500);
  };

  if (isLoading) {
    return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Pengaturan Sistem</h1>
        <p className="text-muted-foreground font-medium">Konfigurasi integrasi layanan dan alur kerja aplikasi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-10 pb-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">Integrasi WhatsApp</CardTitle>
                  <CardDescription className="font-medium">Atur ke mana aspirasi warga akan diteruskan.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Nomor WhatsApp Tujuan
                </label>
                <Input 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Contoh: 628123456789"
                  className="bg-secondary/40 border-none h-14 rounded-2xl font-bold px-6"
                />
                <p className="text-[10px] text-muted-foreground italic font-medium">Gunakan format internasional tanpa tanda '+' atau spasi (misal: 62812...).</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Templat Pesan
                </label>
                <Textarea 
                  value={messageTemplate} 
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Tulis format pesan di sini..."
                  className="min-h-[200px] bg-secondary/40 border-none rounded-[2rem] p-6 font-medium leading-relaxed"
                />
                <div className="p-5 bg-primary/5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                    <Info className="w-3.5 h-3.5" /> Placeholder Tersedia:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['{{name}}', '{{rt}}', '{{type}}', '{{message}}'].map(p => (
                      <code key={p} className="bg-white px-3 py-1 rounded-lg text-[10px] font-black text-primary border border-primary/10">{p}</code>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 gap-3"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-accent text-accent-foreground p-8">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Informasi Alur</h3>
            <div className="space-y-6 text-sm font-medium leading-relaxed opacity-80">
              <p>1. Warga mengisi form aspirasi digital.</p>
              <p>2. Data disimpan secara otomatis ke database untuk dianalisis oleh AI Dashboard.</p>
              <p>3. Aplikasi akan membuka WhatsApp dan memformat pesan sesuai templat yang Anda tentukan di sini.</p>
              <p>4. Pengurus menerima laporan secara real-time di ponsel.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
