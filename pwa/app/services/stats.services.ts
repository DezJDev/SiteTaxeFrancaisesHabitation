const API_URL = process.env.NEXT_PUBLIC_ENTRYPOINT || 'http://php'

export interface TaxFieldStat {
    field: string
    sum: number | null
    average: number | null
    filters: Record<string, string | number>
}

export async function getTaxSum(field: string, year?: number): Promise<TaxFieldStat> {
    const params = new URLSearchParams()
    if (year) params.set('year', String(year))
    const query = params.toString() ? `?${params}` : ''
    const res = await fetch(`${API_URL}/api/somme/${field}${query}`)
    if (!res.ok) throw new Error(`Erreur lors du chargement de la somme pour ${field}`)
    return res.json()
}

export async function getTaxAverage(field: string, year?: number): Promise<TaxFieldStat> {
    const params = new URLSearchParams()
    if (year) params.set('year', String(year))
    const query = params.toString() ? `?${params}` : ''
    const res = await fetch(`${API_URL}/api/average/${field}${query}`)
    if (!res.ok) throw new Error(`Erreur lors du chargement de la moyenne pour ${field}`)
    return res.json()
}

export interface RegionDistributionEntry {
    region: string
    total_amount: number
}

export interface RegionDistributionResponse {
    tax_type: string
    year: number | null
    data: RegionDistributionEntry[]
}

export async function getRegionDistribution(taxType: string, year?: number): Promise<RegionDistributionResponse> {
    const params = new URLSearchParams({ tax_type: taxType })
    if (year) params.set('year', String(year))
    const res = await fetch(`${API_URL}/api/regions/distribution?${params}`)
    if (!res.ok) throw new Error(`Erreur lors du chargement de la distribution pour ${taxType}`)
    return res.json()
}
