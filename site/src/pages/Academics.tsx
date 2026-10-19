import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, ClipboardList, GraduationCap, Lightbulb, Library, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DocList, type DocItem } from '../components/DocList'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { off } from '../content/site'
import { ugProgrammes, type Block, type NaacRow } from '../lib/data'
import { naac } from '../lib/naac'

function listAfter(blocks: Block[], heading: RegExp) {
  const i = blocks.findIndex((b) => b.t !== 'table' && heading.test(b.text))
  if (i < 0) return []
  const out: string[] = []
  for (const b of blocks.slice(i + 1)) {
    if (b.t !== 'li') break
    out.push(b.text)
  }
  return out
}

const rowsFor = (prefix: RegExp, rows: NaacRow[]): DocItem[] =>
  rows
    .filter((r) => prefix.test(r.cells[0] ?? ''))
    .map((r) => ({
      title: r.cells[3] || r.label || r.cells[1] || r.cells[0],
      meta: `NAAC metric ${r.cells[2] || r.cells[0]}${r.cells[1] ? ` · ${r.cells[1]}` : ''}`,
      href: r.href,
      unavailable: r.unavailable,
    }))

export default function Academics() {
  const ssr = Object.values(naac.ug.ssr).flat()
  const addOn = listAfter(ugProgrammes.find((p) => p.slug === 'bcom')?.blocks ?? [], /Add-On Courses/i)
  const hubs = [
    { title: "PO's / CO's", text: 'Programme and course outcomes for every UG and PG programme.', to: '/academics/outcomes', icon: Target },
    { title: 'Projects & Internships', text: 'Project reports and internship certificates by programme.', to: '/academics/projects', icon: ClipboardList },
    { title: 'Skill Development Centre', text: 'Analytical and soft-skills training since 2011.', to: '/academics/skill-development', icon: Lightbulb },
    { title: 'Courses', text: 'All undergraduate and postgraduate programmes.', to: '/courses', icon: GraduationCap },
  ]
  return (
    <>
      <PageHero
        eyebrow="Academics"
        title="Academic resources"
        text="Calendars, outcomes, value-added programmes, projects, skills training and student academic support — with the original documents preserved."
        image="/img/media/jrcollege/news/library_bloc-4.webp"
      />

      <section className="bg-white py-16">
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {hubs.map((h, i) => (
            <Reveal key={h.title} delay={i * 0.06}>
              <Link to={h.to} className="group card flex h-full flex-col p-7 transition hover:-translate-y-1">
                <h.icon className="h-8 w-8 text-gold" aria-hidden="true" />
                <h2 className="mt-4 text-xl text-navy group-hover:text-royal">{h.title}</h2>
                <p className="mt-2 text-sm text-slate/65">{h.text}</p>
                <ArrowRight className="mt-auto h-5 w-5 pt-1 text-royal transition group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="calendar" className="scroll-mt-28 bg-mist py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Academic calendar & examinations" title="Calendar and examinations" />
            <Reveal className="mt-6 grid gap-4 text-slate/75">
              <p>
                All undergraduate courses are of four-year duration and follow a semester pattern in accordance with the guidelines of Andhra University. The conduct of semester-end theory and practical examinations, as well as the issuance of degrees, is the prerogative of Andhra University.
              </p>
              <p>The college publishes its academic calendar on the official website.</p>
            </Reveal>
          </div>
          <Reveal className="grid content-center gap-3">
            <a href={off('/lbc/academic_calendar')} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-5 font-bold text-navy hover:text-royal">
              <CalendarDays className="h-7 w-7 text-gold" aria-hidden="true" /> Academic Calendar (official page) <ArrowUpRight className="ml-auto h-4 w-4" />
            </a>
            <Link to="/committees/examination" className="card flex items-center gap-4 p-5 font-bold text-navy hover:text-royal">
              <BookOpen className="h-7 w-7 text-gold" aria-hidden="true" /> Examination Committee <ArrowRight className="ml-auto h-4 w-4" />
            </Link>
            <Link to="/committees/academic" className="card flex items-center gap-4 p-5 font-bold text-navy hover:text-royal">
              <GraduationCap className="h-7 w-7 text-gold" aria-hidden="true" /> Academic Committee <ArrowRight className="ml-auto h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section id="value-addition" className="scroll-mt-28 bg-white py-16">
        <div className="container-x">
          <SectionHeading eyebrow="Value addition" title="Add-on programmes" text="In addition to the university-prescribed curriculum, the Commerce and Management departments offer add-on courses." />
          {addOn.length > 0 && (
            <Reveal className="mt-8 flex flex-wrap gap-2">
              {addOn.map((a) => (
                <span key={a} className="rounded-full bg-gold-soft px-4 py-2 text-sm font-bold text-navy">
                  {a}
                </span>
              ))}
            </Reveal>
          )}
          <div className="mt-10">
            <DocList docs={rowsFor(/^1\.2\.1/, ssr)} />
          </div>
          <a href={off('/lbc/value_addition')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-royal">
            Value Addition on the official site <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section id="support" className="scroll-mt-28 bg-mist py-16">
        <div className="container-x">
          <SectionHeading
            eyebrow="Student academic support"
            title="Mentoring, guidance & scholarships"
            text="LBC has implemented a comprehensive “Mentoring System” to ensure that every class receives thorough monitoring and support."
          />
          <div className="mt-10">
            <DocList docs={[...rowsFor(/^5\.1\.[23]/, ssr), ...rowsFor(/^5\.1\.1/, ssr)].map((d) => ({ ...d, group: d.meta?.split(' · ')[1] }))} columns={3} />
          </div>
        </div>
      </section>

      <section id="resources" className="scroll-mt-28 bg-white py-16">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {[
            { title: 'N-LIST e-resources', text: 'Access e-journals and e-books through INFLIBNET N-LIST.', href: 'https://nlist.inflibnet.ac.in/', icon: Library },
            { title: 'UG Library', text: 'Textbooks, reference materials, journals and e-resources for every discipline.', to: '/courses/ug/library-science', icon: BookOpen },
            { title: 'PG Library', text: 'Resources tailored to advanced learners, with study areas for research and projects.', to: '/courses/pg/library-science', icon: BookOpen },
          ].map((r) => (
            <Reveal key={r.title}>
              {r.to ? (
                <Link to={r.to} className="card block h-full p-7 hover:-translate-y-1">
                  <r.icon className="h-8 w-8 text-royal" aria-hidden="true" />
                  <p className="mt-4 text-lg font-extrabold text-navy">{r.title}</p>
                  <p className="mt-2 text-sm text-slate/65">{r.text}</p>
                </Link>
              ) : (
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="card block h-full p-7 hover:-translate-y-1">
                  <r.icon className="h-8 w-8 text-royal" aria-hidden="true" />
                  <p className="mt-4 flex items-center gap-1 text-lg font-extrabold text-navy">
                    {r.title} <ArrowUpRight className="h-4 w-4" />
                  </p>
                  <p className="mt-2 text-sm text-slate/65">{r.text}</p>
                </a>
              )}
            </Reveal>
          ))}
        </div>
        <div className="container-x mt-8">
          <a href={off('/ugcollege/ugblog')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-royal">
            Read the college blog <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  )
}
