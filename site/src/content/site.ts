/**
 * Curated, verified content for the LBC website.
 *
 * Every statement here is taken from https://lbc.edu.in/ or https://lbc.edu.in/pghome
 * (inspected 19 Oct 2026). Large datasets (faculty, committees, NAAC, IQAC,
 * programme pages) are generated into src/data by tools/build_data.py.
 */

export const OFFICIAL = 'https://lbc.edu.in'
/** Documents linked from lbc.edu.in are mirrored into this site (tools/mirror_docs.py). */
const DOC_RE = /\.(pdf|docx?|xlsx?|pptx?|mp4|zip|txt|csv)$/i
const DOC_ALIASES: Record<string, string> = { '/ugcollege/lbctimes': '/ugcollege/lbctimes.pdf', '/pgcollege/lbctimes': '/ugcollege/lbctimes.pdf' }

/** Local URL for a mirrored document, given its path on lbc.edu.in. */
export const doc = (path: string) => `/docs${encodeURI(DOC_ALIASES[path] ?? path).replace(/%25/g, '%')}`

/** Official URL — except documents, which are served from this site. */
export const off = (path: string) => (DOC_RE.test(path) || DOC_ALIASES[path] ? doc(path) : `${OFFICIAL}${path}`)

/** Convert any absolute lbc.edu.in document URL to its local copy. */
export const docUrl = (url: string) => {
  if (!url.startsWith(OFFICIAL)) return url
  const path = decodeURI(url.slice(OFFICIAL.length))
  return DOC_RE.test(path) || DOC_ALIASES[path] ? doc(path) : url
}

export const PAYMENT_URL = 'https://formbuilder.ccavenue.com/live/the-society-for-collegiate-education'

export const college = {
  name: 'Dr. Lankapalli Bullayya College',
  short: 'LBC',
  sponsor: 'Sponsored by The Society for Collegiate Education',
  approval: 'Approved by AICTE · Affiliated to Andhra University',
  address: [
    '52-14-75, Survey No: 44',
    'National Highway 16, Near Rama Talkies Rd',
    'Resapuvanipalem, Visakhapatnam',
    'Andhra Pradesh 530013',
  ],
  phone: '0891-2551630',
  email: 'principal@lbc.edu.in',
  geo: { lat: 17.732, lng: 83.315 },
  grievanceEmail: 'grievances@lbc.edu.in',
  grievanceForm: 'https://forms.gle/NjJvy31rReGKi3H66',
  womenHelpline: '8885035592',
  bgvEmail: 'bgv@bullayyacollege.org',
  bgvPhone: '08912701818',
}

