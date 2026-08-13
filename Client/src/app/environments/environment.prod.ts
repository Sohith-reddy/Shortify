export const environment = {
  production: true,
  /**
   * No trailing `/api` here: the ENDPOINTS constants already carry the
   * full `/api/...` path, so adding it would produce `/api/api/...`.
   */
  apiBaseUrl: 'http://localhost:8080',
  demoUserId: 1 as number | null,
};
