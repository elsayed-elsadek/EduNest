/**
 * Utility functions for JWT token handling
 */

/**
 * Safely decodes a Base64URL JWT payload and returns UTF-8 text.
 * This fixes issues where Arabic (or other non-ASCII) characters
 * appear كمجموعة رموز غريبة مثل "Ø§Ù„..." بسبب التعامل الخاطئ مع الترميز.
 */
function decodeBase64UrlUtf8(segment: string): string {
  // 1) تحويل Base64URL إلى Base64 عادي
  let base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }

  const binary = atob(base64);

  // 2) تحويل السلسلة الثنائية (bytes 0–255) إلى نص UTF‑8 صحيح
  try {
    const percentEncoded = binary
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("");
    return decodeURIComponent(percentEncoded);
  } catch {
    // في حالة حدوث خطأ غير متوقع، نرجع القيمة الخام بدلاً من كسر التطبيق
    return binary;
  }
}

/**
 * Decodes a JWT token and extracts the payload
 * @param token The JWT token string
 * @returns The decoded payload or null if invalid
 */
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decodedJson = decodeBase64UrlUtf8(parts[1]);
    return JSON.parse(decodedJson);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

/**
 * Extracts the first name from a JWT token
 * @param token The JWT token string
 * @returns The first name or empty string if not found
 */
export function getFirstNameFromToken(token: string): string {
  const payload = decodeToken(token);
  if (!payload) return "";
  
  // Try common field names for the name
  const firstName =
    (payload.firstName ? String(payload.firstName) : "") ||
    (payload.first_name ? String(payload.first_name) : "") ||
    (payload.name ? String(payload.name) : "") ||
    (payload.fullName ? String(payload.fullName) : "") ||
    (payload.full_name ? String(payload.full_name) : "") ||
    "";
  
  // Return just the first word if it's a full name
  return firstName.trim().split(/\s+/)[0] || "";
}

/**
 * Extracts the user role from a JWT token
 * @param token The JWT token string
 * @returns The user role or empty string if not found
 */
export function getRoleFromToken(token: string): string {
  const payload = decodeToken(token);
  if (!payload) return "";

  // Extract role from authorities field (supports both string and array formats)
  const authorities = payload.authorities;
  if (typeof authorities === 'string') {
    return authorities;
  }
  if (Array.isArray(authorities) && authorities.length > 0) {
    return String(authorities[0]);
  }

  // Fallback to other common role fields
  return String(payload.role || payload.userRole || payload.authority || "");
}

/**
 * Extracts user information from a JWT token
 * @param token The JWT token string
 * @returns User information object
 */
export function getUserFromToken(token: string): {
  username: string;
  fullName: string;
  role: string;
  email?: string;
} | null {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    username: String(payload.username || payload.sub || ""),
    fullName: String(payload.fullName || payload.name || ""),
    role: getRoleFromToken(token),
    email: payload.username && typeof payload.username === 'string' && payload.username.includes('@') ? payload.username : undefined,
  };
}

/**
 * Extracts the first name from a user object
 * @param user The user object
 * @returns The first name or empty string if not found
 */
export function getFirstNameFromUser(
  user: Record<string, unknown> | undefined
): string {
  if (!user || typeof user !== "object") return "";

  const firstName =
    (user.firstName ? String(user.firstName) : "") ||
    (user.first_name ? String(user.first_name) : "") ||
    (user.name ? String(user.name) : "") ||
    (user.fullName ? String(user.fullName) : "") ||
    (user.full_name ? String(user.full_name) : "") ||
    "";

  // Return just the first word if it's a full name
  return firstName.trim().split(/\s+/)[0] || "";
}