export const social = [
  { label: 'Facebook', href: 'https://www.facebook.com/photo/?fbid=125645640549395&set=a.122312454216047' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/feed/update/urn:li:share:7075447324063264768/' },
  { label: 'X (Twitter)', href: 'https://twitter.com/BullayyaDr36166/status/1669681371235880960' },
  { label: 'Instagram', href: 'https://www.instagram.com/p/CtjQ7A8yv7T/?next=%2F' },
]

/* ----------------------------------------------------------------- navigation */

export type NavLink = {
  label: string
  to?: string // internal route
  href?: string // external / official URL
  desc?: string
  icon?: string
  badge?: string
}
export type NavGroup = { title: string; links: NavLink[] }
export type NavItem = NavLink & { groups?: NavGroup[]; feature?: { title: string; text: string; to: string; image: string } }

export const primaryNav: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Profile', to: '/profile' },
  {
    label: 'Faculty',
    to: '/faculty',
    groups: [
      {
        title: 'Degree College',
        links: [
          { label: 'B.A.', to: '/faculty?programme=B.A.', icon: 'landmark', desc: 'Social sciences & humanities' },
          { label: 'BBA', to: '/faculty?programme=BBA', icon: 'briefcase', desc: 'Business administration' },
          { label: 'BCA', to: '/faculty?programme=BCA', icon: 'monitor', desc: 'Computer applications' },
          { label: 'B.Com.', to: '/faculty?programme=B.Com.', icon: 'calculator', desc: 'Commerce' },
          { label: 'B.Sc.', to: '/faculty?programme=B.Sc.', icon: 'flask', desc: 'Sciences & languages' },
          { label: 'Library Science', to: '/faculty?programme=Library%20Science', icon: 'library', desc: 'Library staff' },
        ],
      },
      {
        title: 'PG College',
        links: [
          { label: 'All PG faculty', to: '/faculty?college=PG', icon: 'graduation', desc: 'MBA, MCA, M.Sc., M.A., M.Com., MHRM' },
          { label: 'Faculty directory', to: '/faculty', icon: 'users', desc: 'Search every department' },
        ],
      },
    ],
  },
  { label: 'Facilities', to: '/facilities' },
  {
    label: 'Departments',
    to: '/departments',
    groups: [
      {
        title: 'Degree College',
        links: [
          { label: 'Physical Sciences', to: '/departments?category=physical', icon: 'atom', desc: 'Maths, Physics, Chemistry, CS, Data Science' },
          { label: 'Life Sciences', to: '/departments?category=life', icon: 'leaf', desc: 'Botany, Zoology, Microbiology, Biotechnology' },
          { label: 'Arts', to: '/departments?category=arts', icon: 'landmark', desc: 'History, Economics, Politics, Psychology…' },
          { label: 'Commerce', to: '/departments?category=commerce', icon: 'calculator', desc: 'Bachelor of Commerce (Honours)' },
          { label: 'Management', to: '/departments?category=management', icon: 'briefcase', desc: 'Bachelor of Business Administration' },
          { label: 'Languages', to: '/departments?category=languages', icon: 'languages', desc: 'English, Telugu, Hindi, Sanskrit' },
        ],
      },
      {
        title: 'PG College',
        links: [{ label: 'PG departments', to: '/departments?category=pg', icon: 'graduation', desc: '14 departments & cells' }],
      },
    ],
  },
  {
    label: 'Courses',
    to: '/courses',
    groups: [
      {
        title: 'Undergraduate (Honours)',
        links: [
          { label: 'B.Sc. (Honours)', to: '/courses/ug/bsc', desc: '10 majors incl. Data Science & Aquaculture' },
          { label: 'B.A. (Honours)', to: '/courses/ug/ba', desc: '6 majors incl. Psychology & Journalism' },
          { label: 'B.Com. (Honours)', to: '/courses/ug/bcom', desc: 'Since 1973' },
          { label: 'BBA (Honours)', to: '/courses/ug/bba', desc: 'Since 1992' },
          { label: 'BCA', to: '/courses/ug/bca', desc: 'AICTE programme' },
          { label: 'Library Science', to: '/courses/ug/library-science', desc: 'Undergraduate library' },
        ],
      },
      {
        title: 'Postgraduate — Management & Commerce',
        links: [
          { label: 'MBA', to: '/courses/pg/mba' },
          { label: 'M.Com.', to: '/courses/pg/m-com' },
          { label: 'Human Resource Management', to: '/courses/pg/human-resource-management' },
          { label: 'MCA', to: '/courses/pg/mca' },
        ],
      },
      {
        title: 'Postgraduate — Sciences & Arts',
        links: [
          { label: 'M.Sc. Computer Science', to: '/courses/pg/computer-science' },
          { label: 'M.Sc. Mathematics', to: '/courses/pg/mathematics' },
          { label: 'M.Sc. Chemistry', to: '/courses/pg/chemistry' },
          { label: 'M.Sc. Biochemistry', to: '/courses/pg/biochemistry' },
          { label: 'M.Sc. Biotechnology', to: '/courses/pg/biotechnology' },
          { label: 'M.Sc. Microbiology', to: '/courses/pg/microbiology' },
          { label: 'M.A. English', to: '/courses/pg/english' },
        ],
      },
    ],
    feature: {
      title: 'All programmes',
      text: 'Compare every UG and PG programme, intake and eligibility in one place.',
      to: '/courses',
      image: '/img/media/jrcollege/news/facilities4.webp',
    },
  },
  {
    label: 'Academics',
    to: '/academics',
    groups: [
      {
        title: 'Learning',
        links: [
          { label: 'Academic Calendar', to: '/academics#calendar', icon: 'calendar', desc: 'Academic calendar of the college' },
          { label: "PO's / CO's", to: '/academics/outcomes', icon: 'target', desc: 'Programme & course outcomes, UG and PG' },
          { label: 'Value Addition', to: '/academics#value-addition', icon: 'sparkles', desc: 'Add-on programmes & certificates' },
          { label: 'Projects & Internships', to: '/academics/projects', icon: 'clipboard', desc: 'Project and internship records' },
        ],
      },
      {
        title: 'Careers & Skills',
        links: [
          { label: 'Skill Development Centre', to: '/academics/skill-development', icon: 'lightbulb', desc: 'SDC — established 2011' },
          { label: 'Placements', to: '/placements', icon: 'briefcase', desc: 'Career Guidance & Placement Cell' },
          { label: 'AICTE & IIC (PG)', to: '/aicte', icon: 'shield', desc: 'Approvals, disclosures, innovation council' },
        ],
      },
      {
        title: 'Read & Explore',
        links: [
          { label: 'The LBC Times', to: '/lbc-times', icon: 'newspaper', desc: 'College newsletter' },
          { label: 'Campus Glimpses', to: '/campus-glimpses', icon: 'camera', desc: 'Monthly campus round-ups' },
          { label: 'Blog', href: off('/ugcollege/ugblog'), icon: 'pen', desc: 'UG blog on the official site' },
        ],
      },
    ],
  },
  {
    label: 'Activities',
    to: '/activities',
    groups: [
      {
        title: 'Student life',
        links: [
          { label: 'Sports', to: '/activities#sports', icon: 'trophy', desc: 'Championships & sports committee' },
          { label: 'NCC', to: '/activities#ncc', icon: 'flag', desc: 'National Cadet Corps' },
          { label: 'NSS', to: '/activities#nss', icon: 'heart', desc: 'National Service Scheme' },
          { label: 'Bharat Scouts & Guides', to: '/activities/bharat-scouts-guides', icon: 'compass', desc: 'Unit established 2023' },
        ],
      },
      {
        title: 'Campus & academics',
        links: [
          { label: 'Clubs & department activities', to: '/activities#clubs', icon: 'users', desc: 'Management Club, Journal Club & more' },
          { label: 'Conferences & seminars', to: '/activities#conferences', icon: 'mic', desc: 'National conference 2026' },
          { label: 'Student achievements', to: '/activities#achievements', icon: 'award', desc: 'University toppers & champions' },
          { label: 'IQAC', to: '/iqac', icon: 'shield', desc: 'Internal Quality Assurance Cell' },
        ],
      },
    ],
  },
  { label: 'Online Payment', href: PAYMENT_URL, badge: 'pay' },
]

