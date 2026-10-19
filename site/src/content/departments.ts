/**
 * UG department directory — transcribed from the official category pages
 * https://lbc.edu.in/ugcollege/depts (Physical Sciences, Life Sciences, Arts,
 * Commerce, Management, Languages). "honours" lists the courses offered as per
 * the revised APSCHE syllabus (2023-24); "combinations" lists the earlier
 * subject combinations shown on the same pages.
 */
import { off } from './site'

export type Category = {
  id: string
  name: string
  official: string
  image: string
  combinations: string[]
  programme?: string // internal programme route
}

export type Department = {
  name: string
  category: string
  honours?: string
  outcomes?: string // PO/CO PDF
  facultyGroup?: string // matches faculty.json "group"
  lab?: string
}

export const categories: Category[] = [
  {
    id: 'physical',
    name: 'Physical Sciences',
    official: off('/ugcollege/physical'),
    image: '/img/media/jrcollege/news/chemestry_lab1-_block-1.webp',
    programme: '/courses/ug/bsc',
    combinations: [
      'B.Sc. – Maths – Physics – Chemistry',
      'B.Sc. – Maths – Physics – Computer Science',
      'B.Sc. – Maths – Electronics – Computer Science',
      'B.Sc. – Maths – Physics – Electronics',
      'B.Sc. – Maths – Statistics – Computer Science',
    ],
  },
  {
    id: 'life',
    name: 'Life Sciences',
    official: off('/ugcollege/Lifesciences'),
    image: '/img/media/jrcollege/news/block-1_botony_lab-2.webp',
    programme: '/courses/ug/bsc',
    combinations: ['B.Sc. – Chemistry – Botany – Zoology', 'B.Sc. – Chemistry – Microbiology – Biotechnology'],
  },
  {
    id: 'arts',
    name: 'Arts',
    official: off('/ugcollege/Arts'),
    image: '/img/media/jrcollege/news/psycology_lab_block-4.webp',
    programme: '/courses/ug/ba',
    combinations: [
      'B.A. – History – Economics – Politics',
      'B.A. – History – Geography – Travel and Tourism',
      'B.A. – Special Telugu – Politics – Public Administration',
      'B.A. – History – Economics – Geography',
      'B.A. – Special English – Psychology – Journalism',
    ],
  },
  {
    id: 'commerce',
    name: 'Commerce',
    official: off('/ugcollege/Commerce'),
    image: '/img/media/jrcollege/news/library_3_block-5.webp',
    programme: '/courses/ug/bcom',
    combinations: ['Bachelor of Commerce'],
  },
  {
    id: 'management',
    name: 'Management',
    official: off('/ugcollege/Management'),
    image: '/img/media/jrcollege/news/block-9_computer_lab-2.webp',
    programme: '/courses/ug/bba',
    combinations: ['Bachelor of Business Administration'],
  },
  {
    id: 'languages',
    name: 'Languages',
    official: off('/ugcollege/Languages'),
    image: '/img/media/jrcollege/news/labrary1_block-4.webp',
    combinations: [],
  },
]

const P = (f: string) => off(`/media/project_internship/${f}`)

