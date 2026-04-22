'use client'

import { useEffect, useRef, useState } from 'react'
import { Scatter } from 'react-chartjs-2'
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)
import { searchDepartments, getCorrelation, type Department, type CorrelationPoint } from '../../services/points.services'
import { TAX_TYPES, YEARS } from '../../constants'
import ErrorDiv from '../molecules/ErrorDiv'
import Loader from '../molecules/Loader'

export default function Points() {
    // Department search autocomplete results from API
    const [results, setResults] = useState<Department[]>([])
    // Selected department code for the correlation query
    const [departmentCode, setDepartmentCode] = useState<string>('')
    // Department search input value
    const [search, setSearch] = useState('')
    // Controls department dropdown visibility
    const [showDropdown, setShowDropdown] = useState(false)
    // Selected tax type filter (th, tfpb, tfpnb, cfe)
    const [taxType, setTaxType] = useState<string>('th')
    // Selected year filter
    const [year, setYear] = useState<number>(2019)
    // Correlation data points returned by the API
    const [data, setData] = useState<CorrelationPoint[]>([])
    // API request loading state
    const [loading, setLoading] = useState(false)
    // API error message
    const [error, setError] = useState<string | null>(null)
    // Ref for click-outside detection on department dropdown
    const dropdownRef = useRef<HTMLDivElement>(null)
    // Debounce timer for department search input
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
    // Currently selected department (for display)
    const [selectedDept, setSelectedDept] = useState<Department | null>(null)
    // Commune search input value (post-chart highlight)
    const [communeSearch, setCommuneSearch] = useState('')
    // Commune name to highlight on the scatter plot
    const [highlightedCommune, setHighlightedCommune] = useState<string | null>(null)
    // Controls commune dropdown visibility
    const [showCommuneDropdown, setShowCommuneDropdown] = useState(false)
    // Ref for click-outside detection on commune dropdown
    const communeDropdownRef = useRef<HTMLDivElement>(null)

    // Filtered commune suggestions based on search input (starts with match, max 10)
    const communeSuggestions = communeSearch.length >= 2
        ? data.filter(p => p.commune_name.toLowerCase().startsWith(communeSearch.toLowerCase())).slice(0, 10)
        : []

    // Register zoom plugin client-side only (hammerjs requires window)
    useEffect(() => {
        import('chartjs-plugin-zoom').then(mod => {
            ChartJS.register(mod.default)
        })
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
            if (communeDropdownRef.current && !communeDropdownRef.current.contains(e.target as Node)) {
                setShowCommuneDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Debounced department search handler (calls API after 300ms)
    const handleSearchChange = (value: string) => {
        setSearch(value)
        setDepartmentCode('')
        setShowDropdown(true)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (value.length < 2) {
            setResults([])
            return
        }
        debounceRef.current = setTimeout(() => {
            searchDepartments(value).then(setResults)
        }, 300)
    }

    // Sets selected department and fills search input
    const selectDepartment = (dept: Department) => {
        setDepartmentCode(dept.departmentCode)
        setSelectedDept(dept)
        setSearch(`${dept.departmentCode} - ${dept.departmentName}`)
        setShowDropdown(false)
    }

    // Fetches correlation data from API for the selected department, tax type and year
    const handleSubmit = async () => {
        if (!departmentCode) return
        setLoading(true)
        setError(null)
        try {
            const result = await getCorrelation(departmentCode, taxType, year)
            setData(result)
        } catch (e) {
            setData([])
            setError(e instanceof Error ? e.message : 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    // Chart.js dataset config — per-point styling highlights the selected commune
    const chartConfig = {
        datasets: [
            {
                label: 'Communes',
                data: data.map(p => ({ x: p.rate, y: p.amount / 1_000_000, commune: p.commune_name })),
                borderColor: data.map(p => p.commune_name === highlightedCommune ? '#ff4444' : 'rgba(136, 132, 216, 0.8)'),
                backgroundColor: data.map(p => p.commune_name === highlightedCommune ? '#ff4444' : 'rgba(136, 132, 216, 0.8)'),
                pointStyle: data.map(p => p.commune_name === highlightedCommune ? 'circle' as const : 'cross' as const),
                pointRadius: data.map(p => p.commune_name === highlightedCommune ? 8 : 4),
                borderWidth: 2,
            },
        ],
    }

    // Chart.js options: axes labels, zoom/pan plugin, tooltip formatting
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: 'Taux (%)', color: '#b0afaf' },
                ticks: { color: '#b0afaf' },
                grid: { color: '#3a3f44' },
            },
            y: {
                title: { display: true, text: 'Volume (M€)', color: '#b0afaf' },
                ticks: { color: '#b0afaf' },
                grid: { color: '#3a3f44' },
            },
        },
        plugins: {
            legend: { display: false },
            datalabels: { display: false },
            zoom: {
                zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: 'xy' as const,
                },
                pan: {
                    enabled: true,
                    mode: 'xy' as const,
                },
            },
            tooltip: {
                backgroundColor: '#212529',
                borderColor: '#3a3f44',
                borderWidth: 1,
                callbacks: {
                    label: (ctx: { raw: unknown; parsed: { x: number | null; y: number | null } }) => {
                        const raw = ctx.raw as { commune?: string } | undefined
                        const name = raw?.commune ?? ''
                        return [`${name}`, `Taux: ${ctx.parsed.x}%`, `Volume: ${(ctx.parsed.y ?? 0).toFixed(3)} M€`]
                    },
                },
            },
        },
    }

    return (
        <div className="p-6 text-white flex flex-col gap-6">
            <h2 className="text-lg font-semibold">Relation taux d&apos;imposition / volume collecté</h2>

            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
                    <label className="text-xs text-[#b0afaf] uppercase">Département</label>
                    <input
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        onFocus={() => search.length >= 2 && setShowDropdown(true)}
                        placeholder="Code ou nom..."
                        className="bg-[#212529] border border-[#3a3f44] rounded px-3 py-1.5 text-white text-sm w-64"
                    />
                    {showDropdown && results.length > 0 && (
                        <div className="absolute top-full mt-1 w-64 max-h-60 overflow-auto bg-[#212529] border border-[#3a3f44] rounded z-10">
                            {results.map(d => (
                                <button
                                    key={d.departmentCode}
                                    onClick={() => selectDepartment(d)}
                                    className="w-full text-left px-3 py-1.5 text-sm text-[#b0afaf] hover:bg-[#181C1F] hover:text-white transition-colors"
                                >
                                    {d.departmentCode} - {d.departmentName}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

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
                    <label className="text-xs text-[#b0afaf] uppercase">Année</label>
                    <select
                        value={year}
                        onChange={e => setYear(Number(e.target.value))}
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
                    disabled={loading || !departmentCode}
                    className="bg-[#8884d8] hover:bg-[#7773c7] disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded transition-colors"
                >
                    {loading ? 'Chargement...' : 'Afficher'}
                </button>
            </div>

            {loading && <Loader />}

            {error && <ErrorDiv message={error} />}

            {!loading && !error && data.length > 0 && (
                <>
                    <div className="flex flex-wrap gap-4 items-end">
                        <p className="text-sm text-[#b0afaf]">
                            {selectedDept?.departmentName} — {data.length} communes
                        </p>
                        <div className="flex flex-col gap-1 relative" ref={communeDropdownRef}>
                            <input
                                value={communeSearch}
                                onChange={e => {
                                    setCommuneSearch(e.target.value)
                                    setShowCommuneDropdown(true)
                                    if (!e.target.value) setHighlightedCommune(null)
                                }}
                                onFocus={() => communeSearch.length >= 2 && setShowCommuneDropdown(true)}
                                placeholder="Rechercher une commune..."
                                className="bg-[#212529] border border-[#3a3f44] rounded px-3 py-1.5 text-white text-sm w-64"
                            />
                            {showCommuneDropdown && communeSuggestions.length > 0 && (
                                <div className="absolute top-full mt-1 w-64 max-h-60 overflow-auto bg-[#212529] border border-[#3a3f44] rounded z-10">
                                    {communeSuggestions.map(c => (
                                        <button
                                            key={c.commune_name}
                                            onClick={() => {
                                                setHighlightedCommune(c.commune_name)
                                                setCommuneSearch(c.commune_name)
                                                setShowCommuneDropdown(false)
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-sm text-[#b0afaf] hover:bg-[#181C1F] hover:text-white transition-colors"
                                        >
                                            {c.commune_name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-[450px]">
                        <Scatter data={chartConfig} options={chartOptions} />
                    </div>
                </>
            )}
        </div>
    )
}
