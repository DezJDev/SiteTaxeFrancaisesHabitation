import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../../app/utils/format'

describe('formatCurrency', () => {
    it('formate les valeurs en milliards', () => {
        expect(formatCurrency(1_500_000_000)).toBe('1.50 Md€')
        expect(formatCurrency(2_000_000_000)).toBe('2.00 Md€')
    })

    it('formate les valeurs en millions', () => {
        expect(formatCurrency(1_500_000)).toBe('1.50 M€')
        expect(formatCurrency(42_000_000)).toBe('42.00 M€')
    })

    it('formate les valeurs en milliers', () => {
        expect(formatCurrency(1_500)).toBe('1.50 k€')
        expect(formatCurrency(999_999)).toBe('1000.00 k€')
    })

    it('formate les petites valeurs en euros', () => {
        expect(formatCurrency(500)).toBe('500.00 €')
        expect(formatCurrency(0)).toBe('0.00 €')
        expect(formatCurrency(99.99)).toBe('99.99 €')
    })

    it('gère la valeur seuil exacte', () => {
        expect(formatCurrency(1_000)).toBe('1.00 k€')
        expect(formatCurrency(1_000_000)).toBe('1.00 M€')
        expect(formatCurrency(1_000_000_000)).toBe('1.00 Md€')
    })
})
