export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080',
  /**
   * Until sign-in exists, every link is attributed to this user id.
   * It must match a real row in the `users` table or the API returns
   * "User not found"; set it to null to create anonymous links instead.
   */
  demoUserId: 1 as number | null,
};
