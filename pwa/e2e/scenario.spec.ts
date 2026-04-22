import { test, expect } from '@playwright/test'

test.describe('Scénario global - Parcours utilisateur complet', () => {
    test.describe.configure({ mode: 'serial' })

    test.describe('1. Page d\'accueil - Tableau de bord', () => {
        test('affiche le titre et la description', async ({ page }) => {
            await page.goto('/')

            await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()
            await expect(page.getByText(/Vue d'ensemble des taxes locales françaises/)).toBeVisible()
        })

        test('affiche les 4 cartes de statistiques avec des données', async ({ page }) => {
            await page.goto('/')

            for (const tax of ['TFPNB', 'TFPB', 'TH', 'CFE']) {
                await expect(page.getByText(tax).first()).toBeVisible()
            }

            // Vérifie que les montants sont affichés (format monétaire)
            const statCards = page.locator('.grid > div').first()
            await expect(statCards).toContainText(/€/)
        })

        test('affiche le classement par région avec les top 5', async ({ page }) => {
            await page.goto('/')

            await expect(page.getByRole('heading', { name: 'Classement par région' })).toBeVisible()

            // Vérifie qu'au moins un nom de région apparaît dans les classements
            await expect(page.getByText('Île-de-France').first()).toBeVisible()
        })

        test('affiche l\'équipe de développement', async ({ page }) => {
            await page.goto('/')

            await expect(page.getByRole('heading', { name: 'Équipe de développement' })).toBeVisible()

            for (const member of ['Adrien', 'Clément', 'Jérémy', 'Julien', 'Yoann']) {
                await expect(page.getByText(member)).toBeVisible()
            }
        })

        test('la sidebar affiche tous les liens de navigation', async ({ page }) => {
            await page.goto('/')

            await expect(page.getByRole('link', { name: 'Accueil' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Séries temporelles' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Nuage de points' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Diagramme circulaire' })).toBeVisible()
        })
    })

    test.describe('2. Navigation vers Diagramme circulaire', () => {
        test('navigue vers la page diagramme', async ({ page }) => {
            await page.goto('/')
            await page.getByRole('link', { name: 'Diagramme circulaire' }).click()

            await expect(page).toHaveURL('/diagram')
            await expect(page.getByRole('heading', { name: 'Répartition des Volumes Collectés par Région' })).toBeVisible()
        })

        test('sélectionne une taxe et une année pour afficher le graphique', async ({ page }) => {
            await page.goto('/diagram')

            // Sélectionne TFPB
            const taxeSelect = page.locator('select').first()
            await taxeSelect.selectOption('tfpb')
            await expect(taxeSelect).toHaveValue('tfpb')

            // Sélectionne l'année 2022
            const yearSelect = page.locator('select').nth(1)
            await yearSelect.selectOption('2022')
            await expect(yearSelect).toHaveValue('2022')

            // Attend que le graphique se charge (le conteneur Recharts apparaît)
            await expect(page.locator('.recharts-wrapper')).toBeVisible({ timeout: 15000 })

            // Vérifie que le graphique PieChart est rendu
            await expect(page.locator('.recharts-pie')).toBeVisible()
        })

        test('le sélecteur de régions fonctionne correctement', async ({ page }) => {
            await page.goto('/diagram')

            // Sélectionne TFPB et 2022 pour avoir des données
            await page.locator('select').first().selectOption('tfpb')
            await page.locator('select').nth(1).selectOption('2022')
            await expect(page.locator('.recharts-pie')).toBeVisible({ timeout: 15000 })

            // Clique sur "Aucun" pour tout désélectionner
            await page.getByRole('button', { name: 'Aucun' }).click()

            // Le graphique devrait disparaître (plus de données)
            await expect(page.locator('.recharts-pie')).not.toBeVisible()

            // Clique sur "Tous" pour tout resélectionner
            await page.getByRole('button', { name: 'Tous' }).click()

            // Le graphique revient
            await expect(page.locator('.recharts-pie')).toBeVisible({ timeout: 15000 })
        })

        test('change de type de taxe et le graphique se met à jour', async ({ page }) => {
            await page.goto('/diagram')

            // Affiche d'abord TFPB 2022
            await page.locator('select').first().selectOption('tfpb')
            await page.locator('select').nth(1).selectOption('2022')
            await expect(page.locator('.recharts-pie')).toBeVisible({ timeout: 15000 })

            // Change pour CFE
            await page.locator('select').first().selectOption('cfe')

            // Attend le rechargement du graphique
            await expect(page.locator('.recharts-pie')).toBeVisible({ timeout: 15000 })
        })

        test('le graphique est un SVG contenant des secteurs (paths)', async ({ page }) => {
            await page.goto('/diagram')

            await page.locator('select').first().selectOption('tfpb')
            await page.locator('select').nth(1).selectOption('2022')
            await expect(page.locator('.recharts-pie')).toBeVisible({ timeout: 15000 })

            // Vérifie que le conteneur est bien un SVG
            const svg = page.locator('.recharts-wrapper > .recharts-surface')
            await expect(svg).toBeVisible()
            const tagName = await svg.evaluate(el => el.tagName.toLowerCase())
            expect(tagName).toBe('svg')

            // Vérifie que le PieChart contient plusieurs secteurs (path dans .recharts-pie-sector)
            const sectors = page.locator('.recharts-pie-sector')
            const count = await sectors.count()
            expect(count).toBeGreaterThan(3) // Au moins quelques régions
        })
    })

    test.describe('3. Navigation vers Séries temporelles', () => {
        test('navigue vers la page séries temporelles', async ({ page }) => {
            await page.goto('/diagram')
            await page.getByRole('link', { name: 'Séries temporelles' }).click()

            await expect(page).toHaveURL(/\/temporal/)
            await expect(page.getByRole('heading', { name: /Taux d'imposition moyen par region/ })).toBeVisible()
        })

        test('affiche le graphique avec les paramètres par défaut', async ({ page }) => {
            await page.goto('/temporal')

            // Les sélecteurs ont des valeurs par défaut (TFPB, 2019-2022)
            const taxeSelect = page.locator('select').first()
            await expect(taxeSelect).toHaveValue('tfpb')

            // Clique sur Afficher
            await page.getByRole('button', { name: 'Afficher' }).click()

            // Attend le graphique LineChart
            await expect(page.locator('.recharts-wrapper')).toBeVisible({ timeout: 15000 })
            await expect(page.locator('.recharts-line').first()).toBeVisible()
        })

        test('la validation des dates empêche une plage invalide', async ({ page }) => {
            await page.goto('/temporal')

            // Met la date de début à 2022 et fin à 2019 (invalide)
            const startSelect = page.locator('select').nth(1)
            const endSelect = page.locator('select').nth(2)
            await startSelect.selectOption('2022')
            await endSelect.selectOption('2019')

            // Le message d'erreur de validation apparaît
            await expect(page.getByText('La date de début doit être antérieure à la date de fin.')).toBeVisible()

            // Le bouton Afficher est désactivé
            await expect(page.getByRole('button', { name: 'Afficher' })).toBeDisabled()
        })

        test('le sélecteur de régions permet de filtrer les lignes', async ({ page }) => {
            await page.goto('/temporal')

            // Affiche le graphique
            await page.getByRole('button', { name: 'Afficher' }).click()
            await expect(page.locator('.recharts-line').first()).toBeVisible({ timeout: 15000 })

            // Désélectionne toutes les régions
            await page.getByRole('button', { name: 'Aucun' }).click()

            // Les lignes disparaissent
            await expect(page.locator('.recharts-line')).toHaveCount(0)

            // Resélectionne tout
            await page.getByRole('button', { name: 'Tous' }).click()
            await expect(page.locator('.recharts-line').first()).toBeVisible()
        })

        test('change de taxe et relance l\'affichage', async ({ page }) => {
            await page.goto('/temporal')

            // Affiche avec TFPB par défaut
            await page.getByRole('button', { name: 'Afficher' }).click()
            await expect(page.locator('.recharts-line').first()).toBeVisible({ timeout: 15000 })

            // Change pour TH
            await page.locator('select').first().selectOption('th')
            await page.getByRole('button', { name: 'Afficher' }).click()

            // Le graphique se recharge
            await expect(page.locator('.recharts-line').first()).toBeVisible({ timeout: 15000 })
        })

        test('le graphique SVG contient une ligne par région visible', async ({ page }) => {
            await page.goto('/temporal')

            // Affiche toutes les régions (TFPB 2019-2022)
            await page.getByRole('button', { name: 'Afficher' }).click()
            await expect(page.locator('.recharts-line').first()).toBeVisible({ timeout: 15000 })

            // Vérifie que le conteneur est bien un SVG
            const svg = page.locator('.recharts-wrapper > .recharts-surface')
            await expect(svg).toBeVisible()
            const tagName = await svg.evaluate(el => el.tagName.toLowerCase())
            expect(tagName).toBe('svg')

            // Compte le nombre de lignes (une par région visible)
            const lines = page.locator('.recharts-line')
            const lineCount = await lines.count()
            expect(lineCount).toBeGreaterThan(10) // La France a ~18 régions

            // Désélectionne tout, vérifie qu'il n'y a plus de lignes
            await page.getByRole('button', { name: 'Aucun' }).click()
            await expect(page.locator('.recharts-line')).toHaveCount(0)

            // Resélectionne tout, le nombre de lignes revient
            await page.getByRole('button', { name: 'Tous' }).click()
            const restoredCount = await lines.count()
            expect(restoredCount).toBe(lineCount)
        })
    })

    test.describe('4. Navigation vers Nuage de points', () => {
        test('navigue vers la page nuage de points', async ({ page }) => {
            await page.goto('/temporal')
            await page.getByRole('link', { name: 'Nuage de points' }).click()

            await expect(page).toHaveURL('/points')
            await expect(page.getByRole('heading', { name: /Relation taux d'imposition/ })).toBeVisible()
        })

        test('le bouton Afficher est désactivé sans département', async ({ page }) => {
            await page.goto('/points')

            // Pas de département sélectionné → bouton désactivé
            await expect(page.getByRole('button', { name: 'Afficher' })).toBeDisabled()
        })

        test('recherche un département et affiche le nuage de points', async ({ page }) => {
            await page.goto('/points')

            // Tape "Paris" dans le champ de recherche département
            const searchInput = page.getByPlaceholder('Code ou nom...')
            await searchInput.fill('Paris')

            // Attend l'apparition du dropdown avec les résultats
            await expect(page.locator('button:has-text("75 - Paris")')).toBeVisible({ timeout: 10000 })

            // Sélectionne Paris
            await page.locator('button:has-text("75 - Paris")').click()

            // Le champ de recherche est rempli
            await expect(searchInput).toHaveValue('75 - Paris')

            // Le bouton Afficher est maintenant activé
            await expect(page.getByRole('button', { name: 'Afficher' })).toBeEnabled()

            // Clique sur Afficher
            await page.getByRole('button', { name: 'Afficher' }).click()

            // Attend que le nuage de points se charge (canvas Chart.js)
            await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 })

            // Vérifie que les infos du département apparaissent
            await expect(page.getByText(/Paris/)).toBeVisible()
            await expect(page.getByText(/communes/)).toBeVisible()
        })

        test('recherche une commune pour la mettre en surbrillance', async ({ page }) => {
            await page.goto('/points')

            // Sélectionne d'abord un département
            const searchInput = page.getByPlaceholder('Code ou nom...')
            await searchInput.fill('Paris')
            await expect(page.locator('button:has-text("75 - Paris")')).toBeVisible({ timeout: 10000 })
            await page.locator('button:has-text("75 - Paris")').click()
            await page.getByRole('button', { name: 'Afficher' }).click()
            await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 })

            // Vérifie que le champ de recherche de commune est apparu
            const communeInput = page.getByPlaceholder('Rechercher une commune...')
            await expect(communeInput).toBeVisible()
        })

        test('le nuage de points est rendu dans un élément canvas', async ({ page }) => {
            await page.goto('/points')

            // Sélectionne Paris
            const searchInput = page.getByPlaceholder('Code ou nom...')
            await searchInput.fill('Paris')
            await expect(page.locator('button:has-text("75 - Paris")')).toBeVisible({ timeout: 10000 })
            await page.locator('button:has-text("75 - Paris")').click()
            await page.getByRole('button', { name: 'Afficher' }).click()

            // Vérifie que c'est bien un canvas (Chart.js utilise canvas, pas SVG)
            const canvas = page.locator('canvas')
            await expect(canvas).toBeVisible({ timeout: 15000 })
            const tagName = await canvas.evaluate(el => el.tagName.toLowerCase())
            expect(tagName).toBe('canvas')

            // Vérifie que le canvas a des dimensions réelles (pas un canvas vide de 0x0)
            const width = await canvas.evaluate(el => (el as HTMLCanvasElement).width)
            const height = await canvas.evaluate(el => (el as HTMLCanvasElement).height)
            expect(width).toBeGreaterThan(0)
            expect(height).toBeGreaterThan(0)
        })

        test('change le type de taxe et l\'année', async ({ page }) => {
            await page.goto('/points')

            // Les sélecteurs de taxe et année sont présents
            const taxeSelect = page.locator('select').first()
            const yearSelect = page.locator('select').nth(1)

            await expect(taxeSelect).toHaveValue('th')
            await expect(yearSelect).toHaveValue('2019')

            // Change les valeurs
            await taxeSelect.selectOption('cfe')
            await yearSelect.selectOption('2022')

            await expect(taxeSelect).toHaveValue('cfe')
            await expect(yearSelect).toHaveValue('2022')
        })
    })

    test.describe('5. Retour à l\'accueil', () => {
        test('revient à l\'accueil depuis la page nuage de points', async ({ page }) => {
            await page.goto('/points')
            await page.getByRole('link', { name: 'Accueil' }).click()

            await expect(page).toHaveURL('/')
            await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()
        })

        test('le tableau de bord affiche toujours les données correctement', async ({ page }) => {
            await page.goto('/')

            // Les 4 cartes sont toujours là
            for (const tax of ['TFPNB', 'TFPB', 'TH', 'CFE']) {
                await expect(page.getByText(tax).first()).toBeVisible()
            }

            // Le classement par région est toujours visible
            await expect(page.getByRole('heading', { name: 'Classement par région' })).toBeVisible()
        })
    })
})
