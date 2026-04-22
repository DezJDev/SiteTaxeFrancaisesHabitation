'use client'

import { useState } from 'react'
import Sidebar from '../molecules/Sidebar'
import Header from '../molecules/Header'

interface MainLayoutProps {
    children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <main className="flex h-screen relative">
            <Sidebar open={sidebarOpen} />
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="w-full flex flex-col min-w-0">
                <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
                <div className="w-full flex-1 bg-[#181C1F] overflow-auto">
                    {children}
                </div>
            </div>
        </main>
    )
}
