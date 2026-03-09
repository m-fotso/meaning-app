import React, { useRef, useState, useEffect } from "react";
import {  StyleSheet, View, Text, Pressable, Animated, Dimensions, PanResponder, PanResponderInstance, PanResponderGestureState,
} from "react-native";
import { Provider, Button } from "react-native-paper";
import { getNotesForBook, Note } from "@/services/notesService";
import { useAuth } from "@/app/context/AuthContext";



const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MENU_WIDTH = Math.min(320, SCREEN_WIDTH * 0.8); // adjust menu width

const AnnotationMenu: React.FC = () => {
  const {user, initializing} = useAuth(); 
  const [visible, setVisible] = useState<boolean>(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  //bookID placeholder (change to take from the reader data)
  const bookID = "book"
  //chapter placeholder (change to take from the reader data)
  const chapter = 1;

  // 0 = hidden (off-screen right), 1 = shown
  const anim = useRef<Animated.Value>(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  useEffect(()=>{
    if(initializing) {
        return;
      }
    if(!user){
      setNotes([]);
      return;
    }

    let mounted = true;
    const fetchNotes = async () => {
      setLoading(true); 
      const result = await getNotesForBook(user.uid, bookID, chapter)
      if (!mounted) return;
      if(result.success && result.notes){
        setNotes(result.notes);
      } else {
        console.error("didn't fetch notes:", result.error);
        setNotes([]);
      }
      setLoading(false);
    };
    fetchNotes();

    return() => {
      mounted = false;
    };
  }, [user, initializing, bookID, chapter])

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [MENU_WIDTH, 0],
  });

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const toggleMenu = () => setVisible((v) => !v);

  // PanResponder to detect a left-swipe in the right-edge zone
  const pan = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState: PanResponderGestureState) => {
        return Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_evt, gestureState: PanResponderGestureState) => {
        if (gestureState.dx < -50) {
          openMenu();
        }
      },
    })
  ).current;


  

  return (
    <Provider>
      <View style={styles.root}>
        {/* Right-edge invisible swipe zone */}
        <View style={styles.swipeZone} {...pan.panHandlers} />

        {/* Optional toggle button */}
        <View style={styles.topControls}>
          <Button mode="outlined" onPress={toggleMenu}>
            {visible ? "Hide menu" : "Show menu"}
          </Button>
        </View>

        {/* Overlay (blocks touches beneath and closes on press) */}
        {visible && <Pressable style={styles.overlay} onPress={closeMenu} />}

        {/* Animated sliding menu */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              width: MENU_WIDTH,
              transform: [{ translateX }],
            },
          ]}
        >
          <Pressable style={styles.menuInner} >
            <Text style={styles.menuTitle}>Annotations</Text>

            {loading && <Text>Loading notes…</Text>}

            {!loading && notes.length === 0 && <Text>No annotations yet.</Text>}

            {notes.map((n) => (
              <View key={n.id} style={styles.listItem}>
                <Text style={styles.listText}>{n.highlightedText}</Text>
                {n.userNote ? <Text>{n.userNote}</Text> : null}
                <Text style={styles.pageInfo}>Page {n.pageNumber ?? "?"}</Text>
              </View>
            ))}


            <Text style={styles.hint}>Tap anywhere on this menu to close it</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Provider>
  );
};

export default AnnotationMenu;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topControls: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeZone: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 28,
  },
  overlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  menuContainer: {
    position: "absolute",
    top: 60,
    right: 0,
    bottom: 60,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  menuInner: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  listText: {
    fontSize: 16,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: "#666",
  },
  pageInfo:{
    color: "#666", 
    fontSize: 12 
  }
});
