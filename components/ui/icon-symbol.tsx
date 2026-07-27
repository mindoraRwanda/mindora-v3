// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Partial<Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>>;
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'expand-more',
  'book.fill': 'menu-book',
  'bubble.left.and.bubble.right': 'forum',
  'bubble.left.and.bubble.right.fill': 'forum',
  'message.fill': 'chat-bubble',
  'calendar': 'event',
  'chart.bar': 'assessment',
  'gamecontroller': 'sports-esports',
  'person.2': 'people',
  'person.fill': 'person',
  'person.crop.circle': 'account-circle',
  'phone': 'phone',
  'phone.fill': 'phone',
  'info.circle': 'info',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'lock.fill': 'lock',
  'envelope.fill': 'email',
  'doc.text.fill': 'description',
  'tray.fill': 'inbox',
  'arrow.up.right': 'north-east',
  'arrow.left': 'arrow-back',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'magnifyingglass': 'search',
  'ellipsis': 'more-horiz',
  'wind': 'air',
  'leaf.fill': 'eco',
  'brain.head.profile': 'psychology',
  'sparkles': 'auto-awesome',
  'paperplane': 'send',
  'clock': 'schedule',
  'clock.fill': 'schedule',
  'exclamationmark.triangle.fill': 'warning',
  'shield.fill': 'shield',
  'star.fill': 'star',
  'trash.fill': 'delete',
  'gear': 'settings',
  'bell.fill': 'notifications',
  'circle.fill': 'circle',
  'video.fill': 'videocam',
  'location.fill': 'place',
  'mic.fill': 'mic',
  'rectangle.portrait.and.arrow.right': 'logout',
  'hand.raised.fill': 'pan-tool',
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'figure.stand': 'accessibility',
  'eye.fill': 'visibility',
  'ear.fill': 'hearing',
  'nose.fill': 'spa',
  'mouth.fill': 'restaurant',
  'arrow.clockwise': 'refresh',
} as IconMapping;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] ?? 'help-outline'} style={style} />;
}
