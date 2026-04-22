import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Temporal from '../../app/components/tabs/temporal'

// 20 French regions
const MOCK_REGIONS = [
    'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne',
    'Centre-Val de Loire', 'Corse', 'Grand Est', 'Hauts-de-France',
    'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie',
    'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur', 'Guadeloupe',
    'Martinique', 'Guyane', 'La Réunion', 'Mayotte',
    'Nouvelle-Calédonie', 'Polynésie française',
]

// Generate mock time series data for 20 regions
function buildMockTimeSeriesData() {
    const data: Record<string, { year: number; avg_rate: string }[]> = {}
    for (let i = 0; i < MOCK_REGIONS.length; i++) {
        const region = MOCK_REGIONS[i]!
        data[region] = [
            { year: 2019, avg_rate: (10 + i).toFixed(2) },
            { year: 2020, avg_rate: (11 + i).toFixed(2) },
            { year: 2021, avg_rate: (12 + i).toFixed(2) },
            { year: 2022, avg_rate: (13 + i).toFixed(2) },
        ]
    }
    return data
}

// Mock regions context
vi.mock('../../app/contexts/RegionsContext', () => ({
    useRegions: () => MOCK_REGIONS,
}))

// Mock Recharts: capture rendered Lines instead of trying to render SVG
let capturedLines: { dataKey: string; stroke: string }[] = []

vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    Line: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => {
        capturedLines.push({ dataKey, stroke })
        return <div data-testid={`region-line-${dataKey}`} data-stroke={stroke} />
    },
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    CartesianGrid: () => null,
}))

// Mock API service
vi.mock('../../app/services/temporal.services', () => ({
    getTimeSeries: vi.fn(),
}))

import { getTimeSeries } from '../../app/services/temporal.services'

beforeEach(() => {
    vi.clearAllMocks()
    capturedLines = []
})

describe('Temporal - SVG avec 20 régions', () => {
    it('rend 20 composants Line après chargement des données', async () => {
        const mockData = buildMockTimeSeriesData()
        vi.mocked(getTimeSeries).mockResolvedValueOnce(mockData)

        const { container } = render(<Temporal />)

        fireEvent.click(screen.getByText('Afficher'))

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument()
        })

        const lines = container.querySelectorAll('[data-testid^="region-line-"]')
        expect(lines).toHaveLength(20)
    })

    it('chaque ligne correspond à une région', async () => {
        const mockData = buildMockTimeSeriesData()
        vi.mocked(getTimeSeries).mockResolvedValueOnce(mockData)

        render(<Temporal />)

        fireEvent.click(screen.getByText('Afficher'))

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument()
        })

        const renderedDataKeys = capturedLines.map(l => l.dataKey)
        for (const region of MOCK_REGIONS) {
            expect(renderedDataKeys).toContain(region)
        }
    })

    it('chaque ligne a une couleur unique', async () => {
        const mockData = buildMockTimeSeriesData()
        vi.mocked(getTimeSeries).mockResolvedValueOnce(mockData)

        render(<Temporal />)

        fireEvent.click(screen.getByText('Afficher'))

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument()
        })

        const strokes = new Set(capturedLines.map(l => l.stroke))
        expect(strokes.size).toBe(20)
    })

    it('appelle getTimeSeries avec les bons paramètres', async () => {
        const mockData = buildMockTimeSeriesData()
        vi.mocked(getTimeSeries).mockResolvedValueOnce(mockData)

        render(<Temporal />)

        fireEvent.click(screen.getByText('Afficher'))

        await waitFor(() => {
            expect(getTimeSeries).toHaveBeenCalledWith([], 'tfpb', 2019, 2022)
        })
    })
})
