import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';

export interface SignatureCanvasRef {
  getSignature: () => { isEmpty: boolean; points: Array<{ x: number; y: number }> };
  toBase64: () => string;
  clear: () => void;
}

export interface SignatureCanvasProps {
  style?: any;
  onSignatureChange?: (isEmpty: boolean) => void;
}

export const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  ({ style, onSignatureChange }, ref) => {
    const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);
    const [isEmpty, setIsEmpty] = useState(true);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (e: any) => {
          const { locationX, locationY } = e.nativeEvent;
          setPoints(prev => [...prev, { x: locationX, y: locationY }]);
          setIsEmpty(false);
          if (onSignatureChange) onSignatureChange(false);
        },
        onPanResponderMove: (e: any) => {
          const { locationX, locationY } = e.nativeEvent;
          setPoints(prev => [...prev, { x: locationX, y: locationY }]);
        },
        onPanResponderRelease: () => {},
      })
    ).current;

    const clear = useCallback(() => {
      setPoints([]);
      setIsEmpty(true);
      if (onSignatureChange) onSignatureChange(true);
    }, [onSignatureChange]);

    const getSignature = useCallback(() => ({
      isEmpty,
      points,
    }), [isEmpty, points]);

    const toBase64 = useCallback(() => {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }, []);

    useImperativeHandle(ref, () => ({
      getSignature,
      toBase64,
      clear,
    }));

    return (
      <View
        {...panResponder.panHandlers}
        style={[
          styles.canvas,
          style,
          { backgroundColor: '#fafafa', position: 'relative' },
        ]}
      >
        {points.map((p, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x - 2,
              top: p.y - 2,
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#1e293b',
            }}
          />
        ))}
        {isEmpty && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Sign here</Text>
          </View>
        )}
      </View>
    );
  }
);

SignatureCanvas.displayName = 'SignatureCanvas';

const styles = StyleSheet.create({
  canvas: { flex: 1, width: '100%' },
  placeholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 16, color: '#94a3b8', fontStyle: 'italic' },
});

export default SignatureCanvas;
