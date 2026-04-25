"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Plus, Search, Edit3, Trash2, Globe, FileText } from 'lucide-react';

const mockNews = [
  { id: 1, title: 'Vaksinasi Massal RW 02', status: 'Published', date: '2024-06-15', author: 'Sekretariat' },
  { id: 2, title: 'Rencana Kerja Bakti Juli', status: 'Draft', date: '2024-06-10', author: 'Bagian Lingkungan' },
  { id: 3, title: 'Laporan Keuangan Q1', status: 'Published', date: '2024-05-20', author: 'Bendahara' },
];

export function AdminNewsManager() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Kelola Berita</h1>
          <p className="text-muted-foreground font-medium">Publikasikan informasi resmi untuk seluruh warga.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-3 font-black uppercase tracking-widest text-xs">
          <Plus className="w-5 h-5" /> Tulis Berita Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-secondary/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Cari judul berita..." className="pl-12 bg-secondary/30 border-none h-12 rounded-xl" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl font-bold">Terbaru</Button>
                <Button variant="outline" className="rounded-xl font-bold">Kategori</Button>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-secondary/50">
                {mockNews.map((news) => (
                  <div key={news.id} className="p-8 flex items-center justify-between hover:bg-secondary/20 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{news.title}</h4>
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <span>{news.date}</span>
                          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                          <span>{news.author}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={news.status === 'Published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}>
                        {news.status.toUpperCase()}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/10 hover:text-primary"><Edit3 className="w-5 h-5" /></Button>
                        <Button size="icon" variant="ghost" className="rounded-xl hover:bg-red-50 hover:text-red-500"><Trash2 className="w-5 h-5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white">
            <h3 className="font-black text-primary uppercase tracking-tighter mb-6">Status Publikasi</h3>
            <div className="space-y-6">
              {[
                { label: 'Published', count: 12, color: 'bg-green-500' },
                { label: 'Drafts', count: 3, color: 'bg-gray-400' },
                { label: 'Archived', count: 5, color: 'bg-blue-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="font-bold text-sm text-muted-foreground uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className="font-black text-primary text-xl">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-accent/10 border-2 border-accent/20">
            <Globe className="w-10 h-10 text-accent-foreground mb-4" />
            <h3 className="font-black text-accent-foreground uppercase tracking-tighter mb-2">Cek Publikasi</h3>
            <p className="text-sm text-accent-foreground/70 font-medium leading-relaxed mb-6">Pastikan semua berita yang telah dipublikasikan dapat diakses oleh warga melalui aplikasi mobile dan portal publik.</p>
            <Button variant="outline" className="w-full border-accent text-accent-foreground font-black uppercase tracking-widest text-[10px] rounded-xl">Lihat Portal Publik</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
