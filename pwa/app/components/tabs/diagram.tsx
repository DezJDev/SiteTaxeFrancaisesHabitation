'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { TAX_TYPES, YEARS, COLORS } from '../../constants'
import { getRegionDistribution, RegionDistribution } from '../../services/diagram.services'
import { useRegions } from '../../contexts/RegionsContext'
import ErrorDiv from '../molecules/ErrorDiv'
import RegionSelector from '../molecules/RegionSelector'
import Loader from '../molecules/Loader'

export default function Diagram() {
    const regions = useRegions()
    const [taxType, setTaxType] = useState('')
    const [year, setYear] = useState<number | null>(null)
    const [data, setData] = useState<RegionDistribution[]>([])
    const [rawData, setRawData] = useState<RegionDistribution[]>([]) // Store fetched data
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    // Regions currently selected for display (all selected by default)
    const [selectedRegions, setSelectedRegions] = useState<string[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    // Initialize selectedRegions with all regions on first render
    useEffect(() => {
        if (!isInitialized && regions.length > 0) {
            setSelectedRegions(regions)
            setIsInitialized(true)
        }
    }, [regions, isInitialized])

    // Fetch data only when tax type or year changes
    useEffect(() => {
        const fetchData = async () => {
            if (!taxType || !year) {
                setRawData([])
                setData([])
                return
            }
            setLoading(true)
            setError(null)
            try {
                const result = await getRegionDistribution(taxType, year)
                setRawData(result)
            } catch (e) {
                setRawData([])
                setData([])
                setError(e instanceof Error ? e.message : 'Une erreur est survenue')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [taxType, year])

    // Filter and process data when selectedRegions or rawData changes
    useEffect(() => {
        if (rawData.length === 0 || selectedRegions.length === 0) {
            setData([])
            return
        }

        // Calculate total for percentages
        const totalAmount = rawData.reduce((sum, item) => sum + item.total_amount, 0)

        // Separate selected and non-selected regions
        const selected = rawData.filter(r => selectedRegions.includes(r.region))
        const notSelected = rawData.filter(r => !selectedRegions.includes(r.region))

        // Filter selected regions: keep only those >= 0.5%, others go to "Autres"
        const significantRegions: RegionDistribution[] = []
        const smallRegions: RegionDistribution[] = []

        selected.forEach(item => {
            const percentage = totalAmount > 0 ? (item.total_amount / totalAmount) * 100 : 0
            if (percentage >= 0.5) {
                significantRegions.push({
                    region: item.region,
                    total_amount: item.total_amount,
                    percentage: percentage,
                })
            } else {
                smallRegions.push(item)
            }
        })

        // Combine small selected regions with non-selected regions for "Autres"
        const othersRegions = [...smallRegions, ...notSelected]

        // Add "Autres" if there are regions to group
        if (othersRegions.length > 0) {
            const othersTotal = othersRegions.reduce((sum, item) => sum + item.total_amount, 0)
            const othersPercentage = totalAmount > 0 ? (othersTotal / totalAmount) * 100 : 0
            significantRegions.push({
                region: 'Autres',
                total_amount: othersTotal,
                percentage: othersPercentage,
                otherRegionsSmall: smallRegions.map(item => ({
                    name: item.region,
                    percentage: totalAmount > 0 ? (item.total_amount / totalAmount) * 100 : 0,
                })),
                otherRegionsNotSelected: notSelected.map(item => ({
                    name: item.region,
                    percentage: totalAmount > 0 ? (item.total_amount / totalAmount) * 100 : 0,
                })),
            })
        }

        setData(significantRegions)
    }, [rawData, selectedRegions])

    // Custom label to display percentage on slices
    const renderLabel = (props: { payload?: RegionDistribution; percent?: number }) => {
        const entry = props.payload
        if (!entry || !entry.percentage || entry.percentage < 3) return ''
        return `${entry.percentage.toFixed(1)}%`
    }

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: RegionDistribution }[] }) => {
        if (active && payload && payload.length && payload[0]) {
            const region = payload[0].payload
            const amount = region.total_amount ? (region.total_amount / 1_000_000).toFixed(2) : '0.00'
            const percentage = region.percentage ? region.percentage.toFixed(2) : '0.00'

            return (
                <div className="bg-[#212529] border border-[#3a3f44] rounded-lg p-3 text-white">
                    <p className="font-semibold text-lg mb-2">{region.region}</p>
                    <p className="text-base">Volume: {amount} M€</p>
                    <p className="text-base">Part: {percentage}%</p>
                    {region.region === 'Autres' && (
                        <>
                            {region.otherRegionsSmall && region.otherRegionsSmall.length > 0 && (
                                <>
                                    <p className="mt-3 font-semibold">Régions sélectionnées (&lt; 0.5%):</p>
                                    {region.otherRegionsSmall.map((r: { name: string; percentage: number }) => (
                                        <p key={`small-${r.name}`} className="text-sm ml-2">
                                            • {r.name} ({r.percentage < 0.01 ? '<0.01%' : `${r.percentage.toFixed(2)}%`})
                                        </p>
                                    ))}
                                </>
                            )}
                            {region.otherRegionsNotSelected && region.otherRegionsNotSelected.length > 0 && (
                                <>
                                    <p className="mt-3 font-semibold">Régions non sélectionnées:</p>
                                    {region.otherRegionsNotSelected.map((r: { name: string; percentage: number }) => (
                                        <p key={`notsel-${r.name}`} className="text-sm ml-2">
                                            • {r.name} ({r.percentage < 0.01 ? '<0.01%' : `${r.percentage.toFixed(2)}%`})
                                        </p>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </div>
            )
        }
        return null
    }

    return (
        <div className="p-6 text-white flex flex-col gap-6">
            <h2 className="text-lg font-semibold">Répartition des Volumes Collectés par Région</h2>

            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#b0afaf] uppercase">Taxe</label>
                    <select
                        value={taxType}
                        onChange={e => setTaxType(e.target.value)}
                        className="bg-[#212529] border border-[#3a3f44] rounded px-3 py-1.5 text-white text-sm"
                    >
                        <option value="">-- Sélectionnez --</option>
                        {TAX_TYPES.map(t => (
                            <option key={t} value={t}>
                                {t.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#b0afaf] uppercase">Année</label>
                    <select
                        value={year ?? ''}
                        onChange={e => setYear(e.target.value ? Number(e.target.value) : null)}
                        className="bg-[#212529] border border-[#3a3f44] rounded px-3 py-1.5 text-white text-sm"
                    >
                        <option value="">-- Sélectionnez --</option>
                        {YEARS.map(y => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <RegionSelector regions={regions} selectedRegions={selectedRegions} onSelectionChange={setSelectedRegions} />

            {error && <ErrorDiv message={error} />}

            {loading && !error && <Loader />}

            {!error && !loading && data.length > 0 && (
                <div className="w-full">
                    <ResponsiveContainer width="100%" height={950}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="total_amount"
                                nameKey="region"
                                cx="45%"
                                cy="50%"
                                innerRadius="45%"
                                outerRadius="70%"
                                label={renderLabel}
                                labelLine={false}
                                stroke="#1a1d21"
                                strokeWidth={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="middle"
                                align="right"
                                layout="vertical"
                                iconType="circle"
                                iconSize={30}
                                wrapperStyle={{
                                    paddingLeft: '40px',
                                    fontSize: '18px',
                                    lineHeight: '2.5',
                                }}
                                formatter={(value: string) => <span style={{ color: '#b0afaf', fontSize: '18px' }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
