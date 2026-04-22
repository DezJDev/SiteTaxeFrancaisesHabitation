export interface RegionDistribution {
    region: string
    total_amount: number
    percentage: number
    otherRegions?: string[]
    otherRegionsSmall?: Array<{ name: string; percentage: number }> // Selected regions < 0.5%
    otherRegionsNotSelected?: Array<{ name: string; percentage: number }> // Not selected regions
}

export async function getRegionDistribution(taxType: string, year: number): Promise<RegionDistribution[]> {
    const params = new URLSearchParams({
        tax_type: taxType,
        year: String(year),
    })
    const res = await fetch(`/api/regions/distribution?${params}`)
    if (!res.ok) throw new Error('Erreur lors du chargement de la distribution régionale')
    const data = await res.json()
    // Ensure amounts are numbers
    const normalized = data.data.map((item: { region: string; total_amount: string | number; percentage?: string | number }) => ({
        region: item.region,
        total_amount: parseFloat(item.total_amount?.toString() || '0') || 0,
        percentage: item.percentage ? parseFloat(item.percentage.toString()) : 0,
    }))
    return normalized
}

export function prepareChartData(data: RegionDistribution[], topCount: number = 9): RegionDistribution[] {
    // Sort by descending amount
    const sorted = [...data].sort((a, b) => b.total_amount - a.total_amount)

    // Calculate total for percentages
    const totalAmount = sorted.reduce((sum, item) => sum + item.total_amount, 0)

    // Keep top N regions and recalculate percentages
    const topN: RegionDistribution[] = sorted.slice(0, topCount).map(item => ({
        region: item.region,
        total_amount: item.total_amount,
        percentage: totalAmount > 0 ? (item.total_amount / totalAmount) * 100 : 0,
    }))

    // Group the others
    const others = sorted.slice(topCount)
    const othersTotal = others.reduce((sum, item) => sum + item.total_amount, 0)
    const othersPercentage = totalAmount > 0 ? (othersTotal / totalAmount) * 100 : 0

    // Create final array with "Others" if needed
    const result: RegionDistribution[] = [...topN]
    if (others.length > 0) {
        result.push({
            region: 'Autres',
            total_amount: othersTotal,
            percentage: othersPercentage,
            otherRegions: others.map(item => item.region),
        })
    }

    return result
}
