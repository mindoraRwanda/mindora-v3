import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import type { TranslationKey } from '@/constants/i18n';

type ExerciseId = 'box-breathing' | 'grounding' | 'body-scan';

interface ExerciseDef {
  id: ExerciseId;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  durationKey: TranslationKey;
  categoryKey: TranslationKey;
  icon: IconSymbolName;
}

const EXERCISES: ExerciseDef[] = [
  {
    id: 'box-breathing',
    titleKey: 'games.boxBreathing.title',
    descriptionKey: 'games.boxBreathing.cardDescription',
    durationKey: 'games.boxBreathing.duration',
    categoryKey: 'games.boxBreathing.category',
    icon: 'wind',
  },
  {
    id: 'grounding',
    titleKey: 'games.grounding.title',
    descriptionKey: 'games.grounding.cardDescription',
    durationKey: 'games.grounding.duration',
    categoryKey: 'games.grounding.category',
    icon: 'eye.fill',
  },
  {
    id: 'body-scan',
    titleKey: 'games.bodyScan.title',
    descriptionKey: 'games.bodyScan.cardDescription',
    durationKey: 'games.bodyScan.duration',
    categoryKey: 'games.bodyScan.category',
    icon: 'figure.stand',
  },
];

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { user } = useAuth();
  const { t } = useLocale();
  const [active, setActive] = useState<ExerciseId | null>(null);

  const openExercise = (id: ExerciseId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActive(id);
  };

  const closeExercise = useCallback(() => setActive(null), []);

  if (!user) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <EmptyState icon="gamecontroller" title={t('games.signInTitle')} message={t('games.signInMsg')} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top || 60, paddingBottom: insets.bottom + Spacing.xxxl + Spacing.sm }}>
        <View style={styles.header}>
          <ThemedText type="title">{t('games.title')}</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>{t('games.subtitle')}</ThemedText>
        </View>

        <View style={styles.list}>
          {EXERCISES.map((item) => (
            <TouchableOpacity key={item.id} activeOpacity={0.85} onPress={() => openExercise(item.id)}>
              <Card style={styles.exerciseCard}>
                <View style={styles.cardTop}>
                  <View style={[styles.iconAvatar, { backgroundColor: colors.tintSoft }]}>
                    <IconSymbol name={item.icon} size={26} color={colors.tint} />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.categoryBadge, { backgroundColor: colors.tintSoft }]}>
                        <ThemedText style={[styles.categoryText, { color: colors.tint }]}>{t(item.categoryKey)}</ThemedText>
                      </View>
                      <ThemedText style={[styles.duration, { color: colors.textMuted }]}>{t(item.durationKey)}</ThemedText>
                    </View>
                    <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>
                      {t(item.titleKey)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText numberOfLines={2} style={[styles.exerciseDescription, { color: colors.textMuted }]}>
                  {t(item.descriptionKey)}
                </ThemedText>
                <View style={[styles.playButton, { backgroundColor: colors.tintSolid }]}>
                  <IconSymbol name="play.fill" size={14} color="#fff" />
                  <ThemedText style={styles.playText}>{t('games.start')}</ThemedText>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={!!active}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeExercise}>
        {active === 'box-breathing' && <BoxBreathingPlayer onExit={closeExercise} />}
        {active === 'grounding' && <GroundingPlayer onExit={closeExercise} />}
        {active === 'body-scan' && <BodyScanPlayer onExit={closeExercise} />}
      </Modal>
    </ThemedView>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared player header                                              */
/* ------------------------------------------------------------------ */

type ThemeColors = (typeof Colors)['light'] | (typeof Colors)['dark'];

function PlayerHeader({ title, onExit, colors }: { title: string; onExit: () => void; colors: ThemeColors }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.playerHeader, { paddingTop: insets.top || 20 }]}>
      <ThemedText type="defaultSemiBold" style={styles.playerHeaderTitle}>
        {title}
      </ThemedText>
      <TouchableOpacity
        style={[styles.closeBtn, { backgroundColor: colors.tintSoft }]}
        onPress={onExit}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <IconSymbol name="xmark" size={18} color={colors.tint} />
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Box Breathing (4-4-4-4)                                        */
/* ------------------------------------------------------------------ */

