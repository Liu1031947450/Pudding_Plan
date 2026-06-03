import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Avatar, Button } from '../../../components/common';

interface ProfileEditSheetProps {
  onSave: (data: { nickname: string; bio: string }) => void;
  initialData: {
    nickname: string;
    bio: string;
    /** 用户头像 URL，最大长度 1000 字符 */
    avatar?: string;
  };
}

export const ProfileEditSheet: React.FC<ProfileEditSheetProps> = ({
  onSave,
  initialData,
}) => {
  const [nickname, setNickname] = useState(initialData.nickname);
  const [bio, setBio] = useState(initialData.bio);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <Avatar
          name={nickname}
          size="xlarge"
          style={styles.avatar}
          uri={initialData.avatar}
        />
        <TouchableOpacity style={styles.editAvatarButton}>
          <MaterialIcons
            name="photo-camera"
            size={20}
            color={Colors.onPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.avatarHint}>点击更换头像</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>昵称</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="输入你的昵称"
              placeholderTextColor={Colors.outline}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>个性签名</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="介绍一下自己吧..."
              placeholderTextColor={Colors.outline}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </View>

      <Button
        title="保存修改"
        onPress={() => onSave({ nickname, bio })}
        style={styles.saveButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    marginBottom: Spacing.md,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 35,
    right: '35%',
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  avatarHint: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    opacity: 0.7,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textAreaWrapper: {
    height: 120,
    alignItems: 'flex-start',
  },
  input: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
  textArea: {
    flex: 1,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
