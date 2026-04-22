import type { RegionDistributionEntry } from '../../services/stats.services'

interface RegionRankingProps {
    shortLabel: string
    color: string
    regions: RegionDistributionEntry[]
    formatValue: (value: number) => string
}

export default function RegionRanking({ shortLabel, color, regions, formatValue }: RegionRankingProps) {
    const sorted = [...regions].sort((a, b) => b.total_amount - a.total_amount)
    const top5 = sorted.slice(0, 5)
    const maxAmount = top5[0]?.total_amount ?? 1

    return (
        <div className="bg-[#212529] border border-[#3a3f44] rounded-lg p-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold">
                Top 5 régions — <span style={{ color }}>{shortLabel}</span>
            </h3>

            <div className="flex flex-col gap-2">
                {top5.map((entry, i) => {
                    const pct = (entry.total_amount / maxAmount) * 100

                    return (
                        <div key={entry.region} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[#b0afaf]">
                                    <span className="text-white font-medium">{i + 1}.</span> {entry.region}
                                </span>
                                <span className="font-medium text-white">{formatValue(entry.total_amount)}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-[#181C1F]">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
