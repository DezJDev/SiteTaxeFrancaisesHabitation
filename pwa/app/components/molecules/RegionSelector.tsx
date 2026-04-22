'use client'

interface RegionSelectorProps {
    regions: string[]
    selectedRegions: string[]
    onSelectionChange: (regions: string[]) => void
}

export default function RegionSelector({ regions, selectedRegions, onSelectionChange }: RegionSelectorProps) {
    const toggleRegion = (region: string) => {
        const newSelection = selectedRegions.includes(region) ? selectedRegions.filter(r => r !== region) : [...selectedRegions, region]
        onSelectionChange(newSelection)
    }

    if (regions.length === 0) return null

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs text-[#b0afaf] uppercase">Régions {selectedRegions.length > 0 && `(${selectedRegions.length})`}</label>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onSelectionChange(regions)}
                    className="text-xs px-3 py-1 rounded-full border border-[#3a3f44] text-[#b0afaf] hover:text-white transition-colors"
                >
                    Tous
                </button>
                <button
                    onClick={() => onSelectionChange([])}
                    className="text-xs px-3 py-1 rounded-full border border-[#3a3f44] text-[#b0afaf] hover:text-white transition-colors"
                >
                    Aucun
                </button>
                {regions.map(region => (
                    <button
                        key={region}
                        onClick={() => toggleRegion(region)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                            selectedRegions.includes(region) ? 'bg-[#8884d8] border-[#8884d8] text-white' : 'border-[#3a3f44] text-[#b0afaf] hover:text-white'
                        }`}
                    >
                        {region}
                    </button>
                ))}
            </div>
        </div>
    )
}
