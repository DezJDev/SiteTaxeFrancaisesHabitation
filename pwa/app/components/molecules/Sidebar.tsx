'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, TrendingUp, ScatterChart, PieChart, BookOpen, FileText, ExternalLink, FileCode } from 'lucide-react'

const tabs = [
    { href: '/temporal', label: 'Séries temporelles', icon: TrendingUp },
    { href: '/points', label: 'Nuage de points', icon: ScatterChart },
    { href: '/diagram', label: 'Diagramme circulaire', icon: PieChart },
] as const

interface SidebarProps {
    open: boolean
}

export default function Sidebar({ open }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className={`bg-[#212529] w-fit shrink-0 px-8 py-6 text-white border-r border-[#3a3f44] ${open ? 'block' : 'hidden'} md:block absolute md:relative z-20 h-full md:h-auto`}>
            <div className="w-fit">
                <div className="flex gap-2 items-center mb-8 w-fit">
                    <div className="flex gap-1 items-end justify-center rounded">
                        <div className="bar h-5 w-1 rounded-full bg-white" style={{ animationDelay: '0s' }}></div>
                        <div className="bar h-3.5 w-1 rounded-full bg-white" style={{ animationDelay: '0.3s' }}></div>
                        <div className="bar h-4.5 w-1 rounded-full bg-white" style={{ animationDelay: '0.6s' }}></div>
                    </div>
                    <h1>FullStack Lab</h1>
                </div>

                <nav className="flex flex-col gap-1 mb-4">
                    <Link
                        href="/"
                        className={`flex items-center gap-2 text-left text-sm px-3 py-2 rounded transition-colors cursor-pointer ${
                            pathname === '/'
                                ? 'bg-[#181C1F] text-white'
                                : 'text-[#b0afaf] hover:text-white'
                        }`}
                    >
                        <House size={16} />
                        Accueil
                    </Link>
                </nav>

                <div className="flex gap-2 items-center text-[#b0afaf] mb-4">
                    <p className="uppercase text-xs">Visualisation</p>
                </div>

                <nav className="flex flex-col gap-1">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex items-center gap-2 text-left text-sm px-3 py-2 rounded transition-colors cursor-pointer ${
                                pathname === tab.href
                                    ? 'bg-[#181C1F] text-white'
                                    : 'text-[#b0afaf] hover:text-white'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex gap-2 items-center text-[#b0afaf] mb-4 mt-8">
                    <p className="uppercase text-xs">Infos</p>
                </div>

                <nav className="flex flex-col gap-1">
                    <a
                        href="https://pigne.org/teaching/webdev2/lecture/dynamic-graphical-data"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-left text-sm px-3 py-2 rounded text-[#b0afaf] hover:text-white transition-colors"
                    >
                        <BookOpen size={16} />
                        Cours
                    </a>
                    <a
                        href="https://pigne.org/teaching/webdev2/lab/FullStackLab"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-left text-sm px-3 py-2 rounded text-[#b0afaf] hover:text-white transition-colors"
                    >
                        <FileText size={16} />
                        Sujet TP
                    </a>
                </nav>
                <div className="flex gap-2 items-center text-[#b0afaf] mb-4 mt-8">
                    <p className="uppercase text-xs">Librairies</p>
                </div>

                <nav className="flex flex-col gap-1">
                    <a
                        href="https://recharts.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-left text-sm px-3 py-2 rounded text-[#b0afaf] hover:text-white transition-colors"
                    >
                        <ExternalLink size={16} />
                        Recharts
                    </a>
                    <a
                        href="https://www.chartjs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-left text-sm px-3 py-2 rounded text-[#b0afaf] hover:text-white transition-colors"
                    >
                        <ExternalLink size={16} />
                        Chart.js
                    </a>
                </nav>
                <div className="flex gap-2 items-center text-[#b0afaf] mb-4 mt-8">
                    <p className="uppercase text-xs">API</p>
                </div>

                <nav className="flex flex-col gap-1">
                    <a
                        href="/api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-left text-sm px-3 py-2 rounded text-[#b0afaf] hover:text-white transition-colors"
                    >
                        <FileCode size={16} />
                        Swagger
                    </a>
                </nav>
            </div>
        </div>
    )
}
