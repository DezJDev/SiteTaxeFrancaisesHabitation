import './globals.css'
import MainLayout from './components/organisms/MainLayout'
import { RegionsProvider } from './contexts/RegionsContext'
import { getRegions } from './services/regions.services'

export const metadata = {
    title: 'FullStack Lab - REI 2022',
    description: 'Analyse des taxes locales françaises',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const regions = await getRegions()
    return (
        <html lang="fr">
            <body>
                <RegionsProvider regions={regions}>
                    <MainLayout>{children}</MainLayout>
                </RegionsProvider>
            </body>
        </html>
    )
}