const BREATH_CYCLE_SECONDS = 16; // 4 (in) + 4 (hold) + 4 (out) + 4 (hold)
const MIN_SCALE = 0.6;
const MAX_SCALE = 1;
const DURATION_OPTIONS = [1, 3, 5];

type BreathPhaseKey = 'phaseIn' | 'phaseHold' | 'phaseOut';

function getBreathPhase(secondsElapsed: number): { phaseKey: BreathPhaseKey; index: number } {
  const elapsed = secondsElapsed % BREATH_CYCLE_SECONDS;
  if (elapsed < 4) return { phaseKey: 'phaseIn', index: 0 };
  if (elapsed < 8) return { phaseKey: 'phaseHold', index: 1 };
  if (elapsed < 12) return { phaseKey: 'phaseOut', index: 2 };
  return { phaseKey: 'phaseHold', index: 3 };
}

function BoxBreathingPlayer({ onExit }: { onExit: () => void }) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { t } = useLocale();

  const [stage, setStage] = useState<'setup' | 'running' | 'done'>('setup');
  const [durationMin, setDurationMin] = useState(3);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const scale = useRef(new Animated.Value(MIN_SCALE)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPhaseIndex = useRef(-1);

  const totalSeconds = durationMin * 60;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount (e.g. user exits mid-exercise).
  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    if (stage !== 'running') return;
    intervalRef.current = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        if (next >= totalSeconds) {
          clearTimer();
          setStage('done');
          return prev;
        }
        return next;
      });
    }, 1000);
    return clearTimer;
  }, [stage, totalSeconds, clearTimer]);

  // Drives both the phase label and the circle animation from one JS-side clock,
  // so the text and the animation can never drift apart.
  useEffect(() => {
    if (stage !== 'running') return;
    const phase = getBreathPhase(secondsElapsed);
    if (phase.index !== lastPhaseIndex.current) {
      lastPhaseIndex.current = phase.index;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (phase.index === 0) {
        Animated.timing(scale, { toValue: MAX_SCALE, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }).start();
      } else if (phase.index === 2) {
        Animated.timing(scale, { toValue: MIN_SCALE, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }).start();
      }
      // Hold phases intentionally leave the circle where it is.
    }
  }, [secondsElapsed, stage, scale]);

  const start = (minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDurationMin(minutes);
    setSecondsElapsed(0);
    lastPhaseIndex.current = -1;
    scale.setValue(MIN_SCALE);
    setStage('running');
  };

  const handleExit = () => {
    clearTimer();
    onExit();
  };

  const restart = () => {
    setStage('setup');
    setSecondsElapsed(0);
  };

  const phase = getBreathPhase(secondsElapsed);
  const phaseLabel = t(`games.boxBreathing.${phase.phaseKey}`);
  const remaining = Math.max(0, totalSeconds - secondsElapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const doneMessage =
    durationMin === 1
      ? t('games.boxBreathing.doneMsgOne')
      : t('games.boxBreathing.doneMsgOther', { min: durationMin });

  return (
    <ThemedView style={styles.playerContainer}>
      <PlayerHeader title={t('games.boxBreathing.title')} onExit={handleExit} colors={colors} />

      {stage === 'setup' && (
        <View style={styles.playerBody}>
          <IconSymbol name="wind" size={56} color={colors.tint} />
          <ThemedText type="title" style={styles.setupTitle}>
            {t('games.boxBreathing.title')}
          </ThemedText>
          <ThemedText style={[styles.setupSubtitle, { color: colors.textMuted }]}>
            {t('games.boxBreathing.subtitle')}
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.setupLabel}>
            {t('games.boxBreathing.chooseDuration')}
          </ThemedText>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((min) => (
              <TouchableOpacity
                key={min}
                style={[
                  styles.durationChip,
                  { borderColor: colors.border },
                  durationMin === min && { backgroundColor: colors.tintSolid, borderColor: colors.tintSolid },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setDurationMin(min);
                }}>
                <ThemedText
                  style={[styles.durationChipText, { color: colors.text }, durationMin === min && { color: '#fff' }]}>
                  {t('games.boxBreathing.minutesOption', { min })}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title={t('games.boxBreathing.startSession')}
            onPress={() => start(durationMin)}
            style={{ marginTop: Spacing.xxxl, width: '100%' }}
          />
        </View>
      )}

      {stage === 'running' && (
        <View style={styles.playerBody}>
          <ThemedText style={[styles.remainingLabel, { color: colors.textMuted }]}>
            {t('games.boxBreathing.remaining', { time: `${mm}:${ss}` })}
          </ThemedText>
          <View style={styles.breathCircleWrap}>
            <View style={[styles.breathCircleOuter, { borderColor: colors.tintSoft }]} />
            <Animated.View style={[styles.breathCircleInner, { backgroundColor: colors.tintSolid, transform: [{ scale }] }]} />
            <ThemedText style={styles.phaseLabel}>{phaseLabel}</ThemedText>
          </View>
          <Button
            title={t('games.boxBreathing.stop')}
            variant="secondary"
            onPress={handleExit}
            style={{ marginTop: 40, width: '100%' }}
          />
        </View>
      )}

      {stage === 'done' && (
        <View style={styles.playerBody}>
          <View style={[styles.doneIconCircle, { backgroundColor: colors.successSoft }]}>
            <IconSymbol name="checkmark" size={36} color={colors.success} />
          </View>
          <ThemedText type="title" style={styles.setupTitle}>
            {t('games.boxBreathing.doneTitle')}
          </ThemedText>
          <ThemedText style={[styles.setupSubtitle, { color: colors.textMuted }]}>{doneMessage}</ThemedText>
          <View style={styles.doneActions}>
            <Button title={t('games.doItAgain')} variant="secondary" onPress={restart} style={{ flex: 1 }} />
            <Button title={t('games.done')} onPress={handleExit} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      <View style={{ height: insets.bottom }} />
    </ThemedView>
  );
}

/* ------------------------------------------------------------------ */
/*  2. 5-4-3-2-1 Grounding                                            */
/* ------------------------------------------------------------------ */

const GROUNDING_STEPS: { count: number; sense: string; icon: IconSymbolName; promptKey: TranslationKey }[] = [
  { count: 5, sense: 'see', icon: 'eye.fill', promptKey: 'games.grounding.stepSee' },
  { count: 4, sense: 'feel', icon: 'hand.raised.fill', promptKey: 'games.grounding.stepFeel' },
  { count: 3, sense: 'hear', icon: 'ear.fill', promptKey: 'games.grounding.stepHear' },
  { count: 2, sense: 'smell', icon: 'nose.fill', promptKey: 'games.grounding.stepSmell' },
  { count: 1, sense: 'taste', icon: 'mouth.fill', promptKey: 'games.grounding.stepTaste' },
];

function GroundingPlayer({ onExit }: { onExit: () => void }) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { t } = useLocale();

  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: false }).start();
  }, [stepIndex, finished, opacity]);

  const step = GROUNDING_STEPS[stepIndex];
  const isLast = stepIndex === GROUNDING_STEPS.length - 1;

  const handleNext = () => {
    Haptics.selectionAsync();
    if (isLast) {
      setFinished(true);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleExit = () => onExit();

  const restart = () => {
    setStepIndex(0);
    setFinished(false);
  };

  return (
    <ThemedView style={styles.playerContainer}>
      <PlayerHeader title={t('games.grounding.title')} onExit={handleExit} colors={colors} />

      {!finished ? (
        <Animated.View style={[styles.playerBody, { opacity }]}>
          <View style={styles.dotsRow}>
            {GROUNDING_STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: colors.border },
                  i === stepIndex && { backgroundColor: colors.tintSolid, width: 20 },
                  i < stepIndex && { backgroundColor: colors.tintSolid },
                ]}
              />
            ))}
          </View>
          <ThemedText style={[styles.stepOf, { color: colors.textMuted }]}>
            {t('games.grounding.stepOf', { current: stepIndex + 1, total: GROUNDING_STEPS.length })}
          </ThemedText>

          <View style={[styles.groundingIconCircle, { backgroundColor: colors.tintSoft }]}>
            <ThemedText style={[styles.groundingCount, { color: colors.tint }]}>{step.count}</ThemedText>
          </View>
          <IconSymbol name={step.icon} size={28} color={colors.tint} style={{ marginTop: Spacing.md }} />
          <ThemedText type="title" style={styles.groundingPrompt}>
            {t(step.promptKey)}
          </ThemedText>

          <View style={styles.doneActions}>
            {stepIndex > 0 && (
              <Button title={t('games.grounding.back')} variant="secondary" onPress={handleBack} style={{ flex: 1 }} />
            )}
            <Button
              title={isLast ? t('games.grounding.finish') : t('games.grounding.next')}
              onPress={handleNext}
              style={{ flex: 2 }}
            />
          </View>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.playerBody, { opacity }]}>
          <View style={[styles.doneIconCircle, { backgroundColor: colors.successSoft }]}>
            <IconSymbol name="leaf.fill" size={36} color={colors.success} />
          </View>
          <ThemedText type="title" style={styles.setupTitle}>
            {t('games.grounding.doneTitle')}
          </ThemedText>
          <ThemedText style={[styles.setupSubtitle, { color: colors.textMuted }]}>
            {t('games.grounding.doneMsg')}
          </ThemedText>
          <View style={styles.doneActions}>
            <Button title={t('games.doItAgain')} variant="secondary" onPress={restart} style={{ flex: 1 }} />
            <Button title={t('games.done')} onPress={handleExit} style={{ flex: 1 }} />
          </View>
        </Animated.View>
      )}

      <View style={{ height: insets.bottom }} />
    </ThemedView>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Body Scan                                                       */
