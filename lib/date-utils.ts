import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Format date in Portuguese
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ptBR });
}

// Get today's date in ISO format
export function getTodayISO(): string {
    return format(new Date(), 'yyyy-MM-dd');
}

// Get current week start (Monday)
export function getCurrentWeekStart(): string {
    return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

// Get current week end (Sunday)
export function getCurrentWeekEnd(): string {
    return format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

// Get week start for a given date
export function getWeekStart(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(startOfWeek(dateObj, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

// Get next week start
export function getNextWeekStart(currentWeekStart: string): string {
    return format(addWeeks(parseISO(currentWeekStart), 1), 'yyyy-MM-dd');
}

// Get previous week start
export function getPreviousWeekStart(currentWeekStart: string): string {
    return format(subWeeks(parseISO(currentWeekStart), 1), 'yyyy-MM-dd');
}

// Format week range for display
export function formatWeekRange(weekStart: string): string {
    const start = parseISO(weekStart);
    const end = endOfWeek(start, { weekStartsOn: 1 });

    return `${format(start, 'd MMM', { locale: ptBR })} - ${format(end, 'd MMM yyyy', { locale: ptBR })}`;
}

// Check if a date is today
export function isDateToday(date: string): boolean {
    return isToday(parseISO(date));
}

// Get relative time description
export function getRelativeTime(date: string): string {
    const dateObj = parseISO(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'agora mesmo';
    if (diffInHours < 24) return `há ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'ontem';
    if (diffInDays < 7) return `há ${diffInDays} dias`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return 'há 1 semana';
    if (diffInWeeks < 4) return `há ${diffInWeeks} semanas`;

    return formatDate(dateObj, 'dd/MM/yyyy');
}

// Get current time
export function getCurrentTime(): string {
    return format(new Date(), 'HH:mm');
}

// Get greeting based on time of day
export function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
}
