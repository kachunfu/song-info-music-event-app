/**
 * Core domain entity — represents a user in the system.
 * Framework-independent. No API or DB concerns.
 */
export interface User {
  id: number
  email: string
}