export const nirfReports = [
  { label: 'NIRF 2026', href: off('/static/images/nirf2026.pdf') },
  { label: 'NIRF 2025', href: off('/static/images/nirf2025.pdf') },
  { label: 'NIRF 2024', href: off('/static/images/nirf2024.pdf') },
  { label: 'NIRF 2023', href: off('/static/images/nirf2023.pdf') },
  { label: 'NIRF 2022', href: off('/static/images/nirf2022.pdf') },
  { label: 'NIRF 2021', href: off('/static/images/nirf.pdf') },
]

export const rtiDocs = [{ label: 'RTI Act 2005 — institutional disclosure', href: off('/static/images/RTI2005OLDANDNEWFILE.pdf') }]

export const committeeLinks: NavLink[] = [
  ['admission', 'Admission Committee'],
  ['anti-ragging', 'Anti-Ragging & Disciplinary Committee'],
  ['grievance-redressal', 'Grievances & Redressal Committee'],
  ['icc', 'Internal Compliance Committee (ICC)'],
  ['entrepreneurship-cell', 'Entrepreneurship Cell'],
  ['iqac', 'IQAC'],
  ['women-empowerment', 'Women Empowerment Cell'],
  ['sports', 'Sports Committee'],
  ['academic', 'Academic Committee'],
  ['examination', 'Examination Committee'],
  ['minority-welfare', "Minority Students' Welfare Committee"],
  ['scholarship', 'Scholarship Committee'],
  ['sc-st', 'SC / ST Committee'],
  ['cultural', 'Cultural Committee'],
].map(([slug, label]) => ({ label, to: `/committees/${slug}` }))

