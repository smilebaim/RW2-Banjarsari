
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Newspaper, Plus, Search, Edit3, Trash2, FileText, Loader2, Sparkles } from 'lucide-react';
import { summarizeNews } from '@/ai/flows/summarize-news-flow';
import { useToast } from '@/hooks/use-toast';

export function AdminNewsManager() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('News');
  const [status, setStatus] = useState('Published');

  const newsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'announcements_management'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: news, isLoading } = useCollection(newsQuery);

  const filteredNews = news?.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSummarize = async () => {
    if (!content) return;
    setIsSummarizing(true);
    try {
      const result = await summarizeNews({ newsArticle: content });
      setSummary(result.summary);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal meringkas", description: error.message });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSave = () => {
    if (!user) return;
    
    const newsData = {
      title,
      content,
      summary,
      category,
      status,
      authorAdminUserId: user.uid,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updateDocumentNonBlocking(doc(db, 'announcements_management', editingId), newsData);
      if (status === 'Published') {
        updateDocumentNonBlocking(doc(db, 'announcements_public', editingId), newsData);
      }
    } else {
      const newId = doc(collection(db, 'announcements_management')).id;
      const fullData = { 
        ...newsData, 
        id: newId, 
        createdAt: new Date().toISOString(),
        publicationDate: new Date().toISOString()
      };
      updateDocumentNonBlocking(doc(db, 'announcements_management', newId), fullData);
      if (status === 'Published') {
        updateDocumentNonBlocking(doc(db, 'announcements_public', newId), fullData);
      }
    }

    setIsDialogOpen(false);
    resetForm();
    toast({ title: "Berhasil disimpan", description: "Berita telah diperbarui di database." });
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'announcements_management', id));
    deleteDocumentNonBlocking(doc(db, 'announcements_public', id));
    toast({ title: "Berita dihapus", description: "Data telah dihapus dari sistem." });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setSummary('');
    setCategory('News');
    setStatus('Published');
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setSummary(item.summary);
    setCategory(item.category);
    setStatus(item.status);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Kelola Berita</h1>
          <p className="text-muted-foreground font-medium">Publikasikan informasi resmi untuk seluruh warga.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-3 font-black uppercase tracking-widest text-xs">
              <Plus className="w-5 h-5" /> Tulis Berita Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Edit Berita' : 'Tulis Berita Baru'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Judul Berita</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary/50 border-none h-12" placeholder="Masukkan judul..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kategori</label>
                  <Input value={category} onChange={e => setCategory(e.target.value)} className="bg-secondary/50 border-none h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-12 bg-secondary/50 rounded-xl px-4 border-none font-bold">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Isi Berita</label>
                  <Button variant="ghost" size="sm" onClick={handleSummarize} disabled={isSummarizing || !content} className="text-primary gap-2 h-8 font-bold">
                    {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Ringkas dengan AI
                  </Button>
                </div>
                <Textarea value={content} onChange={e => setContent(e.target.value)} className="bg-secondary/50 border-none min-h-[150px]" placeholder="Tulis konten lengkap..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ringkasan AI (Opsional)</label>
                <Textarea value={summary} onChange={e => setSummary(e.target.value)} className="bg-accent/5 border-dashed border-2 border-accent/20 italic text-sm" placeholder="Hasil ringkasan AI akan muncul di sini..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Batal</Button>
              <Button onClick={handleSave} className="rounded-xl font-bold bg-primary px-8">Simpan Berita</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-secondary/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Cari judul berita..." 
              className="pl-12 bg-secondary/30 border-none h-12 rounded-xl" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-secondary/50">
            {isLoading ? (
              <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
            ) : filteredNews?.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground font-bold">Belum ada berita yang ditemukan.</div>
            ) : (
              filteredNews?.map((item) => (
                <div key={item.id} className="p-8 flex items-center justify-between hover:bg-secondary/10 transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <span>{new Date(item.publicationDate).toLocaleDateString('id-ID')}</span>
                        <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                        <span>{item.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={item.status === 'Published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}>
                      {item.status.toUpperCase()}
                    </Badge>
                    <div className="flex gap-2">
                      <Button onClick={() => openEdit(item)} size="icon" variant="ghost" className="rounded-xl hover:bg-primary/10 hover:text-primary"><Edit3 className="w-5 h-5" /></Button>
                      <Button onClick={() => handleDelete(item.id)} size="icon" variant="ghost" className="rounded-xl hover:bg-red-50 hover:text-red-500"><Trash2 className="w-5 h-5" /></Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
