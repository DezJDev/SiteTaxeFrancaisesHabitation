const API_URL = process.env.NEXT_PUBLIC_ENTRYPOINT || 'http://php'

export async function getRegions(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/api/regions`)
        if (!res.ok) return []
        const data = await res.json()
        return data.member.map((r: { regionName: string }) => r.regionName)
    } catch {
        return []
    }
}
