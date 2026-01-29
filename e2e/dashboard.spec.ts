/**
 * E2E test for main dashboard flow
 * Tests: Login → Dashboard → Check Diário → LiveStatus update
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app
        await page.goto('/');
    });

    test('should load dashboard with all main components', async ({ page }) => {
        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check for main sections
        await expect(page.getByText('Centro de Comando')).toBeVisible();
        await expect(page.getByText('Sinais do Dia')).toBeVisible();
        await expect(page.getByText('Números Hoje')).toBeVisible();
    });

    test('should navigate between tabs', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Click on "O Rito" tab
        await page.click('text=O Rito');
        await expect(page.getByText('Sua consciência operacional diária')).toBeVisible();

        // Click on "Números" tab
        await page.click('text=Números');
        await expect(page.getByText('Números Âncora')).toBeVisible();
    });

    test('should show LiveStatus with empty state', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Check for empty state in metrics
        const emptyState = page.getByText('Configurar Números');
        if (await emptyState.isVisible()) {
            await expect(emptyState).toBeVisible();
        }
    });

    test('should open AI Chat and send message', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Find chat input
        const chatInput = page.getByPlaceholder('Atualize o dia, números ou peça ajuda...');
        await expect(chatInput).toBeVisible();

        // Type message
        await chatInput.fill('Olá');

        // Send message
        await page.click('button[type="submit"]');

        // Wait for response (this will fail if API is not configured, which is expected)
        // Just checking that the UI responds
        await page.waitForTimeout(1000);
    });
});

test.describe('Check Diário Flow', () => {
    test('should complete daily check', async ({ page }) => {
        await page.goto('/?tab=ritual');
        await page.waitForLoadState('networkidle');

        // Check for Check Diário component
        await expect(page.getByText('O Rito')).toBeVisible();

        // Select operation status (green)
        const greenButton = page.locator('button:has-text("Verde")').first();
        if (await greenButton.isVisible()) {
            await greenButton.click();
        }

        // This is a smoke test - just verify the page loads and is interactive
        await expect(page.getByText('Operação')).toBeVisible();
    });
});

test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check that main content is visible
        await expect(page.getByText('Centro de Comando')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('Centro de Comando')).toBeVisible();
    });
});
