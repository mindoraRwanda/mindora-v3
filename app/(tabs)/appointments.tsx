import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import {
  ApiError,
  Appointment,
  AppointmentStatus,
  SessionType,
  TherapistProfile,
  bookAppointment,
  cancelAppointment,
  getMyAppointments,
  getTherapistAvailability,
  getTherapists,
} from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/constants/theme';

// Filter values and the SessionType enum stay in English — they're matched against
// therapist data from the backend and sent back to it, so only the on-screen labels
// get translated.
const CATEGORIES = ['All', 'Anxiety', 'Depression', 'Trauma', 'Relationships', 'Stress'] as const;
const CATEGORY_LABEL_KEYS: Record<(typeof CATEGORIES)[number], string> = {
  All: 'appointments.categoryAll',
  Anxiety: 'appointments.categoryAnxiety',
  Depression: 'appointments.categoryDepression',
  Trauma: 'appointments.categoryTrauma',
  Relationships: 'appointments.categoryRelationships',
  Stress: 'appointments.categoryStress',
};

const SESSION_TYPES: { value: SessionType; labelKey: string; icon: 'video.fill' | 'message.fill' | 'location.fill' }[] = [
  { value: 'VIDEO', labelKey: 'appointments.sessionTypeVideo', icon: 'video.fill' },
  { value: 'CHAT', labelKey: 'appointments.sessionTypeChat', icon: 'message.fill' },
  { value: 'IN_PERSON', labelKey: 'appointments.sessionTypeInPerson', icon: 'location.fill' },
];

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  PENDING: '#F59E0B',
  CONFIRMED: '#10B981',
  COMPLETED: '#6D28D9',
  CANCELLED: '#EF4444',
};

