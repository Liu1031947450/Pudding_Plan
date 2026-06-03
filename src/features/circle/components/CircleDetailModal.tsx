import React from 'react';
import { Modal, SafeAreaView, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/theme';
import { CircleDetailContent } from './CircleDetailContent';

interface CircleDetailModalProps {
  visible: boolean;
  onClose: () => void;
  circleId: string | null;
  onDataChange?: () => Promise<void>;
}

export const CircleDetailModal: React.FC<CircleDetailModalProps> = ({
  visible,
  onClose,
  circleId,
  onDataChange,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {circleId && (
          <CircleDetailContent
            circleId={circleId}
            onDataChange={onDataChange}
            onClose={onClose}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
