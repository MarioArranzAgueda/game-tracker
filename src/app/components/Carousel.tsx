import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type WithIgdbId = { igdbId: number };

type CarouselProps<T extends WithIgdbId> = {
    addingId?: number | null;
    color?: string;
    Component: React.ComponentType<{ item: T; inLibrary?: boolean; onAdd?: (status: string) => void; isAdding?: boolean; onDelete?: () => void; isDeleting?: boolean }>;
    data: T[];
    deletingId?: number | null;
    icon?: React.ReactNode;
    libraryEntryMap?: Map<number, number>;
    libraryIds?: Set<number>;
    onAddToLibrary?: (igdbId: number, status: string) => void;
    onDeleteFromLibrary?: (entryId: number) => void;
    title?: string;
};

export function Carousel<T extends WithIgdbId>({
    addingId,
    color,
    Component,
    data,
    deletingId,
    icon,
    libraryEntryMap,
    libraryIds,
    onAddToLibrary,
    onDeleteFromLibrary,
    title,
}: CarouselProps<T>) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) el.addEventListener('scroll', checkScroll, { passive: true });
        return () => el?.removeEventListener('scroll', checkScroll);
    }, [data]);

    const scroll = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.8;
        el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    if (data.length === 0) return null;

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <div className={`border-l-4 ${color} pl-3 flex items-center gap-2`}>
                    {icon}
                    <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
                </div>
            </div>
            <div className="relative group/row">
                {canScrollLeft && (
                    <button onClick={() => scroll('left')} className="absolute cursor-pointer left-0 top-0 bottom-8 z-10 w-10 flex items-center justify-center bg-linear-to-r from-slate-950/90 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
                <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide scroll-smooth">
                    {data.map((item) => (
                        <Component
                            key={item.igdbId}
                            item={item}
                            inLibrary={libraryIds?.has(item.igdbId)}
                            onAdd={onAddToLibrary ? (status) => onAddToLibrary(item.igdbId, status) : undefined}
                            isAdding={addingId === item.igdbId}
                            onDelete={onDeleteFromLibrary && libraryEntryMap?.has(item.igdbId) ? () => onDeleteFromLibrary(libraryEntryMap.get(item.igdbId)!) : undefined}
                            isDeleting={deletingId != null && libraryEntryMap?.get(item.igdbId) === deletingId}
                        />
                    ))}
                </div>
                {canScrollRight && (
                    <button onClick={() => scroll('right')} className="absolute cursor-pointer right-0 top-0 bottom-8 z-10 w-10 flex items-center justify-center bg-linear-to-l from-slate-950/90 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>
        </section>
    );
}