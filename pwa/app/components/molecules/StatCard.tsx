interface StatCardProps {
    label: string
    shortLabel: string
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
    color: string
    total: number | null
    average: number | null
    formatValue: (value: number) => string
}

export default function StatCard({ label, shortLabel, icon: Icon, color, total, average, formatValue }: StatCardProps) {
    return (
        <div className="bg-[#212529] border border-[#3a3f44] rounded-lg p-5 flex flex-col gap-4 transition-all hover:border-[#55595e]">
            <div className="flex items-center justify-between">
                <span className="text-xs text-[#b0afaf] uppercase tracking-wide">{shortLabel}</span>
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <Icon size={16} style={{ color }} />
                </div>
            </div>

            <div>
                <p className="text-xs text-[#b0afaf] mb-1">Total collecté</p>
                <p className="text-2xl font-bold" style={{ color }}>
                    {total !== null ? formatValue(total) : '—'}
                </p>
            </div>

            <div className="border-t border-[#3a3f44] pt-3">
                <p className="text-xs text-[#b0afaf] mb-1">Moyenne par commune</p>
                <p className="text-lg font-semibold text-white">{average !== null ? formatValue(average) : '—'}</p>
            </div>

            <p className="text-xs text-[#b0afaf] mt-auto">{label}</p>
        </div>
    )
}
