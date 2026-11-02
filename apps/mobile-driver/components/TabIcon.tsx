import { View, Text } from 'react-native';

interface TabIconProps {
  name: string;
  focused: boolean;
}

export function TabIcon({ name, focused }: TabIconProps) {
  const icons: Record<string, string> = {
    truck: '🚛',
    camera: '📷',
    signature: '✍️',
    user: '👤',
  };
  
  return (
    <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 24 : 20 }}>{icons[name] || '●'}</Text>
    </View>
  );
}