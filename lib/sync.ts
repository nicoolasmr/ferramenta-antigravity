
import { createClient } from '@/lib/supabase/client'
import { storage } from '@/lib/storage'
import { getTodayISO, getCurrentWeekStart } from '@/lib/date-utils'

const supabase = createClient()

export const syncEngine = {
    /**
     * Pushes all local data to Supabase (Backup)
     */
    async pushLocalToRemote(userId: string) {
        console.log('Sync: Pushing local data to remote...')

        // 1. Daily Checks
        const checks = storage.getDailyChecks()
        if (checks.length > 0) {
            const items = checks.map(item => ({
                user_id: userId,
                date: item.date,
                payload: item,
                updated_at: new Date().toISOString()
            }))

            const { error } = await supabase.from('daily_checks').upsert(items, { onConflict: 'user_id, date' })
            if (error) console.error('Sync Error (Checks):', error)
        }

        // 2. Weekly Plans
        const plans = storage.getWeeklyPlans()
        if (plans.length > 0) {
            const items = plans.map(item => ({
                user_id: userId,
                week_start: item.weekStart,
                payload: item,
                updated_at: new Date().toISOString()
            }))

            const { error } = await supabase.from('weekly_plans').upsert(items, { onConflict: 'user_id, week_start' })
            if (error) console.error('Sync Error (Plans):', error)
        }

        // 3. Impact Logs
        const logs = storage.getImpactLogs()
        if (logs.length > 0) {
            const items = logs.map(item => ({
                user_id: userId,
                date: item.date,
                payload: item,
                updated_at: new Date().toISOString()
            }))

            const { error } = await supabase.from('impact_logs').upsert(items, { onConflict: 'user_id, date' })
            if (error) console.error('Sync Error (Impact):', error)
        }

        // 4. Dismissed Alerts
        const dismissed = storage.getDismissedAlerts()
        if (dismissed.length > 0) {
            const items = dismissed.map(id => ({
                user_id: userId,
                alert_id: id,
                dismissed_at: new Date().toISOString() // Approximate, we don't store time locally
            }))
            const { error } = await supabase.from('dismissed_alerts').upsert(items, { onConflict: 'user_id, alert_id' })
            if (error) console.error('Sync Error (Alerts):', error)
        }

        // 5. Anchor Metrics (NEW)
        const metrics = storage.getAnchorMetrics()
        if (metrics.length > 0) {
            const items = metrics.map(item => ({
                id: item.id,
                user_id: userId,
                payload: item,
                updated_at: item.createdAt || new Date().toISOString()
            }))
            const { error } = await supabase.from('anchor_metrics').upsert(items, { onConflict: 'user_id, id' })
            if (error) console.error('Sync Error (Anchor Metrics):', error)
        }

        // 6. Metric Entries (NEW)
        const entries = storage.getMetricEntries()
        if (entries.length > 0) {
            const items = entries.map(item => ({
                user_id: userId,
                date: item.date,
                metric_id: item.metricId,
                payload: item,
                updated_at: item.updatedAt || new Date().toISOString()
            }))
            const { error } = await supabase.from('metric_entries').upsert(items, { onConflict: 'user_id, metric_id, date' })
            if (error) console.error('Sync Error (Metric Entries):', error)
        }
    },

    /**
     * Pulls remote data to local storage (Restore/Sync)
     * Strategy: Overwrite local if remote exists? Or merge?
     * For simplicity V1: Supabase allows fetching all. We will fetch and update local if not present or just upsert.
     * "Latest wins" strategy is best but we don't track updated_at locally well. 
     * We will blindly trust Supabase as single source of truth for "Sync Now".
     */
    async pullRemoteToLocal(userId: string) {
        console.log('Sync: Pulling remote data to local...')

        // 1. Daily Checks
        const { data: checks } = await supabase.from('daily_checks').select('payload')
        if (checks) {
            checks.forEach((row: any) => storage.saveDailyCheck(row.payload))
        }

        // 2. Weekly Plans
        const { data: plans } = await supabase.from('weekly_plans').select('payload')
        if (plans) {
            plans.forEach((row: any) => storage.saveWeeklyPlan(row.payload))
        }

        // 3. Impact Logs
        const { data: logs } = await supabase.from('impact_logs').select('payload')
        if (logs) {
            logs.forEach((row: any) => storage.saveImpactLog(row.payload))
        }

        // 4. Dismissed Alerts
        const { data: alerts } = await supabase.from('dismissed_alerts').select('alert_id')
        if (alerts) {
            alerts.forEach((row: any) => storage.dismissAlert(row.alert_id))
        }

        // 5. Anchor Metrics (NEW)
        const { data: metrics } = await supabase.from('anchor_metrics').select('payload')
        if (metrics) {
            metrics.forEach((row: any) => storage.saveAnchorMetric(row.payload))
        }

        // 6. Metric Entries (NEW)
        const { data: entries } = await supabase.from('metric_entries').select('payload')
        if (entries) {
            entries.forEach((row: any) => storage.saveMetricEntry(row.payload))
        }
    }
}
