/** Photo albums used by the home gallery and the gallery page (all official LBC images). */
import { achievers, jubileeBanners, pgFacilities, ugFacilities } from './site'

export type Photo = { src: string; alt: string; album: string }

export const albums: Photo[] = [
  ...jubileeBanners.map((b) => ({ src: b.image, alt: b.alt, album: 'Golden Jubilee' })),
  ...achievers.map((b) => ({ src: b.image, alt: b.alt, album: 'Achievements' })),
  { src: '/img/media/jrcollege/gallery/1521098234_15172259953.webp', alt: 'LBC cricket team — Eenadu Cricket Tournament Champions, AP & Telangana', album: 'Sports' },
  { src: '/img/media/jrcolleg/news/6.webp', alt: 'AU Inter-College Weightlifting, Powerlifting and Best Physique Championship hosted at LBC', album: 'Sports' },
  { src: '/img/static/skill/b1.webp', alt: 'Bharat Scouts & Guides marching on the LBC ground', album: 'Scouts & Guides' },
  { src: '/img/static/skill/b3.webp', alt: 'Bharat Scouts & Guides unit with staff', album: 'Scouts & Guides' },
  { src: '/img/static/skill/b4.webp', alt: 'Bharat Scouts & Guides unit outdoors', album: 'Scouts & Guides' },
  ...pgFacilities.map((f) => ({ src: f.image, alt: `${f.name}, PG College`, album: 'Campus' })),
  ...ugFacilities.flatMap((f) => f.images.map((src, i) => ({ src, alt: `${f.name}, Degree College${f.images.length > 1 ? ` (${i + 1})` : ''}`, album: 'Labs & library' }))),
  ...Array.from({ length: 31 }, (_, i) => ({ src: `/img/static/skill/sd${i + 1}.webp`, alt: `Skill Development Centre session ${i + 1}`, album: 'Skill Development' })),
]

/** Interleave albums so the first screen shows variety. */
export const mixed: Photo[] = (() => {
  const by = new Map<string, Photo[]>()
  for (const p of albums) by.set(p.album, [...(by.get(p.album) ?? []), p])
  const lists = [...by.values()]
  const out: Photo[] = []
  for (let i = 0; out.length < albums.length; i++) for (const l of lists) if (l[i]) out.push(l[i])
  return out
})()
