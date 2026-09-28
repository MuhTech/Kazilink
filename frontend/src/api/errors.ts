  import axios from "axios";

  export function errorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    }
    return fallback;
  }