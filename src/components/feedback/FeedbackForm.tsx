
"use client";

import { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase, useCollection, useUser, useAuth, initiateAnonymousSignIn } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2, UserCheck, MessageCircle } from 'lucide-react';

export function FeedbackForm() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [selectedOfficialId, setSelectedOfficialId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch Officials (Management Members)
  const membersQuery = useMemoFirebase(() => query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc')), [db]);
  const { data: officials, isLoading: isLoadingOfficials } = useCollection(membersQuery);

  // Fetch WhatsApp Config for Template (if needed for greeting)
  const configRef = useMemoFirebase(() => doc(db, 'system_settings', 'whatsapp_config'), [db]);
  const { data: waConfig } = useDoc(configRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleConnect = () => {
    if (!selectedOfficialId || !officials) return;
    setLoading(true);

    const selectedOfficial = officials.find(o => o.id === selectedOfficialId);
    if (selectedOfficial && selectedOfficial.contactNumber) {
      const targetPhone = selectedOfficial.contactNumber.replace(/[^0-9]/g, '');
      
      // Default greeting
      let text = waConfig?.messageTemplate || "Halo {{target}}, saya ingin menyampaikan aspirasi...";
      text = text.replace('{{target}}', selectedOfficial.name);
      // Remove other placeholders since they are no longer collected in the form
      text = text.replace('{{name}}', '(Warga)');
      text = text.replace('{{rt}}', '??');
      text = text.replace('{{type}}', 'Aspirasi');
      text = text.replace('{{message}}', '...');

      const encodedText = encodeURIComponent(text);
      const waUrl = `https://wa.me/${targetPhone}?text=${encodedText}`;
      
      window.open(waUrl, '_blank');
    }
    setLoading(false);
  };

  return (
    <Card className="border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] bg-white rounded-[3.5rem] overflow-hidden relative">
      <div className="h-3 bg-primary"></div>
      <CardContent className="p-10 md:p-14">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">Hubungi Pengurus</h2>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Pilih Pejabat / Pengurus Tujuan
            </label>
            <Select onValueChange={setSelectedOfficialId} value={selectedOfficialId}>
              <SelectTrigger className="bg-secondary/40 border-none h-16 rounded-2xl focus:ring-primary shadow-inner font-bold">
                <SelectValue placeholder={isLoadingOfficials ? "Memuat pengurus..." : "— Pilih Nama Pejabat —"} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                {officials?.map((official) => (
                  <SelectItem key={official.id} value={official.id} className="py-3 font-medium">
                    {official.name} — <span className="text-primary font-black uppercase text-[9px]">{official.role}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic px-2">
              Anda akan langsung diarahkan ke chat WhatsApp pengurus yang dipilih untuk menyampaikan aspirasi secara pribadi.
            </p>
          </div>

          <Button 
            onClick={handleConnect}
            disabled={loading || !selectedOfficialId || isLoadingOfficials}
            className="w-full h-18 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all py-6"
          >
            {loading ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="mr-3 h-4 w-4" />
                Lanjutkan ke WhatsApp
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
