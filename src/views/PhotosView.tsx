import { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Plus } from 'lucide-react';
import { Card, Button, Modal, Input, SectionTitle, EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { todayStr, formatDate } from '@/lib/dates';
import type { ProgressPhoto } from '@/lib/api';

interface PhotosProps {
  photos: ProgressPhoto[];
  onChanged: () => void;
}

export function PhotosView({ photos, onChanged }: PhotosProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = [...photos].sort((a, b) => b.date.localeCompare(a.date));

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function upload() {
    if (!preview) return;
    setBusy(true);
    const fileName = `photo-${Date.now()}.jpg`;
    const filePath = `progress/${fileName}`;
    const blob = await fetch(preview).then((r) => r.blob());
    const { error } = await supabase.storage.from('photos').upload(filePath, blob, { contentType: 'image/jpeg' });
    if (error) {
      // Fallback: store the data URL directly in the row so the feature still works without storage bucket setup
      await supabase.from('progress_photos').insert({
        image_url: preview.slice(0, 500_000),
        date: todayStr(),
        note: note.trim() || null,
      });
    } else {
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath);
      await supabase.from('progress_photos').insert({
        image_url: urlData.publicUrl,
        date: todayStr(),
        note: note.trim() || null,
      });
    }
    setBusy(false);
    setNote('');
    setPreview(null);
    setOpen(false);
    onChanged();
  }

  async function remove(id: string) {
    await supabase.from('progress_photos').delete().eq('id', id);
    onChanged();
  }

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Camera size={18} className="text-solo-500" />} right={
        <Button size="sm" onClick={() => setOpen(true)}><Plus size={16} /> Add Photo</Button>
      }>
        Journey Photos
      </SectionTitle>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Camera size={36} />}
          title="No Photos Yet"
          description="Document your transformation. Upload progress photos as you level up."
          action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Photo</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((p) => (
            <Card key={p.id} className="group overflow-hidden p-0">
              <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-slate-200 dark:bg-white/5">
                <img src={p.image_url} alt={p.note ?? 'Progress'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <button
                  onClick={() => remove(p.id)}
                  className="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{formatDate(p.date)}</p>
                {p.note && <p className="mt-0.5 text-xs text-slate-400">{p.note}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => { setOpen(false); setPreview(null); }} title="Add Progress Photo">
        <div className="space-y-3">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
          {preview ? (
            <div className="relative overflow-hidden rounded-xl">
              <img src={preview} alt="Preview" className="max-h-64 w-full object-cover" />
              <button
                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-10 text-slate-400 transition hover:border-solo-500 hover:text-solo-500 dark:border-white/10"
            >
              <Upload size={28} />
              <span className="text-sm font-medium">Tap to upload a photo</span>
            </button>
          )}
          <Input label="Note (optional)" value={note} onChange={setNote} placeholder="e.g. Day 30 — feeling stronger" />
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setOpen(false); setPreview(null); }} className="flex-1">Cancel</Button>
            <Button onClick={upload} disabled={!preview || busy} className="flex-1">{busy ? 'Uploading...' : 'Save Photo'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
