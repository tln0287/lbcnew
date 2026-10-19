import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { RiseText } from './Effects'

type Props = HTMLMotionProps<'div'> & { delay?: number; y?: number }

/** Fades and lifts content into view once; static when reduced motion is requested. */
export function Reveal({ delay = 0, y = 28, children, ...rest }: Props) {
  const reduce = useReducedMotion()
  if (reduce) return <motion.div {...rest}>{children}</motion.div>
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/**
 * Section heading: a plain-language heading with rising words and an optional
 * lede. No label is stacked above it — `eyebrow` is accepted for API
 * compatibility but not shown.
 */
export function SectionHeading({
  title,
  text,
  align = 'left',
  light = false,
}: {
  eyebrow?: string
  title: string
  text?: string
  align?: 'left' | 'center'
  light?: boolean
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <RiseText text={title} className={`h-section ${light ? '!text-white' : 'text-navy'}`} />
      {text && (
        <Reveal delay={0.15}>
          <p className={`mt-5 max-w-[60ch] text-lg leading-[1.65] ${align === 'center' ? 'mx-auto' : ''} ${light ? 'text-white/75' : 'text-slate'}`}>{text}</p>
        </Reveal>
      )}
    </div>
  )
}
