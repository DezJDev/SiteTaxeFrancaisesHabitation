export interface Department {
    departmentCode: string
    departmentName: string
    regionName: string
}

export interface CorrelationPoint {
    commune_name: string
    rate: number
    amount: number
}

export async function searchDepartments(query: string): Promise<Department[]> {
    const params = new URLSearchParams({ search: query })
    const res = await fetch(`/api/departments?${params}`)
    if (!res.ok) throw new Error('Erreur lors de la recherche des départements')
    const json = await res.json()
    return json.member
}

export async function getCorrelation(departmentCode: string, taxType: string, year: number): Promise<CorrelationPoint[]> {
    const params = new URLSearchParams({
        department_code: departmentCode,
        tax_type: taxType,
        year: String(year),
    })
    const res = await fetch(`/api/communes/correlation?${params}`)
    if (!res.ok) throw new Error('Erreur lors du chargement des données de corrélation')
    const json = await res.json()
    return json.data
}
