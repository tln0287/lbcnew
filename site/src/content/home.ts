/**
 * Home page content. Every fact below comes from lbc.edu.in / lbc.edu.in/pghome
 * (see CONTENT_AUDIT.md). Edit here, not in the section components.
 */
import { ugStrength, pgIntake } from './departments'
import { off, pgFacilities, ugFacilities } from './site'

export const FOUNDED = 1973

/** Fact ribbon — short, verifiable statements. */
export const ribbonFacts = [
  'Established 1973',
  'Society for Collegiate Education',
  'Affiliated to Andhra University',
  'Accredited by NAAC',
  'MBA & MCA approved by AICTE',
  '10-acre campus in Visakhapatnam',
  'PG College since 1994',
  'Skill Development Centre since 2011',
  'Golden Jubilee celebrated',
]

/* ---------------------------------------------------- programmes explorer */

const ugSeats = (slug: string) => {
  const c = ugStrength.find((x) => x.slug === slug)!
  return c.total ?? c.subjects.reduce((a, [, n]) => a + n, 0)
}
const pgSeats = pgIntake.reduce((a, r) => a + r.convener + r.management, 0)

export type ExplorerItem = {
  code: string
  name: string
  sub: string
  seats: number
  description: string
  chipsLabel: string
  chips: string[]
  to: string
}

export const explorer: ExplorerItem[] = [
  {
    code: 'B.Sc.',
    name: 'B.Sc. (Honours)',
    sub: 'Degree College · since 1988 · 4 years, 8 semesters',
    seats: ugSeats('bsc'),
    description: 'A solid foundation in the sciences, with laboratory work prioritised for every domain paper.',
    chipsLabel: 'Majors',
    chips: ugStrength.find((x) => x.slug === 'bsc')!.subjects.map(([s]) => s),
    to: '/courses/ug/bsc',
  },
  {
    code: 'B.A.',
    name: 'B.A. (Honours)',
    sub: 'Degree College · since 1988 · 4 years, 8 semesters',
    seats: ugSeats('ba'),
    description: 'Social sciences and humanities preparing students for law, journalism, civil services and research.',
    chipsLabel: 'Majors',
    chips: ugStrength.find((x) => x.slug === 'ba')!.subjects.map(([s]) => s),
    to: '/courses/ug/ba',
  },
  {
    code: 'B.Com.',
    name: 'B.Com. (Honours)',
    sub: 'Degree College · since 1973 · 4 years, 8 semesters',
    seats: ugSeats('bcom'),
    description: 'The programme the college began with in 1973, covering trade, accounting and business practice.',
    chipsLabel: 'Areas of study',
    chips: ['Financial accounting', 'Income tax', 'Business laws', 'Banking', 'Cost accounting', 'Auditing'],
    to: '/courses/ug/bcom',
  },
  {
    code: 'BBA',
    name: 'BBA (Honours)',
    sub: 'Degree College · since 1992 · 4 years, 8 semesters',
    seats: ugSeats('bba'),
    description: 'Managerial skills, work ethics and leadership, with a Harvard Business Review case study discussed in class each week.',
    chipsLabel: 'Add-on courses',
    chips: ['Six Sigma', 'Emotional Intelligence at Work', 'Business Etiquette', 'Financial Derivatives'],
    to: '/courses/ug/bba',
  },
  {
    code: 'PG',
    name: 'PG College',
    sub: 'Since 1994 · 10 departments · 2 years, 4 semesters',
    seats: pgSeats,
    description: 'Career-oriented master’s programmes affiliated to Andhra University, with MBA and MCA approved by AICTE.',
    chipsLabel: 'Courses',
    chips: ['MBA', 'MCA', 'M.Sc. CS', 'Mathematics', 'Chemistry', 'Biochemistry', 'Biotechnology', 'Microbiology', 'English', 'M.Com.', 'HRM'],
    to: '/pg-college',
  },
]
export const totalSeats = explorer.reduce((a, i) => a + i.seats, 0)

export const admissionSteps = [
  {
    title: 'Undergraduate admission',
    text: 'Through the Online Admissions Module for Degree Colleges (OAMDC) of the Andhra Pradesh State Council of Higher Education.',
    icon: 'form',
  },
  {
    title: 'Postgraduate admission',
    text: 'Science graduates with a qualifying APPGCET rank; Arts and Commerce graduates for English and Commerce respectively.',
    icon: 'cap',
  },
  {
    title: 'MBA admission',
    text: 'Graduates in any discipline qualifying through APICET, the State Integrated Common Entrance Test.',
    icon: 'briefcase',
  },
]

