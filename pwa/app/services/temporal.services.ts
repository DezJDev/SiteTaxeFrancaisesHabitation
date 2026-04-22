export interface TimeSeriesEntry {
    year: number
    avg_rate: string
}

export type TimeSeriesData = Record<string, TimeSeriesEntry[]>

export async function getTimeSeries(regions: string[], taxType: string, startYear?: number, endYear?: number): Promise<TimeSeriesData> {
    const params = new URLSearchParams({ tax_type: taxType })
    if (regions.length > 0) params.set('region', regions.join(',')) 
    if (startYear) params.set('start_year', String(startYear))
    if (endYear) params.set('end_year', String(endYear))
    const res = await fetch(`/api/taxes/timeseries?${params}`)
    if (!res.ok) throw new Error('Erreur lors du chargement des séries temporelles')
    const data = await res.json()
    return data.data
}
