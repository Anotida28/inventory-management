/**
 * Hardcoded Admin User for Internal System
 * No authentication required - direct access
 */


export const SEEDED_USERS = [
  {
    id: 1,
    username: "sales",
    password: "sales123", // seeded password
    firstName: "Sales",
    lastName: "User",
    email: "sales@omacard.internal",
    role: "SALES" as const,
    isActive: true,
  },
  {
    id: 2,
    username: "finance",
    password: "finance123", // seeded password
    firstName: "Finance",
    lastName: "User",
    email: "finance@omacard.internal",
    role: "FINANCE" as const,
    isActive: true,
  },
];

export function getSeededUser(username: string, password: string) {
  return SEEDED_USERS.find(
    (u) => u.username === username && u.password === password && u.isActive
  );
}

/**
 * Returns the hardcoded admin user
 * No authentication checks - for internal use only
 */

  // Default to sales user for compatibility
  export function getAdminUser() {
    // Optionally, you can add an admin user here if needed
    // Example:
    // return { id: 3, username: "admin", password: "admin123", firstName: "Admin", lastName: "User", email: "admin@omacard.internal", role: "ADMIN", isActive: true };
    return SEEDED_USERS[0];
  }

/**
 * Get seeded user ID for API calls (default: sales)
 */
export function getAdminUserId() {
  return SEEDED_USERS[0].id;
}
