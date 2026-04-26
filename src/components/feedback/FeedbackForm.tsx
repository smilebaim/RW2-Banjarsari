
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useDoc, useMemoFirebase, useCollection, addDocumentNonBlocking, useUser, useAuth, initiateAnonymousSignIn } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Send, Loader2, Info, MessageSquare, UserCheck } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  rt: z.string().min(1, 'Pilih RT asal'),
  type: z.string().min(1, 'Pilih jenis laporan'),
  officialId: z.string().min(1, 'Pilih pejabat tujuan'),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
});

export function FeedbackForm() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch Officials (Management Members)
  const membersQuery = useMemoFirebase(() => query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc')), [db]);
  const { data: officials, isLoading: isLoadingOfficials } = useCollection(membersQuery);

  // Fetch WhatsApp Config for Template
  const configRef = useMemoFirebase(() => doc(db, 'system_settings', 'whatsapp_config'), [db]);
  const { data: waConfig } = useDoc(configRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      rt: '',
      type: '',
      officialId: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setLoading(true);
    try {
      const selectedOfficial = officials?.find(o => o.id === values.officialId);
      const targetPhone = selectedOfficial?.contactNumber || waConfig?.phoneNumber;

      const feedbackId = doc(collection(db, 'resident_feedback')).id;
      const feedbackData = {
        ...values,
        id: feedbackId,
        targetOfficialName: selectedOfficial?.name || 'Umum',
        submissionDate: new Date().toISOString(),
        status: 'New',
        subject: `${values.type} - Dari RT ${values.rt} (Ditujukan ke: ${selectedOfficial?.name || 'Umum'})`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      addDocumentNonBlocking(collection(db, 'resident_feedback'), feedbackData);
      
      // WhatsApp Integration
      if (targetPhone && waConfig?.messageTemplate) {
        let text = waConfig.messageTemplate;
        text = text.replace('{{name}}', values.name);
        text = text.replace('{{rt}}', values.rt);
        text = text.replace('{{type}}', values.type);
        text = text.replace('{{message}}', values.message);
        // Custom placeholder for official name if needed
        text = text.replace('{{target}}', selectedOfficial?.name || 'Pengurus');
        
        const encodedText = encodeURIComponent(text);
        const waUrl = `https://wa.me/${targetPhone.replace(/[^0-9]/g, '')}?text=${encodedText}`;
        
        // Open WA in new tab
        window.open(waUrl, '_blank');
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border-none shadow-2xl bg-white rounded-[3.5rem] overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="h-3 bg-primary"></div>
        <CardContent className="py-24 px-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-10 shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-4xl font-black text-primary mb-6 uppercase tracking-tighter">Berhasil Terkirim!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-12 text-lg font-medium leading-relaxed">
            Aspirasi Anda telah tersimpan di sistem dan diteruskan ke WhatsApp pengurus yang Anda tuju.
          </p>
          <Button onClick={() => {
            setSubmitted(false);
            form.reset();
          }} className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
            Kirim Aspirasi Lain
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] bg-white rounded-[3.5rem] overflow-hidden relative">
      <div className="h-3 bg-primary"></div>
      <CardContent className="p-10 md:p-14">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">Kirim Aspirasi Digital</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Budi Sudarsono" {...field} className="bg-secondary/40 border-none h-14 rounded-2xl focus-visible:ring-primary shadow-inner font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nomor WhatsApp Anda</FormLabel>
                    <FormControl>
                      <Input placeholder="0812xxxx" {...field} className="bg-secondary/40 border-none h-14 rounded-2xl focus-visible:ring-primary shadow-inner font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="rt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asal RT</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary/40 border-none h-14 rounded-2xl focus:ring-primary shadow-inner font-bold">
                          <SelectValue placeholder="Pilih RT" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="01">RT 01</SelectItem>
                        <SelectItem value="02">RT 02</SelectItem>
                        <SelectItem value="03">RT 03</SelectItem>
                        <SelectItem value="04">RT 04</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jenis Laporan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary/40 border-none h-14 rounded-2xl focus:ring-primary shadow-inner font-bold">
                          <SelectValue placeholder="Pilih Jenis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="Aspiration">Aspirasi / Saran</SelectItem>
                        <SelectItem value="Issue Report">Pengaduan Masalah</SelectItem>
                        <SelectItem value="Praise">Apresiasi Lingkungan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="officialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <UserCheck className="w-3 h-3" /> Pejabat / Pengurus Tujuan
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary/40 border-none h-14 rounded-2xl focus:ring-primary shadow-inner font-bold">
                        <SelectValue placeholder={isLoadingOfficials ? "Memuat daftar pengurus..." : "Pilih Pengurus Tujuan"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      {officials?.map((official) => (
                        <SelectItem key={official.id} value={official.id}>
                          {official.name} - {official.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[9px] font-bold">
                    Pesan Anda akan langsung dikirim ke WhatsApp pengurus yang dipilih.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detail Pesan / Aspirasi</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Sampaikan aspirasi atau laporan Anda secara mendetail..." 
                      className="min-h-[150px] bg-secondary/40 border-none rounded-[2rem] resize-none focus-visible:ring-primary shadow-inner p-6 font-medium leading-relaxed" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-16 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all" disabled={loading || !user || isLoadingOfficials}>
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-3 h-4 w-4" />
                  Kirim & Lanjutkan ke WhatsApp
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
