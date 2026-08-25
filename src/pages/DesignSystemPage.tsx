import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Celebration,
  MedalIcon,
  Mascot,
  MissionProgressBar,
  Modal,
  PlanetCard,
  PlanetOrb,
  ProgressBar,
  RankBadge,
  SpaceButton,
  StarBadge,
  Toast,
  type ToastVariant,
} from '../shared/components'
import { useSound } from '../shared/hooks/useSound'

interface ToastState {
  message: string
  variant: ToastVariant
}

function DemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-extrabold text-astral-sky">{title}</h2>
      <div className="rounded-3xl border border-white/10 bg-space-bg-soft p-5 shadow-lg shadow-black/20">{children}</div>
    </section>
  )
}

export default function DesignSystemPage() {
  const { t } = useTranslation()
  const { play, muted, toggleMuted } = useSound()
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [celebrating, setCelebrating] = useState(false)

  const showToast = (variant: ToastVariant, message: string) => {
    setToast({ variant, message })
    window.setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-text-space">{t('design.title')}</h1>
        <p className="mt-1 text-lg font-semibold text-text-space/80">{t('design.subtitle')}</p>
      </header>

      <DemoSection title={t('design.buttons')}>
        <div className="flex flex-wrap items-center gap-3">
          <SpaceButton onClick={() => play('click')}>{t('ui.button_label')}</SpaceButton>
          <SpaceButton variant="secondary" onClick={() => play('click')}>
            {t('ui.button_label')}
          </SpaceButton>
          <SpaceButton variant="ghost" onClick={() => play('click')}>
            {t('ui.button_label')}
          </SpaceButton>
          <SpaceButton loading onClick={() => play('click')} />
          <SpaceButton disabled onClick={() => play('click')}>
            {t('ui.button_label')}
          </SpaceButton>
        </div>
      </DemoSection>

      <DemoSection title={t('design.cards')}>
        <div className="flex flex-wrap justify-center gap-4">
          <PlanetCard color="earth" name={t('nav.lessons')} description={t('home.lessons_desc')} state="active" onClick={() => play('click')} />
          <PlanetCard color="mars" name={t('nav.practice')} description={t('home.practice_desc')} state="completed" onClick={() => play('click')} />
          <PlanetCard color="asteroid" name={t('nav.settings')} description={t('home.settings_desc')} state="locked" />
        </div>
      </DemoSection>

      <DemoSection title={t('design.orbs')}>
        <div className="flex flex-wrap items-center gap-4">
          <PlanetOrb color="mercury" icon="book" className="h-14 w-14" iconClassName="h-6 w-6" />
          <PlanetOrb color="venus" icon="pencil" className="h-14 w-14" iconClassName="h-6 w-6" />
          <PlanetOrb color="earth" icon="rocket" className="h-14 w-14" iconClassName="h-6 w-6" />
          <PlanetOrb color="mars" icon="medal" className="h-14 w-14" iconClassName="h-6 w-6" />
          <PlanetOrb color="asteroid" icon="star" className="h-14 w-14" iconClassName="h-6 w-6" />
          <PlanetOrb color="asteroid" icon="gear" locked className="h-14 w-14" iconClassName="h-6 w-6" />
        </div>
      </DemoSection>

      <DemoSection title={t('design.mascot')}>
        <div className="flex flex-wrap items-center gap-6">
          <Mascot pose="idle" size={64} />
          <Mascot pose="wave" size={64} />
          <Mascot pose="cheer" size={64} />
          <Mascot variant="bust" size={64} />
        </div>
      </DemoSection>

      <DemoSection title={t('design.mission_progress')}>
        <div className="flex flex-col gap-6">
          <MissionProgressBar value={20} label="20%" />
          <MissionProgressBar value={65} label="65%" />
          <MissionProgressBar value={100} label="100%" />
        </div>
      </DemoSection>

      <DemoSection title={t('design.ranks')}>
        <div className="flex flex-wrap items-center gap-4">
          <RankBadge rank={1} />
          <RankBadge rank={2} />
          <RankBadge rank={3} />
          <RankBadge rank={4} />
        </div>
      </DemoSection>

      <DemoSection title={t('design.stars')}>
        <div className="flex flex-wrap items-center gap-6">
          <StarBadge count={3} />
          <StarBadge count={2} />
          <StarBadge count={1} />
          <StarBadge count={0} />
          <StarBadge count={2} size="sm" />
        </div>
      </DemoSection>

      <DemoSection title={t('design.medals')}>
        <div className="flex items-center gap-6">
          <MedalIcon earned />
          <MedalIcon earned={false} />
        </div>
      </DemoSection>

      <DemoSection title={t('design.modal')}>
        <SpaceButton onClick={() => { play('click'); setModalOpen(true) }}>{t('design.open_modal')}</SpaceButton>
      </DemoSection>

      <DemoSection title={t('design.progress')}>
        <div className="flex flex-col gap-4">
          <ProgressBar value={100} label={`${t('ui.completed')}: 100%`} />
          <ProgressBar value={65} label="65%" />
          <ProgressBar value={25} label="25%" />
        </div>
      </DemoSection>

      <DemoSection title={t('design.toast')}>
        <div className="flex flex-wrap items-center gap-3">
          <SpaceButton variant="secondary" onClick={() => showToast('success', t('design.show_success'))}>
            {t('design.show_success')}
          </SpaceButton>
          <SpaceButton variant="ghost" onClick={() => showToast('error', t('design.show_error'))}>
            {t('design.show_error')}
          </SpaceButton>
          <SpaceButton variant="ghost" onClick={() => showToast('info', t('design.show_info'))}>
            {t('design.show_info')}
          </SpaceButton>
        </div>
      </DemoSection>

      <DemoSection title={t('design.celebration')}>
        <SpaceButton variant="secondary" onClick={() => setCelebrating(true)}>
          {t('design.launch')}
        </SpaceButton>
      </DemoSection>

      <DemoSection title={t('design.sound')}>
        <div className="flex flex-wrap items-center gap-3">
          <SpaceButton variant="ghost" onClick={() => play('click')}>
            {t('design.play_click')}
          </SpaceButton>
          <SpaceButton variant="ghost" onClick={() => play('correct')}>
            {t('design.play_correct')}
          </SpaceButton>
          <SpaceButton variant="ghost" onClick={() => play('incorrect')}>
            {t('design.play_incorrect')}
          </SpaceButton>
          <SpaceButton variant="ghost" onClick={() => play('celebrate')}>
            {t('design.play_celebrate')}
          </SpaceButton>
          <SpaceButton variant="primary" onClick={toggleMuted}>
            {muted ? t('sound.off') : t('sound.on')}
          </SpaceButton>
        </div>
      </DemoSection>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('ui.modal_title')}>
        <p className="text-base font-semibold text-text-ink/80">{t('ui.modal_body')}</p>
        <div className="mt-4 flex justify-end">
          <SpaceButton onClick={() => setModalOpen(false)}>{t('ui.close')}</SpaceButton>
        </div>
      </Modal>

      <Toast message={toast?.message ?? ''} variant={toast?.variant ?? 'info'} visible={toast !== null} />
      <Celebration active={celebrating} onEnded={() => setCelebrating(false)} />
    </div>
  )
}