export const secondaryNav: NavItem[] = [
  { label: 'Gallery', to: '/gallery' },
  { label: 'RTI', to: '/rti', groups: [{ title: 'RTI', links: [{ label: 'RTI-2005', href: rtiDocs[0].href }, { label: 'RTI page', to: '/rti' }] }] },
  { label: 'NIRF', to: '/nirf', groups: [{ title: 'NIRF reports', links: nirfReports }] },
  {
    label: 'NAAC',
    to: '/naac',
    groups: [
      {
        title: 'Self Study Report',
        links: [
          ...[1, 2, 3, 4, 5, 6, 7].map((n) => ({ label: `Criterion ${n}`, to: `/naac?view=ssr&c=${n}` })),
          { label: 'Quality Metrics', to: '/naac?view=quality' },
        ],
      },
      {
        title: 'DVV & reports',
        links: [
          ...[1, 2, 3, 4, 5, 6, 7].map((n) => ({ label: `DVV Criterion ${n}`, to: `/naac?view=dvv&c=${n}` })),
          { label: 'Extended Profile', to: '/naac?view=extended' },
          { label: 'RAR-2015', href: off('/static/images/rar-2015.pdf') },
        ],
      },
    ],
  },
  { label: 'Committees', to: '/committees', groups: [{ title: 'Committees', links: committeeLinks }] },
  { label: 'IQAC', to: '/iqac' },
  { label: 'Placements', to: '/placements' },
  { label: 'The LBC Times', to: '/lbc-times' },
  { label: 'Campus Glimpses', to: '/campus-glimpses' },
  { label: 'Alumni', href: off('/ugcollege/alumni') },
  { label: 'Support', href: off('/ugcollege/support') },
  { label: 'BGV', to: '/bgv' },
]

/* ---------------------------------------------------------------------- hero */

export const heroSlides = [
  {
    eyebrow: 'Welcome to LBC · Since 1973',
    title: 'Welcome to Dr. Lankapalli Bullayya College',
    text: 'Inspiring Knowledge. Empowering Minds. Shaping Tomorrow.',
    image: '/img/static/skill/b1.webp',
    alt: 'LBC campus blocks with students assembled on the college ground',
    actions: [
      { label: 'Explore Our College', to: '/profile' },
      { label: 'Discover Our Programmes', to: '/courses' },
    ],
  },
  {
    eyebrow: 'Academic Excellence',
    title: 'Discover Your Potential',
    text: 'An environment dedicated to learning, exploration, and personal growth.',
    image: '/img/media/jrcollege/news/facilities4.webp',
    alt: 'Students working in an LBC computer laboratory',
    actions: [
      { label: 'Explore Academics', to: '/academics' },
      { label: 'Discover Departments', to: '/departments' },
    ],
  },
  {
    eyebrow: 'Campus Life',
    title: 'A Campus Full of Possibilities',
    text: 'Experience learning, creativity, leadership, and student life.',
    image: '/img/media/jrcollege/news/facilities2.webp',
    alt: 'Students on the LBC basketball court beside the college play ground',
    actions: [
      { label: 'Explore Campus', to: '/facilities' },
      { label: 'View Gallery', to: '/gallery' },
    ],
  },
  {
    eyebrow: 'Your Future Starts Here',
    title: 'Learn. Innovate. Achieve.',
    text: 'Build your future through knowledge, experience, and opportunity.',
    image: '/img/media/jrcollege/news/facilities6.webp',
    alt: 'Students reading in the LBC library',
    actions: [
      { label: 'Explore Courses', to: '/courses' },
      { label: 'Discover Placements', to: '/placements' },
    ],
  },
]

/* ---------------------------------------------------------------- about copy */

