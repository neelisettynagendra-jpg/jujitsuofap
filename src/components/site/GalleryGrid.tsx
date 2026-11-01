import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Photo = { id: string; image_url: string; caption: string };

export function GalleryGrid({ images, reveal = false }: { images: Photo[]; reveal?: boolean }) {
  const grid = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<Photo | null>(null);

  useEffect(() => {
    const element = grid.current;
    if (!reveal || !element || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const items = Array.from(element.children);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.remove("opacity-0");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.1 });
    for (const item of items) {
      if (item.getBoundingClientRect().top >= window.innerHeight) item.classList.add("opacity-0");
      observer.observe(item);
    }
    return () => {
      observer.disconnect();
      items.forEach(item => item.classList.remove("opacity-0"));
    };
  }, [images, reveal]);

  return <>
    <div ref={grid} className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {images.map(image => <Button key={image.id} variant="ghost" onClick={() => setPreview(image)} className="group block h-auto overflow-hidden rounded-md border bg-card p-0 text-left shadow-card transition-opacity duration-700 motion-reduce:transition-none">
        <img src={image.image_url} alt={image.caption || "Association gallery photo"} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105 motion-reduce:transform-none" />
        {image.caption && <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground">{image.caption}</span>}
      </Button>)}
    </div>
    <Dialog open={!!preview} onOpenChange={open => { if (!open) setPreview(null); }}>
      <DialogContent className="max-w-3xl p-2">
        <DialogTitle className="sr-only">{preview?.caption || "Photo"}</DialogTitle>
        {preview && <img src={preview.image_url} alt={preview.caption || "Association gallery photo"} className="max-h-[80vh] w-full rounded object-contain" />}
        {preview?.caption && <p className="px-2 pb-2 text-sm">{preview.caption}</p>}
      </DialogContent>
    </Dialog>
  </>;
}