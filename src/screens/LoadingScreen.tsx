import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Surface } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import * as Animatable from 'react-native-animatable';

const LoadingScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        style={styles.content}
      >
        <Animatable.Text
          animation="fadeInUp"
          delay={500}
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Story4Love
        </Animatable.Text>
        
        <Animatable.Text
          animation="fadeInUp"
          delay={700}
          style={[styles.subtitle, { color: theme.colors.onSurface }]}
        >
          记录每一个美好瞬间
        </Animatable.Text>
        
        <Animatable.View
          animation="fadeInUp"
          delay={1000}
          style={styles.loaderContainer}
        >
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.loader}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            正在初始化...
          </Text>
        </Animatable.View>
      </Animatable.View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 48,
    textAlign: 'center',
    opacity: 0.8,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoadingScreen;