export const about = {
  intro:
    'Dr. Lankapalli Bullayya College was established in 1973 by the Society for Collegiate Education. Located in the heart of Visakhapatnam city on a sprawling 10-acre campus, the college was founded by socially conscious and philanthropic individuals from various fields, including education, the Indian Administrative Service, and business, all with a service motive. The college is named in honour of Dr. Lankapalli Bullayya, who was the then Vice Chancellor of Andhra University.',
  affiliation:
    'The college is affiliated to Andhra University and has been accredited by NAAC. In addition to degree courses, MBA, MCA, and engineering programmes are approved by AICTE, New Delhi. The college offers a wide range of programmes, from Intermediate (plus 2 level) to graduation, post-graduation, and research.',
  vision:
    'The College works with a vision to serve the young generation through education and to help them serve the society as value added citizens by inculcating values and shaping their personality to strive towards national development.',
  mission: [
    'The College endeavours to promote higher education by providing quality and value based academic instruction.',
    'As an institution of higher education the college offers current and relevant study programmes and creates perfect academic environment.',
  ],
  objectives: [
    'To equip the undergraduate and postgraduate students with necessary skills.',
    'To enable them to choose their prospective career.',
    'To provide excellent hand on experience.',
  ],
  degreeCollege:
    'Dr. Lankapalli Bullayya Degree College was established in 1973 by the Society for Collegiate Education to fulfill the needs of Higher Education in the North Coastal Districts of Andhra Pradesh. The College is affiliated to Andhra University and recognized by APSCHE.',
  pgCollege:
    'Dr. Lankapalli Bullayya PG College was established in 1994 by the Society for Collegiate Education to fulfill the needs of Post Graduate Education in the North Coastal Districts of Andhra Pradesh. The College is affiliated to Andhra University and recognized by AICTE.',
}

/** Milestones stated on the official profile, department and cell pages. */
export const milestones = [
  { year: '1973', text: 'College established by the Society for Collegiate Education with a three-year B.Com. programme.' },
  { year: '1976', text: 'The college is sanctioned government aid.' },
  { year: '1988', text: 'Expansion to Arts, Science and Commerce departments; B.A. and B.Sc. programmes begin.' },
  { year: '1992', text: 'Bachelor of Business Administration (BBA) is established.' },
  { year: '1993', text: 'Postgraduate courses launched with M.A. and M.Sc. Mathematics.' },
  { year: '1994', text: 'MBA and MCA introduced, each with an intake of 30 students.' },
  { year: '2010', text: 'Career Guidance & Placement Cell (CG & PC) established.' },
  { year: '2011', text: 'Skill Development Centre (SDC) established.' },
  { year: '2014', text: 'Andhra University recognises the MBA department as a research centre for M.Phil. and Ph.D.' },
  { year: '2023', text: 'Bharat Scouts & Guides unit established; Golden Jubilee celebrated.' },
]

export const quickFacts = [
  { value: '1973', label: 'Year established' },
  { value: '10-acre', label: 'Campus in Visakhapatnam' },
  { value: '56', label: 'UG classrooms' },
  { value: '33', label: 'Laboratories (16 UG · 17 PG)' },
]

export const leadership = [
  {
    role: 'Principal',
    name: 'Prof. G. S. K. Chakravarty',
    image: '/img/media/jrcollege/college_member/principalpg.webp',
    message: [
      'At LBC, we are dedicated to achieve educational excellence and prioritize the individual development of each student. Our institution has implemented a comprehensive “Mentoring System” to ensure that every class receives thorough monitoring and support.',
      'In today’s competitive landscape, it is imperative for students to excel not only in academics but also to cultivate essential qualities such as courtesy, discipline, values, empathy, integrity, and social sensitivity. Additionally, we emphasize the importance of integrating the traditional values and cultural heritage of our nation into their personal growth.',
      'Through this holistic approach, we aim to equip our students with the skills and character needed to succeed and contribute positively to society.',
    ],
  },
  {
    role: 'Vice Principal',
    image: '/img/media/jrcollege/college_member/vcpg.webp',
    message: [
      'We, at LBC, aim to provide students with an education and experience that prepares them for successful careers. We strive to empower them to excel in their chosen fields, discover their passions, and emerge as leaders. Our holistic approach ensures that students not only achieve academic success but also develop the confidence and skills necessary to thrive and lead in their professional endeavours.',
    ],
  },
  {
    role: 'Vice Principal',
    image: '/img/media/jrcollege/college_member/Untitled_design_13.webp',
    message: [
      'It is my great pleasure to welcome you to our college, where we strive to create an enriching and supportive learning environment. At LBC, we are committed to nurturing not only academic excellence but also the personal growth and development of each student. Our dedicated faculty and staff work tirelessly to provide you with the tools, skills, and experiences that will shape you into well-rounded professionals and responsible citizens.',
      'We believe that education goes beyond the classroom, and we encourage you to explore opportunities that broaden your horizons, challenge your thinking, and help you discover your true potential. Through a combination of academic rigour, extracurricular activities, and a focus on values, we aim to prepare you for the challenges of the modern world and guide you toward successful and fulfilling careers.',
    ],
  },
]

