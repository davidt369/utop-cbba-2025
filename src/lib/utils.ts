import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  try {
    let dateObj: Date;

    if (typeof date === "string") {
      // Si es una fecha en formato YYYY-MM-DD, crear la fecha usando los componentes para evitar problemas de zona horaria
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split("-").map(Number);
        dateObj = new Date(year, month - 1, day); // month es 0-based en JavaScript
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }

    return format(dateObj, "dd/MM/yyyy", { locale: es });
  } catch (error) {
    return "Fecha inválida";
  }
}

export function formatDateTime(date: string | Date): string {
  try {
    let dateObj: Date;

    if (typeof date === "string") {
      // Si es una fecha en formato YYYY-MM-DD, crear la fecha usando los componentes para evitar problemas de zona horaria
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split("-").map(Number);
        dateObj = new Date(year, month - 1, day, 12, 0, 0); // month es 0-based, establecer a mediodía
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }

    return format(dateObj, "dd/MM/yyyy HH:mm", { locale: es });
  } catch (error) {
    return "Fecha inválida";
  }
}

export function formatDuration(seconds?: number | null): string {
  if (seconds === null || seconds === undefined) return "-";
  const s = Number(seconds);
  if (!isFinite(s) || s <= 0) return "-";

  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const hh = `${hrs}`;
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}
