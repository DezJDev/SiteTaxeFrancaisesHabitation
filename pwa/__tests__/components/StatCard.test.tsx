import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from '../../app/components/molecules/StatCard'

const MockIcon = ({ size, style }: { size?: number; style?: React.CSSProperties }) => (
    <svg data-testid="icon" width={size} style={style} />
)

const defaultProps = {
    label: 'Taxe Foncière sur les Propriétés Bâties',
    shortLabel: 'TFPB',
    icon: MockIcon,
    color: '#8884d8',
    total: 25000000,
    average: 12500,
    formatValue: (v: number) => `${v} €`,
}

describe('StatCard', () => {
    it('affiche le label court et le label complet', () => {
        render(<StatCard {...defaultProps} />)

        expect(screen.getByText('TFPB')).toBeInTheDocument()
        expect(screen.getByText('Taxe Foncière sur les Propriétés Bâties')).toBeInTheDocument()
    })

    it('affiche le total et la moyenne formatés', () => {
        render(<StatCard {...defaultProps} />)

        expect(screen.getByText('25000000 €')).toBeInTheDocument()
        expect(screen.getByText('12500 €')).toBeInTheDocument()
    })

    it('affiche un tiret quand le total est null', () => {
        render(<StatCard {...defaultProps} total={null} />)

        expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('affiche un tiret quand la moyenne est null', () => {
        render(<StatCard {...defaultProps} average={null} />)

        expect(screen.getByText('—')).toBeInTheDocument()
    })

    it("affiche l'icône", () => {
        render(<StatCard {...defaultProps} />)

        expect(screen.getByTestId('icon')).toBeInTheDocument()
    })
})
