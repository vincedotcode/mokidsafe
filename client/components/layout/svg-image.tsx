import React from "react";
import { SvgUri } from "react-native-svg";
import { StyleSheet, View } from "react-native";

export default function SvgImage({ uri }: { uri: string }) {
  return (
    <View style={styles.container}>
      <SvgUri
        width={80}
        height={80}
        uri={uri}
        onError={(e) => console.log("SVG loading error:", e)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
