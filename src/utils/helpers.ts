// utility helpers shared across the frontend

/**
 * Format a date or datetime value into a string that matches the backend
 * expectation (YYYY-MM-DD HH:mm:ss) using the local timezone. The API
 * previously accepted ISO strings but the server now wants the space-separated
 * format without milliseconds or timezone suffix.
 */
export function formatDateTimeLocal(input: string | Date): string {
    const d = new Date(input);
    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hour = pad(d.getHours());
    const minute = pad(d.getMinutes());
    const second = pad(d.getSeconds());

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
