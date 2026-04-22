import { TAX_TYPES, YEARS } from './constants'
import { getTaxSum, getTaxAverage, getRegionDistribution, type RegionDistributionEntry } from './services/stats.services'
import StatCard from './components/molecules/StatCard'
import RegionRanking from './components/molecules/RegionRanking'
import TeamAvatar from './components/molecules/TeamAvatar'
import ErrorDiv from './components/molecules/ErrorDiv'
import { TrendingUp, Calculator, DollarSign, BarChart3 } from 'lucide-react'
import { formatCurrency } from './utils/format'

const TAX_LABELS: Record<string, string> = {
    tfpnb: 'Taxe Foncière sur les Propriétés Non Bâties',
    tfpb: 'Taxe Foncière sur les Propriétés Bâties',
    th: "Taxe d'Habitation",
    cfe: 'Cotisation Foncière des Entreprises',
}

const TAX_SHORT: Record<string, string> = {
    tfpnb: 'TFPNB',
    tfpb: 'TFPB',
    th: 'TH',
    cfe: 'CFE',
}

const TAX_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
    tfpnb: TrendingUp,
    tfpb: DollarSign,
    th: BarChart3,
    cfe: Calculator,
}

const TAX_COLORS: Record<string, string> = {
    tfpnb: '#82ca9d',
    tfpb: '#8884d8',
    th: '#ffc658',
    cfe: '#ff7300',
}

export default async function Home() {
    const year = Math.max(...YEARS)

    let data: { field: string; sum: number | null; average: number | null }[] = []
    const rankings: Record<string, RegionDistributionEntry[]> = {}
    let error: string | null = null

    try {
        const [statsResults, ...distributionResults] = await Promise.all([
            Promise.all(
                TAX_TYPES.map(async field => {
                    const [sumRes, avgRes] = await Promise.all([getTaxSum(field, year), getTaxAverage(field, year)])
                    return { field, sum: sumRes.sum, average: avgRes.average }
                })
            ),
            ...TAX_TYPES.map(field => getRegionDistribution(field, year)),
        ])
        data = statsResults
        TAX_TYPES.forEach((field, i) => {
            rankings[field] = distributionResults[i]?.data ?? []
        })
    } catch (e) {
        error = e instanceof Error ? e.message : 'Une erreur est survenue'
    }

    return (
        <div className="p-6 text-white flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">Tableau de bord</h2>
                    <p className="text-sm text-[#b0afaf]">Vue d&apos;ensemble des taxes locales françaises - Année {year}</p>
                </div>

            </div>

            {error && <ErrorDiv message={error} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {data.map(item => (
                    <StatCard
                        key={item.field}
                        label={TAX_LABELS[item.field] ?? item.field}
                        shortLabel={TAX_SHORT[item.field] ?? item.field}
                        icon={TAX_ICONS[item.field]!}
                        color={TAX_COLORS[item.field] ?? '#8884d8'}
                        total={item.sum}
                        average={item.average}
                        formatValue={formatCurrency}
                    />
                ))}
            </div>

            <h2 className="text-lg font-semibold">Classement par région</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {TAX_TYPES.map(field => (
                    <RegionRanking
                        key={field}
                        shortLabel={TAX_SHORT[field] ?? field}
                        color={TAX_COLORS[field] ?? '#8884d8'}
                        regions={rankings[field] ?? []}
                        formatValue={formatCurrency}
                    />
                ))}
            </div>

            <h2 className="text-lg font-semibold">Équipe de développement</h2>

            <div className="flex justify-center gap-12">
                {[
                    { name: 'Adrien', img: '/team/marco.png', color: '#8884d8' },
                    { name: 'Clément', img: '/team/Gohmma.png', color: '#82ca9d' },
                    { name: 'Jérémy', img: '/team/Dede.png', color: '#ffc658' },
                    { name: 'Julien', img: '/team/PotiFlamby.png', color: '#ff7300' },
                    { name: 'Yoann', img: '/team/Yoann.png', color: '#00C49F' },
                ].map(member => (
                    <TeamAvatar key={member.name} name={member.name} img={member.img} color={member.color} />
                ))}
            </div>
        </div>
    )
}
