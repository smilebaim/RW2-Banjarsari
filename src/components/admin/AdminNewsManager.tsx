
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking, useUser, useDoc } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Newspaper, Plus, Search, Edit3, Trash2, FileText, Loader2, Sparkles, Calendar, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
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
  const [imageUrl, setImageUrl] = useState('');

  // Strict check for adminRole before fetching
  const adminRoleRef = useMemoFirebase(() => user ? doc(db, 'admin_roles', user.uid) : null, [db, user]);
  const { data: adminRole } = useDoc(adminRoleRef);

  const newsQuery = useMemoFirebase(() => {
    if (!user || !adminRole) return null;
    return query(collection(db, 'announcements_management'), orderBy('createdAt', 'desc'));
  }, [db, user, adminRole]);

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
      imageUrl,
      authorAdminUserId: user.uid,
      updatedAt: new Date().toISOString(),
    };

    const targetId = editingId || doc(collection(db, 'announcements_management')).id;
    const fullData = { 
      ...newsData, 
      id: targetId, 
      createdAt: editingId ? (news?.find(n => n.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      publicationDate: editingId ? (news?.find(n => n.id === editingId)?.publicationDate || new Date().toISOString()) : new Date().toISOString()
    };

    setDocumentNonBlocking(doc(db, 'announcements_management', targetId), fullData, { merge: true });
    
    if (status === 'Published') {
      setDocumentNonBlocking(doc(db, 'announcements_public', targetId), fullData, { merge: true });
    } else if (editingId) {
      deleteDocumentNonBlocking(doc(db, 'announcements_public', targetId));
    }

    setIsDialogOpen(false);
    resetForm();
    toast({ title: "Berhasil disimpan", description: "Warta telah diperbarui secara sistemik." });
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'announcements_management', id));
    deleteDocumentNonBlocking(doc(db, 'announcements_public', id));
    toast({ title: "Berita dihapus", description: "Data telah dihapus permanen dari sistem." });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setSummary('');
    setCategory('News');
    setStatus('Published');
    setImageUrl('');
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setSummary(item.summary);
    setCategory(item.category);
    setStatus(item.status);
    setImageUrl(item.imageUrl || '');
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Manajemen Warta</h1>
          <p className="text-muted-foreground font-medium italic border-l-4 border-accent pl-6 text-sm">Publikasikan informasi dan pengumuman resmi untuk seluruh warga RW 02.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-16 px-10 rounded-2xl bg-primary text-white shadow-2xl shadow-primary/20 gap-4 font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105">
              <Plus className="w-6 h-6" /> Tulis Warta Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-[3rem] p-10 border-none shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Edit Warta' : 'Tulis Warta Baru'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Judul Utama Warta</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-secondary/50 border-none h-14 rounded-xl font-bold px-4" placeholder="Masukkan judul..." />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">URL Gambar Pendukung (HTTPS)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                  <Input 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)} 
                    className="pl-12 bg-secondary/50 border-none h-14 rounded-xl font-bold" 
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>
                {imageUrl && (
                  <div className="mt-4 relative h-40 w-full rounded-2xl overflow-hidden border-4 border-secondary shadow-inner bg-secondary/20">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <ImageIcon className="text-white w-8 h-8" />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Kategori</label>
                  <input value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-secondary/50 border-none h-14 rounded-xl font-bold px-4" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Status Publikasi</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-14 bg-secondary/50 rounded-xl px-4 border-none font-bold text-sm shadow-inner">
                    <option value="Published">PUBLIKASIKAN</option>
                    <option value="Draft">SIMPAN DRAFT</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Isi Lengkap Warta</label>
                  <Button variant="ghost" size="sm" onClick={handleSummarize} disabled={isSummarizing || !content} className="text-primary gap-2 h-8 font-black uppercase text-[9px] tracking-widest">
                    {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Gunakan AI Summarizer
                  </Button>
                </div>
                <Textarea value={content} onChange={e => setContent(e.target.value)} className="bg-secondary/50 border-none min-h-[180px] rounded-2xl font-medium p-5" placeholder="Tulis konten lengkap..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Ringkasan AI (Otomatis)</label>
                <Textarea value={summary} onChange={e => setSummary(e.target.value)} className="bg-accent/5 border-dashed border-2 border-accent/20 italic text-sm rounded-2xl p-5" placeholder="Hasil ringkasan AI akan muncul di sini..." />
              </div>
            </div>
            <DialogFooter className="gap-4">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest h-14 px-8">Batal</Button>
              <Button onClick={handleSave} className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary text-white h-14 px-10 shadow-xl shadow-primary/20">Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <div className="p-10 border-b border-secondary/50 flex flex-col sm:flex-row gap-6 justify-between items-center bg-white">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Cari judul warta..." 
              className="pl-16 bg-secondary/30 border-none h-14 rounded-2xl font-medium shadow-inner" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-secondary/30">
            {isLoading ? (
              <div className="p-32 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-20" /></div>
            ) : filteredNews?.length === 0 ? (
              <div className="p-32 text-center text-muted-foreground font-black uppercase tracking-widest text-xs italic">Belum ada warta yang tersedia.</div>
            ) : (
              filteredNews?.map((item) => (
                <div key={item.id} className="p-10 flex flex-col md:flex-row md:items-center justify-between hover:bg-secondary/10 transition-all duration-500 group">
                  <div className="flex items-center gap-8 mb-6 md:mb-0">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner group-hover:rotate-6 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-10 h-10" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-xl mb-2 tracking-tighter uppercase text-gray-900 leading-none">{item.title}</h4>
                      <div className="flex items-center gap-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(item.publicationDate).toLocaleDateString('id-ID')}</span>
                        <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full" />
                        <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> {item.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 self-end md:self-center">
                    <Badge className={item.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200 font-black text-[9px] px-3' : 'bg-gray-100 text-gray-500 font-black text-[9px] px-3'}>
                      {item.status.toUpperCase()}
                    </Badge>
                    <div className="flex gap-3">
                      <Button onClick={() => openEdit(item)} size="icon" variant="ghost" className="rounded-2xl w-12 h-12 hover:bg-primary/10 hover:text-primary transition-all shadow-sm"><Edit3 className="w-6 h-6" /></Button>
                      <Button onClick={() => handleDelete(item.id)} size="icon" variant="ghost" className="rounded-2xl w-12 h-12 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><Trash2 className="w-6 h-6" /></Button>
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
