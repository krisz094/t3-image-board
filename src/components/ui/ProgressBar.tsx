interface ProgressBarProps {
    progress: number; // 0-100
}
export function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <div className="relative h-[20px] rounded-full overflow-hidden bg-white/10">
            <div className="absolute inset-0 bg-brownmain-200 transition-all" style={{ width: progress + '%' }} />
            <div className="absolute inset-0 text-center text-xs text-white leading-tight flex items-center justify-center">{progress}%</div>
        </div>
    );
}