/* ----------------------------------------------------------- facilities */

export const facilitySlides = [
  { name: 'Library', line: 'Degree College library, Block 4', image: ugFacilities[7].images[0] },
  { name: 'Chemistry lab', line: 'Science laboratories, Block 1', image: ugFacilities[2].images[1] },
  { name: 'Seminar hall', line: 'PG College', image: pgFacilities[0].image },
  { name: 'Computer lab', line: 'Degree College, Block 9', image: ugFacilities[4].images[0] },
  { name: 'Sports', line: 'Ground and playfields', image: pgFacilities[1].image },
  { name: 'Botany lab', line: 'Science laboratories, Block 1', image: ugFacilities[1].images[1] },
  { name: 'Labs', line: 'PG College computer lab', image: pgFacilities[2].image },
  { name: 'Biotechnology lab', line: 'Science laboratories, Block 1', image: ugFacilities[0].images[0] },
  { name: 'Library', line: 'PG College library', image: pgFacilities[3].image },
  { name: 'Zoology lab', line: 'Science laboratories, Block 1', image: ugFacilities[3].images[1] },
  { name: 'Psychology lab', line: 'Degree College, Block 4', image: ugFacilities[5].images[0] },
  { name: 'Canteen', line: 'PG College', image: pgFacilities[4].image },
]

/* ----------------------------------------------------------- activities */

export const activityPanels = [
  {
    title: 'Sports',
    icon: 'trophy',
    image: '/img/media/jrcollege/gallery/1521098234_15172259953.webp',
    alt: 'LBC cricket team with the Eenadu Cricket Tournament trophy',
    summary: 'Coaching for state and national-level competition. LBC students won the overall team championships at the AU inter-college weightlifting, powerlifting and best physique meet hosted on campus.',
    to: '/activities#sports',
  },
  {
    title: 'Bharat Scouts & Guides',
    icon: 'compass',
    image: '/img/static/skill/b3.webp',
    alt: 'Bharat Scouts & Guides unit of LBC in uniform',
    summary: 'A unit established in 2023 with 110 seats in 5 units, led by Ranger and Rover leaders.',
    to: '/activities/bharat-scouts-guides',
  },
  {
    title: 'Skill Development Centre',
    icon: 'lightbulb',
    image: '/img/static/skill/sd1.webp',
    alt: 'Guests and staff at the opening of an employability skills workshop',
    summary: 'Book reviews, employability and résumé workshops, career planning and mock interviews.',
    to: '/academics/skill-development',
  },
  {
    title: 'NCC & NSS',
    icon: 'flag',
    image: '',
    alt: '',
    summary: 'NCC cadets distinguish themselves in events and competitions; NSS volunteers contribute to community and social work.',
    to: '/activities#ncc',
  },
]

/* ------------------------------------------------------------- alumni */

export const alumniProgrammes = ['B.Sc.', 'B.A.', 'B.Com.', 'BBA', 'MBA', 'MCA', 'M.Sc.', 'M.A. English', 'M.Com.', 'MHRM']
export const alumniJoinUrl = off('/ugcollege/alumni')
export const alumniSteps = [
  { title: 'Open the alumni form', text: 'The Alumni Association form is on the official college website.' },
  { title: 'Share your details', text: 'Your name, stream, year of joining, contact details, organisation and designation.' },
  { title: 'Stay connected', text: 'Submit the form so the college can keep in touch with you, and add any comments or feedback.' },
]

/* --------------------------------------------------------------- blog */

export const blogPost = {
  title: 'How is Python the most popular & secure programming language for software application development',
  date: 'July 14, 2023',
  tags: ['Education', 'Software'],
  minutes: 10, // ~2,000 words
  summary:
    'People who went to school in the late 1990s and learned about computers as a new subject remember LOGO and Basic as the simplest languages. Following the Web boom, there was a rise in demand for programmers…',
  image: '/img/media/blog/python_blog_BE44oZw.webp',
  href: off('/pgcollege/pgblog'),
}
