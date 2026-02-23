import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Formatea un RUT chileno al formato estándar (ej: 5.911.604-5)
 * @param id - El número del RUT sin dígito verificador
 * @param dv - El dígito verificador
 * @returns RUT formateado (ej: "5.911.604-5")
 */
export function formatRUT(id: string | number, dv: string): string {
  if (!id) return '';
  if (!dv) return id.toString();

  // Convertir a string y limpiar
  const idStr = id.toString().replace(/\./g, '').replace(/-/g, '');
  const dvClean = dv.toString().toUpperCase();

  // Formatear el número con puntos cada 3 dígitos de derecha a izquierda
  const reversed = idStr.split('').reverse().join('');
  const formattedReversed = reversed.replace(/(\d{3})(?=\d)/g, '$1.');
  const formattedId = formattedReversed.split('').reverse().join('');

  return `${formattedId}-${dvClean}`;
}

/**
 * Formatea un monto en pesos chilenos (CLP)
 * @param amount - El monto a formatear
 * @returns Monto formateado en formato chileno (ej: "$1.500.000")
 */
export function formatCLP(amount: string | number | undefined | null): string {
  if (amount === undefined || amount === null) return '$0';

  // Convertir a número
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return '$0';

  // Formatear con puntos como separadores de miles
  return '$' + numAmount.toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}