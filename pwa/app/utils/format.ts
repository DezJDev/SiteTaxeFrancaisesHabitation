export function formatCurrency(value: number): string {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(2)} Md€`
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(2)} M€`
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(2)} k€`
    }
    return `${value.toFixed(2)} €`
}
