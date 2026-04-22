import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RegionRanking from '../../app/components/molecules/RegionRanking'

const mockRegions = [
    { region: 'Île-de-France', total_amount: 5000 },
    { region: 'Auvergne-Rhône-Alpes', total_amount: 3000 },
    { region: 'Provence-Alpes-Côte d\'Azur', total_amount: 2500 },
    { region: 'Occitanie', total_amount: 2000 },
    { region: 'Nouvelle-Aquitaine', total_amount: 1500 },
    { region: 'Hauts-de-France', total_amount: 1000 },
    { region: 'Grand Est', total_amount: 800 },
]

const defaultProps = {
    shortLabel: 'TFPB',
    color: '#8884d8',
    regions: mockRegions,
    formatValue: (v: number) => `${v} €`,
}

describe('RegionRanking', () => {
    it('affiche le titre avec le label', () => {
        render(<RegionRanking {...defaultProps} />)

        expect(screen.getByText('TFPB')).toBeInTheDocument()
        expect(screen.getByText(/Top 5 régions/)).toBeInTheDocument()
    })

    it('affiche seulement les 5 premières régions triées par montant', () => {
        render(<RegionRanking {...defaultProps} />)

        expect(screen.getByText('Île-de-France')).toBeInTheDocument()
        expect(screen.getByText('Auvergne-Rhône-Alpes')).toBeInTheDocument()
        expect(screen.getByText("Provence-Alpes-Côte d'Azur")).toBeInTheDocument()
        expect(screen.getByText('Occitanie')).toBeInTheDocument()
        expect(screen.getByText('Nouvelle-Aquitaine')).toBeInTheDocument()

        expect(screen.queryByText('Hauts-de-France')).not.toBeInTheDocument()
        expect(screen.queryByText('Grand Est')).not.toBeInTheDocument()
    })

    it('affiche les montants formatés', () => {
        render(<RegionRanking {...defaultProps} />)

        expect(screen.getByText('5000 €')).toBeInTheDocument()
        expect(screen.getByText('3000 €')).toBeInTheDocument()
    })

    it('affiche les numéros de classement', () => {
        render(<RegionRanking {...defaultProps} />)

        expect(screen.getByText('1.')).toBeInTheDocument()
        expect(screen.getByText('5.')).toBeInTheDocument()
    })

    it('gère une liste vide', () => {
        render(<RegionRanking {...defaultProps} regions={[]} />)

        expect(screen.getByText(/Top 5 régions/)).toBeInTheDocument()
    })
})
