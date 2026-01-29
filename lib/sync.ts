
import { createClient } from '@/lib/supabase/client'
import { storage } from '@/lib/storage'
import { logger } from '@/lib/logger'
import { withRetry } from '@/lib/error-handler'

const supabase = createClient()

export const syncEngine = {
    /**
     * Pushes all local data to Supabase (Backup)
     */
    async pushLocalToRemote(userId: string) {
        logger.info('Sync: Pushing local data to remote...', { userId })

        const syncOperations = [
            {
                name: 'Daily Checks',
                data: storage.getDailyChecks(),
                table: 'daily_checks',
                mapFn: (item: any) => ({
                    user_id: userId,
                    date: item.date,
                    payload: item,
                    updated_at: new Date().toISOString()
                }),
                onConflict: 'user_id, date'
            },
            {
                name: 'Weekly Plans',
                data: storage.getWeeklyPlans(),
                table: 'weekly_plans',
                mapFn: (item: any) => ({
                    user_id: userId,
                    week_start: item.weekStart,
                    payload: item,
                    updated_at: new Date().toISOString()
                }),
                onConflict: 'user_id, week_start'
            },
            {
                name: 'Impact Logs',
                data: storage.getImpactLogs(),
                table: 'impact_logs',
                mapFn: (item: any) => ({
                    user_id: userId,
                    date: item.date,
                    payload: item,
                    updated_at: new Date().toISOString()
                }),
                onConflict: 'user_id, date'
            },
            {
                name: 'Dismissed Alerts',
                data: storage.getDismissedAlerts(),
                table: 'dismissed_alerts',
                mapFn: (id: string) => ({
                    user_id: userId,
                    alert_id: id,
                    dismissed_at: new Date().toISOString()
                }),
                onConflict: 'user_id, alert_id'
            },
            {
                name: 'Anchor Metrics',
                data: storage.getAnchorMetrics(),
                table: 'anchor_metrics',
                mapFn: (item: any) => ({
                    id: item.id,
                    user_id: userId,
                    payload: item,
                    updated_at: item.createdAt || new Date().toISOString()
                }),
                onConflict: 'user_id, id'
            },
            {
                name: 'Metric Entries',
                data: storage.getMetricEntries(),
                table: 'metric_entries',
                mapFn: (item: any) => ({
                    user_id: userId,
                    date: item.date,
                    metric_id: item.metricId,
                    payload: item,
                    updated_at: item.updatedAt || new Date().toISOString()
                }),
                onConflict: 'user_id, metric_id, date'
            }
        ]

        for (const op of syncOperations) {
            if (op.data.length > 0) {
                const items = (op.data as any[]).map((item: any) => op.mapFn(item))
                try {
                    await withRetry(
                        async () => {
                            const { error } = await supabase.from(op.table).upsert(items, { onConflict: op.onConflict })
                            if (error) throw error
                        },
                        {
                            maxRetries: 3,
                            delayMs: 1000,
                            backoff: 'exponential',
                            context: `Push ${op.name}`
                        }
                    )
                    logger.info(`Sync Success: ${op.name}`, { count: items.length })
                } catch (error: any) {
                    logger.error(`Sync Critical Error: ${op.name}`, { error: error.message })
                }
            }
        }
    },

    /**
     * Pulls remote data to local storage (Restore/Sync)
     */
    async pullRemoteToLocal(userId: string) {
        logger.info('Sync: Pulling remote data to local...', { userId })

        const tables = [
            { name: 'daily_checks', saveFn: (p: any) => storage.saveDailyCheck(p) },
            { name: 'weekly_plans', saveFn: (p: any) => storage.saveWeeklyPlan(p) },
            { name: 'impact_logs', saveFn: (p: any) => storage.saveImpactLog(p) },
            { name: 'dismissed_alerts', saveFn: (p: any) => storage.dismissAlert(p.alert_id), select: 'alert_id' },
            { name: 'anchor_metrics', saveFn: (p: any) => storage.saveAnchorMetric(p) },
            { name: 'metric_entries', saveFn: (p: any) => storage.saveMetricEntry(p) }
        ]

        for (const table of tables) {
            try {
                await withRetry(
                    async () => {
                        const { data, error } = await supabase.from(table.name).select(table.select || 'payload')
                        if (error) throw error
                        if (data) {
                            data.forEach((row: any) => table.saveFn(table.select ? row : row.payload))
                        }
                    },
                    {
                        maxRetries: 3,
                        delayMs: 1000,
                        backoff: 'exponential',
                        context: `Pull ${table.name}`
                    }
                )
                logger.info(`Sync Pull Success: ${table.name}`)
            } catch (error: any) {
                logger.error(`Sync Pull Critical Error: ${table.name}`, { error: error.message })
            }
        }
    }
}