/* ---------------------------------------------------------------- news/events */

export const news = [
  {
    title: 'Weightlifting, Powerlifting and Best Physique Championship',
    category: 'Sports',
    image: '/img/media/jrcolleg/news/6.webp',
    text: "Andhra University Inter-College Weightlifting, Powerlifting and Best Physique Championship Competitions were organized from the 2nd to the 4th of November at Dr. Lankapalli Bullayya College. In these competitions, Dr. Lankapalli Bullayya College students won Men's and Women's Weightlifting, Powerlifting and Best Physique Overall Team Championship. While winning the title, students of Bullayya Engineering College emerged as runners-up in Men's Weightlifting, Women's Powerlifting and Best Physique Over All Championship. Gopi Chand, a second-year student of MCA, bagged the Mr. Andhra title in Best Physique.",
  },
  {
    title: 'Dr. G. Madhu Kumar participates in The Hindu National Webinar “Is the VBSA Bill Perfect Now?”',
    category: 'Institution',
    image: '/img/media/jrcolleg/news/WhatsApp_Image_2026-07-26_at_8.37.16_PM.webp',
    text: 'Dr G Madhu Kumar, Secretary and Correspondent, Dr Lankapalli Bullayya College, participated in a National webinar organised by The Hindu on the topic “Is VBSA Bill perfect now?” The other panelists were Mr Jagadesh Kumar, former Chairman UGC, and Mr Rajan Gurukkal, Historian and Social Scientist; Mr M Kayanaraman, Head, Education Vertical of The Hindu group, was the moderator.',
  },
  {
    title: 'Management Club activity — MBA',
    category: 'PG College',
    date: 'Nov. 8, 2024',
    image: '/img/media/jrcolleg/news/College_posters_4.webp',
    text: 'On October 29th, a Management Club activity was held. MBA students actively participated in presentations about Ratan Tata and Reliance Industries, followed by team activities. Management club provides a platform for the students to exhibit their talents and exchange knowledge with their fellow mates.',
  },
]

export const conference = {
  title: 'National Conference on Emerging Areas of Chemical Research',
  date: 'December 11–12, 2026',
  href: off('/static/NCEACR2026.pdf'),
}

export const achievers = [
  { image: '/img/media/jrcollege/slides/website_banners_6.webp', alt: 'Our Achievers: Shaik Irfana Begum, BA (2021–2024) Andhra University topper, and Metta Pallavi, B.Sc. (2021–2024) 2nd rank among Andhra University toppers' },
  { image: '/img/media/jrcollege/slides/website_banners_5.webp', alt: 'Our Achievers: Nagavamsam Rani, B.Com (2021–2024) 3rd rank among Andhra University toppers, and Tammineni Rakshitha, B.Com 3rd rank among Visakhapatnam district toppers' },
]

export const jubileeBanners = [
  { image: '/img/media/jrcollege/slides/5_HzE7bx5.webp', alt: 'Golden Jubilee Celebrations — guests felicitated on stage' },
  { image: '/img/media/jrcollege/slides/7_FAWu3ob.webp', alt: 'Golden Jubilee Celebrations — portrait gallery inauguration' },
]

/* --------------------------------------------------------------- facilities */

