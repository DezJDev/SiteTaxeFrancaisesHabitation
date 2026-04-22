'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getTimeSeries, type TimeSeriesData } from '../../services/temporal.services'
import { TAX_TYPES, YEARS, COLORS } from '../../constants'
import { useRegions } from '../../contexts/RegionsContext'
import ErrorDiv from '../molecules/ErrorDiv'
import RegionSelector from '../molecules/RegionSelector'
import Loader from '../molecules/Loader'

export default function Temporal() {
    const regions = useRegions()
    // Selected tax type filter (tfpb, tfpnb, th, cfe)
    const [taxType, setTaxType] = useState<string>('tfpb')
    // Start year for the time range
    const [startYear, setStartYear] = useState<number>(2019)
    // End year for the time range
    const [endYear, setEndYear] = useState<number>(2022)
    // Time series data grouped by region { region: [{year, avg_rate}] }
    const [data, setData] = useState<TimeSeriesData | null>(null)
    // API request loading state
    const [loading, setLoading] = useState(false)
    // API error message
    const [error, setError] = useState<string | null>(null)
    // Regions currently selected for display (initialized from SSR props)
    const [selectedRegions, setSelectedRegions] = useState<string[]>(regions)

    // Fetches time series data from API for all regions with selected tax type and year range
    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await getTimeSeries([], taxType, startYear, endYear)
            setData(result)
        } catch (e) {
            setData(null)
            setError(e instanceof Error ? e.message : 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    // Regions present in API response that are also selected by the user
    const visibleRegions = data ? Object.keys(data).filter(r => selectedRegions.includes(r)) : []

    // Pivoted data for Recharts: [{year, Bretagne: 1.2, Normandie: 1.5, ...}]
    const chartData = data
        ? YEARS.filter(y => y >= startYear && y <= endYear).map(year => {
              const point: Record<string, number | string> = { year }
              for (const region of visibleRegions) {
                  const entry = data[region]?.find(e => e.year === year)
                  if (entry) point[region] = parseFloat(entry.avg_rate)
              }
              return point
          })
        : []

    return (
        <div className="p-6 text-white flex flex-col gap-6">
            <h2 className="text-lg font-semibold">Taux d&apos;imposition moyen par region</h2>

            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#b0afaf] uppercase">Taxe</label>
                    <select
                        value={taxType}
                        onChange={e => setTaxType(e.target.value)}
                        className="bg-[#212529] border border-[#3a3f44] rounded px-3 py-1.5 text-white text-sm"
                    >
                        {TAX_TYPES.map(t => (
                            <option key={t} value={t}>
                                {t.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#b0afaf] uppercase">De</label>
                    <select
                        value={startYear}
                        onChange={e => setStartYear(Number(e.target.value))}
                        className="bg-[#212529] border border-[#3a3f44] rounded px-3 py-1.5 text-white text-sm"
                    >
                        {YEARS.map(y => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#b0afaf] uppercase">A</label>
                    <select
                        value={endYear}
                        onChange={e => setEndYear(Number(e.target.value))}
                        className="bg-[#212529] border border-[#3a3f44] rounded px-3 py-1.5 text-white text-sm"
                    >
                        {YEARS.map(y => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || startYear >= endYear}
                    className="bg-[#8884d8] hover:bg-[#7773c7] disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded transition-colors"
                >
                    {loading ? 'Chargement...' : 'Afficher'}
                </button>
            </div>

            {startYear >= endYear && (
                <p className="text-xs text-red-400">La date de début doit être antérieure à la date de fin.</p>
            )}

            <RegionSelector regions={regions} selectedRegions={selectedRegions} onSelectionChange={setSelectedRegions} />

            {loading && <Loader />}

            {error && <ErrorDiv message={error} />}

            {!loading && !error && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3a3f44" />
                        <XAxis dataKey="year" stroke="#b0afaf" />
                        <YAxis stroke="#b0afaf" tickFormatter={(v: number) => `${v}%`} />
                        <Tooltip
                            content={({ payload, label }) => {
                                if (!payload || payload.length === 0) return null
                                return (
                                    <div
                                        className="tooltip-scroll"
                                        style={{
                                            backgroundColor: '#212529',
                                            border: '1px solid #3a3f44',
                                            borderRadius: 8,
                                            padding: '8px 12px',
                                            maxHeight: 300,
                                            overflowY: 'auto',
                                        }}
                                    >
                                        <p style={{ margin: '0 0 4px', color: '#b0afaf' }}>{label}</p>
                                        {[...payload].sort((a, b) => Number(b.value) - Number(a.value)).map(item => (
                                            <p key={item.name} style={{ margin: '2px 0', color: item.color }}>
                                                {item.name} : {item.value}%
                                            </p>
                                        ))}
                                    </div>
                                )
                            }}
                            wrapperStyle={{ zIndex: 10, pointerEvents: 'auto' }}
                        />
                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px',
                            }}
                            content={({ payload }) => (
                                <div className="hidden lg:flex flex-wrap justify-center gap-x-4 gap-y-1 pt-5">
                                    {payload?.map(entry => (
                                        <span key={entry.value} className="flex items-center gap-1 text-xs text-[#b0afaf]">
                                            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                                            {entry.value}
                                        </span>
                                    ))}
                                </div>
                            )}
                        />
                        {visibleRegions.map(region => (
                            <Line
                                key={region}
                                type="monotone"
                                dataKey={region}
                                stroke={COLORS[regions.indexOf(region) % COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
