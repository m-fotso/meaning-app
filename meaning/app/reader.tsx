import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context';
import AnnotationMenu from '@/components/annotationMenu';

const Reader: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
           <AnnotationMenu />
          <Text style={styles.title}>title</Text>
          <Text style={styles.paragraph}>
            placement for the reader 
          </Text>
        </ScrollView>

       
      </View>
    </SafeAreaView>
  );
};

export default Reader;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#EEE",
  },
  container: {
    flex: 1,
    position: "relative",
  },
  content: {
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
});
