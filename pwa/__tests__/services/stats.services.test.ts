import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTaxSum, getTaxAverage, getRegionDistribution } from '../../app/services/stats.services'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
    mockFetch.mockReset()
})

describe('getTaxSum', () => {
    it('appelle la bonne URL sans année', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ field: 'tfpb', sum: 1000, filters: {} }),
        })

        const result = await getTaxSum('tfpb')

        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/somme/tfpb'))
        expect(result.sum).toBe(1000)
    })

    it('ajoute le paramètre year quand il est fourni', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ field: 'tfpb', sum: 500, filters: { year: 2022 } }),
        })

        await getTaxSum('tfpb', 2022)

        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('year=2022'))
    })

    it('lance une erreur si la réponse est ko', async () => {
        mockFetch.mockResolvedValue({ ok: false })

        await expect(getTaxSum('tfpb')).rejects.toThrow('Erreur lors du chargement de la somme pour tfpb')
    })
})

describe('getTaxAverage', () => {
    it('appelle la bonne URL', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ field: 'cfe', average: 250, filters: {} }),
        })

        const result = await getTaxAverage('cfe')

        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/average/cfe'))
        expect(result.average).toBe(250)
    })

    it('lance une erreur si la réponse est ko', async () => {
        mockFetch.mockResolvedValue({ ok: false })

        await expect(getTaxAverage('cfe')).rejects.toThrow('Erreur lors du chargement de la moyenne pour cfe')
    })
})

describe('getRegionDistribution', () => {
    it('appelle la bonne URL avec le type de taxe', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ tax_type: 'tfpb', year: null, data: [] }),
        })

        await getRegionDistribution('tfpb')

        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('tax_type=tfpb'))
    })

    it('ajoute le paramètre year', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ tax_type: 'tfpb', year: 2022, data: [] }),
        })

        await getRegionDistribution('tfpb', 2022)

        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('year=2022'))
    })

    it('lance une erreur si la réponse est ko', async () => {
        mockFetch.mockResolvedValue({ ok: false })

        await expect(getRegionDistribution('tfpb')).rejects.toThrow(
            'Erreur lors du chargement de la distribution pour tfpb'
        )
    })
})