/* ------------------------------------------------------------------ */

const BODY_SCAN_STEPS: { partKey: TranslationKey; instructionKey: TranslationKey }[] = [
  { partKey: 'games.bodyScan.partFeet', instructionKey: 'games.bodyScan.instructionFeet' },
  { partKey: 'games.bodyScan.partLegs', instructionKey: 'games.bodyScan.instructionLegs' },
  { partKey: 'games.bodyScan.partStomach', instructionKey: 'games.bodyScan.instructionStomach' },
  { partKey: 'games.bodyScan.partChest', instructionKey: 'games.bodyScan.instructionChest' },
  { partKey: 'games.bodyScan.partShoulders', instructionKey: 'games.bodyScan.instructionShoulders' },
  { partKey: 'games.bodyScan.partArms', instructionKey: 'games.bodyScan.instructionArms' },
  { partKey: 'games.bodyScan.partHands', instructionKey: 'games.bodyScan.instructionHands' },
  { partKey: 'games.bodyScan.partNeck', instructionKey: 'games.bodyScan.instructionNeck' },
  { partKey: 'games.bodyScan.partFace', instructionKey: 'games.bodyScan.instructionFace' },
];
const STEP_SECONDS = 15;

function BodyScanPlayer({ onExit }: { onExit: () => void }) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { t } = useLocale();

  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(STEP_SECONDS);
  const [paused, setPaused] = useState(false);
  const [stage, setStage] = useState<'running' | 'done'>('running');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstStep = useRef(true);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  // Ticks the countdown for the current step, once per second, while running & not paused.
  useEffect(() => {
    if (stage !== 'running' || paused) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return clearTimer;
  }, [stage, paused, clearTimer]);

  // When the per-step countdown reaches zero, auto-advance to the next body part.
  useEffect(() => {
    if (stage !== 'running' || remaining !== 0) return;
    if (stepIndex >= BODY_SCAN_STEPS.length - 1) {
      setStage('done');
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [remaining, stage, stepIndex]);

  // Reset the per-step timer (and give haptic feedback) whenever we land on a new step.
  useEffect(() => {
    if (isFirstStep.current) {
      isFirstStep.current = false;
      return;
    }
    if (stage === 'running') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRemaining(STEP_SECONDS);
    }
  }, [stepIndex, stage]);

  const handleSkip = () => {
    Haptics.selectionAsync();
    if (stepIndex >= BODY_SCAN_STEPS.length - 1) {
      clearTimer();
      setStage('done');
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const togglePause = () => {
    Haptics.selectionAsync();
    setPaused((p) => !p);
  };

  const handleExit = () => {
    clearTimer();
    onExit();
  };

  const restart = () => {
    setStepIndex(0);
    setRemaining(STEP_SECONDS);
    setPaused(false);
    isFirstStep.current = true;
    setStage('running');
  };

  const step = BODY_SCAN_STEPS[stepIndex];
  const progressPct = Math.round(((STEP_SECONDS - remaining) / STEP_SECONDS) * 100);

  return (
    <ThemedView style={styles.playerContainer}>
      <PlayerHeader title={t('games.bodyScan.title')} onExit={handleExit} colors={colors} />

      {stage === 'running' ? (
        <View style={styles.playerBody}>
          <ThemedText style={[styles.stepOf, { color: colors.textMuted }]}>
            {t('games.bodyScan.stepOf', { current: stepIndex + 1, total: BODY_SCAN_STEPS.length })}
          </ThemedText>
          <ThemedText type="title" style={styles.bodyPartLabel}>
            {t(step.partKey)}
          </ThemedText>
          <ThemedText style={[styles.setupSubtitle, { color: colors.textMuted }]}>{t(step.instructionKey)}</ThemedText>

          <View style={[styles.progressTrack, { backgroundColor: colors.tintSoft }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.tintSolid, width: `${progressPct}%` }]} />
          </View>
          <ThemedText style={[styles.remainingLabel, { color: colors.textMuted }]}>{remaining}s</ThemedText>

          <View style={styles.doneActions}>
            <Button title={t('games.bodyScan.skip')} variant="secondary" onPress={handleSkip} style={{ flex: 1 }} />
            <Button
              title={paused ? t('games.bodyScan.resume') : t('games.bodyScan.pause')}
              onPress={togglePause}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.playerBody}>
          <View style={[styles.doneIconCircle, { backgroundColor: colors.successSoft }]}>
            <IconSymbol name="checkmark" size={36} color={colors.success} />
          </View>
          <ThemedText type="title" style={styles.setupTitle}>
            {t('games.bodyScan.doneTitle')}
          </ThemedText>
          <ThemedText style={[styles.setupSubtitle, { color: colors.textMuted }]}>
            {t('games.bodyScan.doneMsg')}
          </ThemedText>
          <View style={styles.doneActions}>
            <Button title={t('games.doItAgain')} variant="secondary" onPress={restart} style={{ flex: 1 }} />
            <Button title={t('games.done')} onPress={handleExit} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      <View style={{ height: insets.bottom }} />
    </ThemedView>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxxl + Spacing.sm },
  header: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  subtitle: { ...Typography.body, marginTop: Spacing.xs },

  list: { paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  exerciseCard: { marginBottom: 0 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  iconAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, marginLeft: Spacing.md + 2 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs + 2 },
  categoryBadge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: 6 },
  categoryText: { ...Typography.overline, fontSize: 10 },
  duration: { ...Typography.caption },
  exerciseTitle: { fontSize: 17 },
  exerciseDescription: { ...Typography.bodySm, marginBottom: Spacing.lg },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs + 2,
    borderRadius: Radius.md,
    height: 40,
  },
  playText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Player (modal) shared
  playerContainer: { flex: 1 },
  playerHeader: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerHeaderTitle: { fontSize: 17 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  playerBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl + 4 },

  setupTitle: { ...Typography.h1, textAlign: 'center', marginTop: Spacing.lg, marginBottom: 10 },
  setupSubtitle: { ...Typography.body, textAlign: 'center' },
  setupLabel: { fontSize: 14, marginTop: Spacing.xxxl, marginBottom: 14 },
  durationRow: { flexDirection: 'row', gap: Spacing.sm + 2 },
  durationChip: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  durationChipText: { fontSize: 14, fontWeight: '600' },

  remainingLabel: { ...Typography.body, marginBottom: Spacing.xxl, fontVariant: ['tabular-nums'] },
  breathCircleWrap: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  breathCircleOuter: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
  },
  breathCircleInner: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.9,
  },
  phaseLabel: { fontSize: 20, fontWeight: '700', color: '#fff' },

  doneIconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  doneActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xxxl, width: '100%' },

  dotsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stepOf: { ...Typography.bodySm, marginBottom: Spacing.xxl, fontWeight: '600' },
  groundingIconCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  groundingCount: { fontSize: 36, fontWeight: 'bold' },
  groundingPrompt: { fontSize: 22, textAlign: 'center', marginTop: Spacing.xl, lineHeight: 30 },

  bodyPartLabel: { ...Typography.display, textAlign: 'center', marginTop: Spacing.sm, marginBottom: 14 },
  progressTrack: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: Spacing.xxxl, marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 4 },
});
