import { Search, Menu } from 'lucide-react'

interface HeaderProps {
    onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
    return (
        <div className="bg-[#212529] w-full h-22 flex items-center gap-4 px-6 relative z-20">
            <div className="flex items-center gap-4 w-5/6">
                <button
                    onClick={onToggleSidebar}
                    className="md:hidden text-[#b0afaf] hover:text-white transition-colors cursor-pointer"
                >
                    <Menu size={24} />
                </button>
                <div className="relative w-5/6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0afaf]" size={16} />
                    <input
                        className="rounded-full border-[#3a3f44] border-2 w-full pl-9 pr-3 py-1.5 bg-transparent text-white placeholder-[#b0afaf]"
                        placeholder="Search"
                    />
                </div>
            </div>
            <div className='w-1/6 flex justify-end'>
                <div className="h-10 w-10 rounded-full bg-[#8884d8] flex items-center justify-center text-white text-xs font-bold">
                    ACJJ
                </div>
            </div>
        </div>
    )
}
