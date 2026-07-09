// Photos live in /public/photos/<category>/<name>.jpg. We pick a file by matching
// a keyword in the item (bike/car model, or place) — falling back to <category>/default.jpg,
// and PhotoTile falls back to a gradient if even that is missing. So new photos "just work"
// once named per the convention below; missing ones degrade gracefully.
//
//   bikes/   himalayan, classic-350, bullet-350, meteor-350, ktm-adventure, xpulse, default
//   cars/    innova-crysta, innova, xylo, scorpio, ertiga, van, tempo, default
//   stays/   leh, nubra, pangong, zanskar, turtuk, default        (by location)
//   places/  leh, nubra, pangong, zanskar, turtuk, default        (trip routes / banner)
//   experiences/  camel-safari, rafting, monastery, atv, photography, default
import type { Listing, TripPackage } from './types'

// keyword found in the title → filename (first match wins; order matters)
const BIKE_MAP: [string, string][] = [
  ['himalayan', 'himalayan'],
  ['classic', 'classic-350'],
  ['bullet', 'bullet-350'],
  ['meteor', 'meteor-350'],
  ['ktm', 'ktm-adventure'],
  ['xpulse', 'xpulse'],
]
const CAR_MAP: [string, string][] = [
  ['crysta', 'innova-crysta'],
  ['innova', 'innova'],
  ['xylo', 'xylo'],
  ['scorpio', 'scorpio'],
  ['ertiga', 'ertiga'],
  ['tempo', 'tempo'],
  ['traveller', 'tempo'],
  ['van', 'van'],
]
const EXPERIENCE_MAP: [string, string][] = [
  ['camel', 'camel-safari'],
  ['raft', 'rafting'],
  ['monastery', 'monastery'],
  ['atv', 'atv'],
  ['photograph', 'photography'],
]
const PLACES = ['leh', 'nubra', 'pangong', 'zanskar', 'turtuk']

function byKeyword(map: [string, string][], text: string, folder: string): string {
  const t = text.toLowerCase()
  const hit = map.find(([kw]) => t.includes(kw))
  return `/photos/${folder}/${hit ? hit[1] : 'default'}.jpg`
}
function byPlace(text: string, folder: string): string {
  const t = text.toLowerCase()
  const hit = PLACES.find((p) => t.includes(p))
  return `/photos/${folder}/${hit ?? 'default'}.jpg`
}

export function listingPhoto(l: Listing): string {
  switch (l.type) {
    case 'BIKE':
      return byKeyword(BIKE_MAP, l.title, 'bikes')
    case 'CAR':
      return byKeyword(CAR_MAP, l.title, 'cars')
    case 'HOTEL':
    case 'HOMESTAY':
      return byPlace(l.location, 'stays')
    case 'EXPERIENCE':
      return byKeyword(EXPERIENCE_MAP, l.title, 'experiences')
    default:
      return byPlace(l.location, 'places')
  }
}

export function tripPhoto(t: TripPackage): string {
  return byPlace(t.route, 'places')
}

export function placePhoto(destination: string): string {
  return byPlace(destination || 'ladakh', 'places')
}
