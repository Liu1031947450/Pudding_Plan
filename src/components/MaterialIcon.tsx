import React from 'react';
import { Text, TextStyle } from 'react-native';

interface MaterialIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

// Material Icons 映射表
const iconMap: Record<string, string> = {
  // 导航图标
  'edit_note': '\uE8FF',
  'calendar_today': '\uE935',
  'group': '\uE7EF',
  'person': '\uE7FD',

  // 其他常用图标
  'settings': '\uE8B8',
  'notifications': '\uE7F4',
  'add': '\uE145',
  'spa': '\uE3E3',
  'self_improvement': '\uEAF4',
  'favorite': '\uE87E',
  'star': '\uE838',
  'check_circle': '\uE86C',
  'arrow_forward': '\uE5E1',
  'arrow_back': '\uE5E0',
  'more_vert': '\uE5D4',
  'local_florist': '\uE313',
  'auto_awesome': '\uE885',
  'lightbulb': '\uE0F0',
  'emoji_events': '\uEA25',
  'workspace_premium': '\uE8E8',
  'celebration': '\uEA65',
};

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  size = 24,
  color = '#000',
  style,
}) => {
  const iconCode = iconMap[name] || '\uE5C3'; // 默认图标

  return (
    <Text
      style={[
        {
          fontFamily: 'Material Icons',
          fontSize: size,
          color,
        },
        style,
      ]}
    >
      {iconCode}
    </Text>
  );
};