function formatSlot(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { user, withAuth } = useAuth();
  const { t } = useLocale();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [bookingFor, setBookingFor] = useState<TherapistProfile | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [apptsRes, therapistsRes] = await withAuth((token) =>
        Promise.all([getMyAppointments(token, { limit: 20 }), getTherapists(token, { limit: 50 })])
      );
      setAppointments(apptsRes.appointments);
      setTherapists(therapistsRes.therapists);
    } catch (err) {
      console.warn('Failed to load appointment data', err);
    } finally {
      setLoading(false);
    }
  }, [withAuth]);

  useEffect(() => {
    if (user) loadData();
    else setLoading(false);
  }, [user, loadData]);

  const therapistById = useMemo(() => {
    const map = new Map<string, TherapistProfile>();
    therapists.forEach((therapist) => map.set(therapist.userId, therapist));
    return map;
  }, [therapists]);

  const filteredTherapists = useMemo(() => {
    let list = therapists;
    if (selectedCategory !== 'All') {
      list = list.filter((therapist) => therapist.specialisation?.toLowerCase().includes(selectedCategory.toLowerCase()));
    }
    if (search) {
      list = list.filter((therapist) => therapist.userName?.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  }, [therapists, search, selectedCategory]);

  const handleCancel = (appointment: Appointment) => {
    Alert.alert(t('appointments.cancelTitle'), t('appointments.cancelConfirm'), [
      { text: t('appointments.keepIt'), style: 'cancel' },
      {
        text: t('appointments.cancelSession'),
        style: 'destructive',
        onPress: async () => {
          try {
            await withAuth((token) => cancelAppointment(token, appointment.id, 'Cancelled by patient'));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadData();
          } catch (err) {
            Alert.alert(t('common.error'), err instanceof ApiError ? err.message : t('appointments.cancelFailed'));
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <EmptyState icon="calendar" title={t('appointments.signInTitle')} message={t('appointments.signInMsg')} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top || 60, paddingBottom: insets.bottom + 40 }}
        keyboardDismissMode="on-drag">
        <View style={styles.topSection}>
          <ThemedText type="title">{t('appointments.title')}</ThemedText>
          {appointments.length > 0 && (
            <View style={[styles.upcomingBox, { backgroundColor: colors.tintSolid }]}>
              <ThemedText style={styles.upcomingTitle}>{t('appointments.yourSessions')}</ThemedText>
              {appointments.slice(0, 3).map((appt) => (
                <TouchableOpacity activeOpacity={0.7}
                  key={appt.id}
                  style={styles.miniCard}
                  onLongPress={() => (appt.status === 'PENDING' || appt.status === 'CONFIRMED') && handleCancel(appt)}>
                  <View style={styles.miniInfo}>
                    <ThemedText style={styles.miniName}>
                      {therapistById.get(appt.therapistId)?.userName || t('appointments.therapistFallback')}
                    </ThemedText>
                    <ThemedText style={styles.miniDate}>{formatSlot(appt.slotStart)}</ThemedText>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: STATUS_COLOR[appt.status] + '30' }]}>
                    <ThemedText style={[styles.statusLabel, { color: STATUS_COLOR[appt.status] }]}>{appt.status}</ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
              <ThemedText style={styles.hint}>{t('appointments.cancelHint')}</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.stickyHeader}>
          <View style={[styles.searchBar, { backgroundColor: colors.tintSoft, borderColor: colors.border }]}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textMuted} />
            <TextInput
              placeholder={t('appointments.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity activeOpacity={0.7}
                key={cat}
                style={[
                  styles.catChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedCategory === cat && { backgroundColor: colors.tintSolid, borderColor: colors.tintSolid },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(cat);
                }}>
                <ThemedText style={[styles.catText, { color: colors.textMuted }, selectedCategory === cat && { color: '#fff' }]}>
                  {t(CATEGORY_LABEL_KEYS[cat] as any)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.list}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{t('appointments.availableTherapists')}</ThemedText>
          {loading ? (
            <ActivityIndicator color={colors.tint} style={{ marginTop: 20 }} />
          ) : filteredTherapists.length === 0 ? (
            <EmptyState icon="person.2" title={t('appointments.noTherapistsTitle')} message={t('appointments.noTherapistsMsg')} />
          ) : (
            filteredTherapists.map((therapist) => (
              <TouchableOpacity activeOpacity={0.7}
                key={therapist.id}
                style={[styles.therapistCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}
                onPress={() => setBookingFor(therapist)}>
                <View style={styles.cardTop}>
                  <View style={[styles.avatar, { backgroundColor: colors.tintSoft }]}>
                    <ThemedText style={{ fontSize: 22, fontWeight: 'bold', color: colors.tint }}>
                      {therapist.userName?.charAt(0) || 'T'}
                    </ThemedText>
                    {therapist.isAcceptingPatients && <View style={styles.verifiedBadge} />}
                  </View>
                  <View style={styles.cardInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.name}>{therapist.userName || t('appointments.professional')}</ThemedText>
                    <ThemedText style={[styles.specialization, { color: colors.tint }]}>{therapist.specialisation || t('appointments.generalTherapy')}</ThemedText>
                    {therapist.languages?.length > 0 && (
                      <ThemedText style={[styles.languages, { color: colors.textMuted }]}>
                        {t('appointments.speaks', { languages: therapist.languages.join(', ') })}
                      </ThemedText>
                    )}
                  </View>
                  <View style={[styles.bookBtn, { backgroundColor: colors.tintSoft }]}>
                    <IconSymbol name="calendar" size={20} color={colors.tint} />
                  </View>
                </View>
                {therapist.bio ? <ThemedText numberOfLines={2} style={[styles.bio, { color: colors.textMuted }]}>{therapist.bio}</ThemedText> : null}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <BookingModal
        therapist={bookingFor}
        onClose={() => setBookingFor(null)}
        onBooked={() => {
          setBookingFor(null);
          loadData();
        }}
      />
    </ThemedView>
  );
}

function BookingModal({
  therapist,
  onClose,
  onBooked,
}: {
  therapist: TherapistProfile | null;
  onClose: () => void;
  onBooked: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { withAuth } = useAuth();
  const { t } = useLocale();
  const [slots, setSlots] = useState<{ slotStart: string; slotEnd: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ slotStart: string; slotEnd: string } | null>(null);
  const [sessionType, setSessionType] = useState<SessionType>('VIDEO');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!therapist) return;
    setSelectedSlot(null);
    setLoadingSlots(true);
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 7 * 86400000).toISOString();
    withAuth((token) => getTherapistAvailability(token, therapist.userId, { from, to }))
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [therapist, withAuth]);

  if (!therapist) return null;

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      await withAuth((token) =>
        bookAppointment(token, {
          therapistId: therapist.userId,
          slotStart: selectedSlot.slotStart,
          slotEnd: selectedSlot.slotEnd,
          sessionType,
        })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('appointments.requestSentTitle'), t('appointments.requestSentMsg'));
      onBooked();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('appointments.bookingFailedTitle'), err instanceof ApiError ? err.message : t('appointments.bookingFailedGeneric'));
    } finally {
      setBooking(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.modalHandle} />
          <ThemedText type="defaultSemiBold" style={styles.modalTitle}>{therapist.userName || t('appointments.therapistFallback')}</ThemedText>
          <ThemedText style={[styles.modalSubtitle, { color: colors.textMuted }]}>{therapist.specialisation || t('appointments.generalTherapy')}</ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.modalSectionLabel}>{t('appointments.sessionType')}</ThemedText>
          <View style={styles.sessionRow}>
            {SESSION_TYPES.map((s) => (
              <TouchableOpacity activeOpacity={0.7}
                key={s.value}
                style={[
                  styles.sessionChip,
                  { borderColor: colors.border },
                  sessionType === s.value && { backgroundColor: colors.tintSolid, borderColor: colors.tintSolid },
                ]}
                onPress={() => setSessionType(s.value)}>
                <IconSymbol name={s.icon} size={16} color={sessionType === s.value ? '#fff' : colors.textMuted} />
                <ThemedText style={[styles.sessionLabel, sessionType === s.value ? { color: '#fff' } : { color: colors.text }]}>
                  {t(s.labelKey as any)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText type="defaultSemiBold" style={styles.modalSectionLabel}>{t('appointments.availableSlots')}</ThemedText>
          <ScrollView style={{ maxHeight: 220 }}>
            {loadingSlots ? (
              <ActivityIndicator color={colors.tint} style={{ marginTop: 20 }} />
            ) : slots.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: colors.textMuted }]}>{t('appointments.noSlots')}</ThemedText>
            ) : (
              slots.map((slot) => (
                <TouchableOpacity activeOpacity={0.7}
                  key={slot.slotStart}
                  style={[
                    styles.slotRow,
                    { borderColor: colors.border },
                    selectedSlot?.slotStart === slot.slotStart && { backgroundColor: colors.tintSoft, borderColor: colors.tint },
                  ]}
                  onPress={() => setSelectedSlot(slot)}>
                  <IconSymbol name="clock" size={16} color={colors.tint} />
                  <ThemedText style={{ marginLeft: 10 }}>{formatSlot(slot.slotStart)}</ThemedText>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button title={t('common.cancel')} variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <Button title={t('appointments.confirmBooking')} onPress={handleConfirm} loading={booking} disabled={!selectedSlot} style={{ flex: 2 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.sm },
  upcomingBox: { marginTop: Spacing.xl, borderRadius: Radius.xl, padding: Spacing.lg },
  upcomingTitle: { color: '#fff', fontSize: 13, marginBottom: Spacing.md, opacity: 0.8 },
  miniCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  miniInfo: { flex: 1 },
  miniName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  miniDate: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  statusTag: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.sm - 2 },
  statusLabel: { fontSize: 9, fontWeight: 'bold' },
  hint: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textAlign: 'center', marginTop: 4 },
  stickyHeader: { paddingVertical: Spacing.sm },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.xl, paddingHorizontal: Spacing.lg, borderRadius: Radius.lg, height: 50, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: Spacing.md, fontSize: 14 },
  categories: { marginTop: Spacing.md, paddingLeft: Spacing.xl },
  catChip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md, marginRight: Spacing.sm, borderWidth: 1 },
  catText: { ...Typography.bodySm, fontWeight: '500' },
  list: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.lg },
  therapistCard: { borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, ...Elevation.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#34D399', width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  cardInfo: { flex: 1, marginLeft: Spacing.lg },
  name: { fontSize: 16 },
  specialization: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  languages: { fontSize: 11, marginTop: Spacing.xs },
  bookBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },
  bio: { marginTop: Spacing.md, ...Typography.bodySm },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxxl + Spacing.sm },
  emptyText: { textAlign: 'center', marginTop: Spacing.xl, fontSize: 13 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: Spacing.xl },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(150,150,150,0.4)', alignSelf: 'center', marginBottom: Spacing.lg },
  modalTitle: { ...Typography.h2, textAlign: 'center' },
  modalSubtitle: { fontSize: 13, textAlign: 'center', marginTop: Spacing.xs, marginBottom: Spacing.xl },
  modalSectionLabel: { fontSize: 13, marginBottom: Spacing.md },
  sessionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  sessionChip: { flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
  sessionLabel: { fontSize: 13, fontWeight: '600', marginTop: Spacing.xs },
  slotRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: Radius.md + 2, borderWidth: 1, marginBottom: Spacing.sm },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
});
