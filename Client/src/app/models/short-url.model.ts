/** Envelope every Spring endpoint returns (see CustomizedResponse.java). */
export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  statusCode: number;
  data: T;
  token?: string;
  expiresInSec?: number;
}

/** Raw shape of a ShortUrl row as serialised by the backend. */
export interface ShortUrlDto {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt?: string | number[] | null;
  expirationTime?: string | number[] | null;
  isActive?: boolean | null;
  active?: boolean | null;
  clickCount?: number | null;
  role?: string | null;
}

/** Normalised view-model the UI actually renders. */
export interface LinkRecord {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: Date | null;
  expirationDate: Date | null;
  clicks: number;
  active: boolean;
  /** Derived: expired links are inactive regardless of the flag. */
  status: LinkStatus;
  /** Hostname of the destination, used for the favicon and grouping. */
  domain: string;
}

export type LinkStatus = 'active' | 'expired' | 'paused';

export interface CreateLinkRequest {
  longUrl: string;
  customAlias?: string | null;
  expirationTime?: string | null;
  isActive: boolean;
  userId: number | null;
}

/**
 * Jackson serialises LocalDateTime either as an ISO string or as a
 * [y, m, d, h, min, s, nano] tuple depending on config, so handle both.
 */
export function parseBackendDate(value: string | number[] | null | undefined): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    if (year === undefined || month === undefined || day === undefined) {
      return null;
    }
    return new Date(year, month - 1, day, hour, minute, second);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Maps a backend row into the normalised record the UI binds to. */
export function toLinkRecord(dto: ShortUrlDto): LinkRecord {
  const expirationDate = parseBackendDate(dto.expirationTime);
  const active = dto.isActive ?? dto.active ?? true;
  const expired = expirationDate !== null && expirationDate.getTime() < Date.now();

  return {
    id: dto.id,
    shortCode: dto.shortCode,
    shortUrl: dto.shortUrl ?? '',
    originalUrl: dto.originalUrl,
    createdAt: parseBackendDate(dto.createdAt),
    expirationDate,
    clicks: dto.clickCount ?? 0,
    active,
    status: expired ? 'expired' : active ? 'active' : 'paused',
    domain: hostnameOf(dto.originalUrl),
  };
}