export const ugDepartments: Department[] = [
  { name: 'Mathematics', category: 'physical', honours: 'B.Sc. (Honours) Mathematics', outcomes: P('Department_of_Mathematics__POs__COS.pdf'), facultyGroup: 'Mathematics' },
  { name: 'Physics', category: 'physical', honours: 'B.Sc. (Honours) Physics', outcomes: P('POS_and_cos_UG-_Physics.pdf'), facultyGroup: 'Physics', lab: '3 Physics labs · 3 Electronics labs' },
  { name: 'Chemistry', category: 'physical', honours: 'B.Sc. (Honours) Chemistry', outcomes: P('Course_Outcomes_Department_Of_Chemistry_.pdf'), facultyGroup: 'Chemistry', lab: '4 Chemistry labs' },
  { name: 'Computer Science', category: 'physical', honours: 'B.Sc. (Honours) Computer Science', outcomes: P('POS_and_COS_UG-_Computerscience_mgkRQyg.pdf'), facultyGroup: 'Computer Science & Data Science', lab: 'Computer labs, Block 9' },
  { name: 'Data Science', category: 'physical', honours: 'B.Sc. (Honours) Data Science', outcomes: P('COS_of_Data_science.pdf'), facultyGroup: 'Computer Science & Data Science' },
  { name: 'Electronics', category: 'physical' },
  { name: 'Statistics', category: 'physical' },
  { name: 'Botany', category: 'life', honours: 'B.Sc. (Honours) Botany', outcomes: P('BOTANY.pdf'), facultyGroup: 'Botany', lab: '1 Botany lab' },
  { name: 'Zoology', category: 'life', honours: 'B.Sc. (Honours) Zoology', outcomes: P('Zoology__POS_and_COS.pdf'), facultyGroup: 'Zoology', lab: '1 Zoology lab' },
  { name: 'Microbiology', category: 'life', honours: 'B.Sc. (Honours) Microbiology', outcomes: P('MICROBIOLOGY_MAJOR_OUTCOMES.pdf'), facultyGroup: 'Microbiology', lab: '2 Microbiology labs' },
  { name: 'Biotechnology', category: 'life', honours: 'B.Sc. (Honours) Biotechnology', outcomes: P('UG_-_BIOTECHNOLOGY.pdf'), facultyGroup: 'Biotechnology', lab: '2 Biotechnology labs' },
  { name: 'Aquaculture', category: 'life', honours: 'B.Voc. (Honours) Aquaculture' },
  { name: 'Environmental Science', category: 'life', facultyGroup: 'ENVIRONMENTAL SCIENCES' },
  { name: 'Foundation Courses', category: 'life' },
  { name: 'Political Science', category: 'arts', honours: 'B.A. (Honours) Political Science', outcomes: P('BA_Social_Sciences1.pdf'), facultyGroup: 'B.A. (Social Sciences)' },
  { name: 'History', category: 'arts', honours: 'B.A. (Honours) History', outcomes: P('BA_Social_Sciences1.pdf'), facultyGroup: 'B.A. (Social Sciences)' },
  { name: 'Economics', category: 'arts', honours: 'B.A. (Honours) Economics', outcomes: P('BA_Social_Sciences1.pdf'), facultyGroup: 'B.A. (Social Sciences)' },
  { name: 'Psychology', category: 'arts', honours: 'B.A. (Honours) Psychology', outcomes: P('BA_Social_Sciences1.pdf'), facultyGroup: 'B.A. (Social Sciences)', lab: 'Psychology lab, Block 4' },
  { name: 'Journalism and Mass Communication', category: 'arts', honours: 'B.A. (Honours) Journalism and Mass Communication', outcomes: P('BA_Social_Sciences1.pdf'), facultyGroup: 'B.A. (Social Sciences)' },
  { name: 'Special English', category: 'arts', honours: 'B.A. (Honours) Special English', outcomes: P('BA_Social_Sciences1.pdf'), facultyGroup: 'B.A. (Social Sciences)' },
  { name: 'Geography', category: 'arts' },
  { name: 'Travel and Tourism', category: 'arts' },
  { name: 'Special Telugu', category: 'arts' },
  { name: 'Public Administration', category: 'arts' },
  { name: 'Commerce', category: 'commerce', honours: 'Bachelor of Commerce (Honours) General', outcomes: P('b.com_Poscos.pdf'), facultyGroup: 'B.Com' },
  { name: 'Management (UG)', category: 'management', honours: 'Bachelor of Business Administration (Honours)', outcomes: P('BBA_POS__COS.pdf'), facultyGroup: 'BBA' },
  { name: 'English', category: 'languages' },
  { name: 'Telugu', category: 'languages' },
  { name: 'Hindi', category: 'languages' },
  { name: 'Sanskrit', category: 'languages' },
]

/** PG intake as published on https://lbc.edu.in/pgcollege/profile (convener / management). */
export const pgIntake: { course: string; convener: number; management: number; slug: string }[] = [
  { course: 'Mathematics', convener: 40, management: 8, slug: 'mathematics' },
  { course: 'Computer Science: MCA', convener: 84, management: 36, slug: 'mca' },
  { course: 'Computer Science: M.Sc. (CS)', convener: 40, management: 8, slug: 'computer-science' },
  { course: 'MBA', convener: 84, management: 36, slug: 'mba' },
  { course: 'M.Com', convener: 40, management: 8, slug: 'm-com' },
  { course: 'Micro-Biology', convener: 30, management: 6, slug: 'microbiology' },
  { course: 'Bio-Chemistry', convener: 33, management: 6, slug: 'biochemistry' },
  { course: 'Chemistry Organic', convener: 30, management: 6, slug: 'chemistry' },
  { course: 'Chemistry Analytical', convener: 30, management: 6, slug: 'chemistry' },
  { course: 'Human Resource Management', convener: 40, management: 8, slug: 'human-resource-management' },
  { course: 'English', convener: 40, management: 8, slug: 'english' },
  { course: 'Bio-Technology', convener: 30, management: 6, slug: 'biotechnology' },
]

/** UG sanctioned strength 2023-24, from https://lbc.edu.in/ugcollege/profile */
export const ugStrength: { course: string; slug: string; subjects: [string, number][]; total?: number }[] = [
  {
    course: 'B.Sc. (Hon.)',
    slug: 'bsc',
    subjects: [
      ['Chemistry', 50],
      ['Mathematics', 25],
      ['Physics', 25],
      ['Botany', 25],
      ['Zoology', 25],
      ['Computer Science', 400],
      ['Data Science', 100],
      ['Microbiology', 50],
      ['Biotechnology', 25],
      ['Aquaculture', 25],
    ],
  },
  {
    course: 'B.A. (Hon.)',
    slug: 'ba',
    subjects: [
      ['Economics', 60],
      ['History', 60],
      ['Special English', 30],
      ['Journalism', 30],
      ['Political Science', 60],
      ['Psychology', 60],
    ],
  },
  { course: 'BBA (Hon.)', slug: 'bba', subjects: [], total: 100 },
  { course: 'B.Com. (Hon.)', slug: 'bcom', subjects: [], total: 300 },
]
