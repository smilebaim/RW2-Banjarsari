
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Send, Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  rt: z.string().min(1, 'Pilih RT asal'),
  type: z.string().min(1, 'Pilih jenis laporan'),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
});

export function FeedbackForm() {
  const db = useFirestore();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      rt: '',
      type: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const feedbackId = doc(collection(db, 'resident_feedback')).id;
      const feedbackData = {
        ...values,
        id: feedbackId,
        submissionDate: new Date().toISOString(),
        status: 'New',
        subject: `${values.type} - Dari RT ${values.rt}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      addDocumentNonBlocking(collection(db, 'resident_feedback'), feedbackData);
      setSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border-none shadow-xl bg-white animate-in zoom-in-95">
        <CardContent className="py-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-4">Terima Kasih!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Laporan/Aspirasi Anda telah berhasil kami terima. Pengurus RW akan segera menindaklanjuti informasi tersebut.
          </p>
          <Button onClick={() => {
            setSubmitted(false);
            form.reset();
          }} variant="outline" className="rounded-full">
            Kirim Laporan Lain
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <div className="h-2 bg-primary"></div>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Budi Sudarsono" {...field} className="bg-secondary/20 border-none h-11" />
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
                    <FormLabel>Nomor WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="0812xxxx" {...field} className="bg-secondary/20 border-none h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="rt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asal RT</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary/20 border-none h-11">
                          <SelectValue placeholder="Pilih RT" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormLabel>Jenis Laporan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary/20 border-none h-11">
                          <SelectValue placeholder="Pilih Jenis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Aspiration">Aspirasi / Saran</SelectItem>
                        <SelectItem value="Issue Report">Pengaduan Masalah</SelectItem>
                        <SelectItem value="Praise">Apresiasi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detail Pesan / Laporan</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Sampaikan aspirasi atau laporan Anda secara mendetail..." 
                      className="min-h-[150px] bg-secondary/20 border-none resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Sebutkan lokasi kejadian jika Anda melaporkan masalah lingkungan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Kirim Sekarang
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
