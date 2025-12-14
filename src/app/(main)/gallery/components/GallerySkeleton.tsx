export function GallerySkeleton() {
    return (
        <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="glass-card overflow-hidden break-inside-avoid shadow-sm animate-pulse">
                    <div className="w-full aspect-square bg-zinc-200/50 dark:bg-zinc-800/50" />
                    <div className="p-4 space-y-3">
                        <div className="h-4 bg-zinc-200/50 dark:bg-zinc-800/50 rounded w-3/4" />
                        <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50" />
                                <div className="w-16 h-3 bg-zinc-200/50 dark:bg-zinc-800/50 rounded" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