export const ugFacilities = [
  { name: 'Biotechnology lab', images: ['block-1_biotechnologies_lab-2', 'block-1biotechnologies_lab'] },
  { name: 'Botany lab', images: ['block-1_botany_lab-1', 'block-1_botony_lab-2'] },
  { name: 'Chemistry lab', images: ['chemestry_lab1-_block-1', 'chemistry_lab-2-block-1'] },
  { name: 'Zoology lab', images: ['zoolagy_lab_block-1', 'zoologi_lab1_block-1'] },
  { name: 'Computer lab', images: ['block-9_computer_lab', 'block-9_computer_lab-2'] },
  { name: 'Psychology lab', images: ['psycology_lab_block-4'] },
  { name: 'Microbiology lab', images: ['micro_bioloi_mlab1_block-1'] },
  { name: 'Library', images: ['library_3_block-4', 'library_3_block-5', 'library_bloc-4', 'labrary1_block-4'] },
].map((f) => ({ ...f, images: f.images.map((i) => `/img/media/jrcollege/news/${i}.webp`) }))

export const pgFacilities = [
  { name: 'Seminar Hall', image: 'facilities1' },
  { name: 'Sports', image: 'facilities2' },
  { name: 'Labs', image: 'facilities4' },
  { name: 'Library', image: 'facilities6' },
  { name: 'Canteen', image: 'facilities7' },
  { name: 'Bank & ATM', image: 'facilities8' },
  { name: 'Parking', image: 'facilities9' },
  { name: 'Security', image: 'facilities11' },
].map((f) => ({ ...f, image: `/img/media/jrcollege/news/${f.image}.webp` }))

export const labCounts = {
  ug: [
    ['Physics', 3],
    ['Electronics', 3],
    ['Chemistry', 4],
    ['Microbiology', 2],
    ['Biotechnology', 2],
    ['Zoology', 1],
    ['Botany', 1],
  ] as [string, number][],
  pg: [
    ['M.Sc. Chemistry', 5],
    ['M.Sc. Biotechnology', 5],
    ['M.Sc. Microbiology', 3],
    ['Computers', 2],
    ['Bio-Chemistry', 2],
  ] as [string, number][],
}

/* ------------------------------------------------------------------- gallery */

export const galleryVideos = {
  jubilee: ['LZyEQyIH-tQ', 'EMWa6YcI1zg', 'AxxB6T38qMk', '2_ZDjFY9VFQ', 'Y9DF2gK7hI0', '6TARf0Fbbtk'],
  campusVideo: off('/static/BLOCK-2.mp4'),
  homepageVideo: 'mSDXQ9VN6bU',
}

/* -------------------------------------------------------------- AICTE (PG) */

export const aicteDocs = [
  { label: 'Mandatory Disclosure', href: off('/static/aicte/mandatory_disclosure.pdf') },
  { label: 'MBA Mandatory Disclosure', href: off('/static/aicte/mbamandatorydisclosure.pdf') },
  { label: 'Approvals (LOA & EOA)', href: off('/static/aicte/AICTE-LOA-EOA.pdf') },
  { label: 'Other facilities (differently abled)', href: off('/static/aicte/DIFFERENTLY_ABLED.pdf') },
  { label: 'PG Admission Application Form (.docx)', href: off('/static/PG-Admission-Application.docx') },
  { label: 'AICTE scholarship / fellowship schemes', href: 'https://www.aicte.gov.in/schemes/students-development-schemes' },
]

export const aictePrograms = [
  ['Master of Business Administration', 120],
  ['Master of Computer Applications', 120],
  ['Bachelor of Business Administration', 120],
  ['Bachelor of Computer Applications', 120],
] as [string, number][]

/**
 * Official pages that returned HTTP 500 during the 19 Oct 2026 inspection.
 * Links are kept (they are the official destinations) and labelled so visitors
 * know they lead to the official server.
 */
export const officialUnavailable = new Set([
  off('/lbc/placements'),
  off('/lbc/sports'),
  off('/lbc/ncc'),
  off('/lbc/nss'),
  off('/lbc/academic_calendar'),
  off('/lbc/value_addition'),
])
