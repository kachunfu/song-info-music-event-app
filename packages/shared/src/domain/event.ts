/**
 * Core domain entity — represents a music event.
 * Framework-independent. No API or DB concerns.
 */
export interface MusicEvent {
  id: string
  name: string
  artist: string
  date: string
  venue: string
  ticketUrl?: string
  imageUrl?: string
}
