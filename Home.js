import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Modal,
    SafeAreaView,
    Platform,
    StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
    const [tasks, setTasks] = useState([]);
    const [taskText, setTaskText] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [editingTask, setEditingTask] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem("tasks");
            if (storedTasks) setTasks(JSON.parse(storedTasks));
        } catch (error) {
            console.log("Error loading tasks", error);
        }
    };

    const saveTasks = async (newTasks) => {
        try {
            await AsyncStorage.setItem("tasks", JSON.stringify(newTasks));
            setTasks(newTasks);
        } catch (error) {
            console.log("Error saving tasks", error);
        }
    };

    const addTask = () => {
        if (!taskText.trim()) return;
        const newTask = {
            id: Date.now().toString(),
            text: taskText,
            done: false,
            priority,
        };
        const newTasks = [...tasks, newTask];
        saveTasks(newTasks);
        resetModal();
    };

    const deleteTask = (id) => {
        const newTasks = tasks.filter((task) => task.id !== id);
        saveTasks(newTasks);
    };

    const toggleTask = (id) => {
        const newTasks = tasks.map((task) =>
            task.id === id ? { ...task, done: !task.done } : task
        );
        saveTasks(newTasks);
    };

    const startEditTask = (task) => {
        setEditingTask(task);
        setTaskText(task.text);
        setPriority(task.priority);
        setModalVisible(true);
    };

    const updateTask = () => {
        const newTasks = tasks.map((t) =>
            t.id === editingTask.id ? { ...t, text: taskText, priority } : t
        );
        saveTasks(newTasks);
        resetModal();
    };

    const resetModal = () => {
        setEditingTask(null);
        setTaskText("");
        setPriority("Medium");
        setModalVisible(false);
    };

    const clearCompleted = () => {
        const newTasks = tasks.filter((task) => !task.done);
        saveTasks(newTasks);
    };

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });

    const completedCount = tasks.filter((t) => t.done).length;
    const pendingCount = tasks.length - completedCount;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.home}>
                {/* Modern Header */}
                <View style={styles.headerCard}>
                    <View style={styles.headerTop}>
                        <Text style={styles.greeting}>Taskify</Text>
                        <Text style={styles.date}>{today}</Text>
                    </View>
                    <View style={styles.summary}>
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryCount}>{completedCount}</Text>
                            <Text style={styles.summaryLabel}>Completed</Text>
                        </View>
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryCount}>{pendingCount}</Text>
                            <Text style={styles.summaryLabel}>Pending</Text>
                        </View>
                    </View>
                </View>

                {/* Task List */}
                <FlatList
                    data={tasks}
                    keyExtractor={(item) => item.id}
                    style={{ marginTop: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.taskItem}>
                            <TouchableOpacity
                                onPress={() => toggleTask(item.id)}
                                style={[styles.checkbox, item.done && styles.checkboxDone]}
                            >
                                {item.done && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[styles.taskText, item.done && styles.taskTextDone]}
                                    onPress={() => startEditTask(item)}
                                >
                                    {item.text}
                                </Text>
                                <Text style={styles.priority}>⚡ {item.priority}</Text>
                            </View>
                            <TouchableOpacity onPress={() => deleteTask(item.id)}>
                                <Text style={styles.deleteBtn}>🗑</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                {completedCount > 0 && (
                    <TouchableOpacity style={styles.clearBtn} onPress={clearCompleted}>
                        <Text style={styles.clearBtnText}>Clear Completed</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setEditingTask(null);
                        setTaskText("");
                        setPriority("Medium");
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.addButtonText}>＋</Text>
                </TouchableOpacity>

                {/* Modal */}
                <Modal visible={modalVisible} transparent animationType="fade">
                    <View style={styles.modalView}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>
                                {editingTask ? "Edit Task" : "Add Task"}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={taskText}
                                onChangeText={setTaskText}
                                placeholder="Enter task..."
                                placeholderTextColor="#aaa"
                            />
                            <View style={styles.priorityRow}>
                                {["Low", "Medium", "High"].map((level) => (
                                    <TouchableOpacity
                                        key={level}
                                        style={[
                                            styles.priorityButton,
                                            priority === level && styles.prioritySelected,
                                        ]}
                                        onPress={() => setPriority(level)}
                                    >
                                        <Text
                                            style={[
                                                styles.priorityButtonText,
                                                priority === level && { color: "#fff", fontWeight: "bold" },
                                            ]}
                                        >
                                            {level}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: "#aaa" }]}
                                    onPress={resetModal}
                                >
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: "#ED1B59" }]}
                                    onPress={editingTask ? updateTask : addTask}
                                >
                                    <Text style={styles.modalButtonText}>
                                        {editingTask ? "Update" : "Save"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    home: { flex: 1, padding: 15 },

    // Modern Header
    headerCard: {
        backgroundColor: "#ED1B59",
        borderRadius: 20,
        padding: 20,
        marginTop: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 5,
    },
    headerTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    greeting: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    date: { fontSize: 16, color: "#FFD6E0" },
    summary: { flexDirection: "row", justifyContent: "space-between" },
    summaryBox: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 5,
    },
    summaryCount: { fontSize: 22, fontWeight: "bold", color: "#fff" },
    summaryLabel: { fontSize: 14, color: "#FFD6E0", marginTop: 4 },

    taskItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#ED1B59",
        borderRadius: 6,
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxDone: { backgroundColor: "#ED1B59" },
    checkmark: { color: "#fff", fontWeight: "bold" },
    taskText: { fontSize: 16, color: "#333" },
    taskTextDone: { textDecorationLine: "line-through", color: "gray" },
    priority: { fontSize: 12, color: "#888" },
    deleteBtn: { fontSize: 18, color: "red", marginLeft: 10 },

    clearBtn: {
        backgroundColor: "#eee",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10,
    },
    clearBtnText: { color: "#333" },

    addButton: {
        position: "absolute",
        right: 20,
        bottom: 30,
        backgroundColor: "#ED1B59",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    addButtonText: { fontSize: 30, color: "#fff" },

    modalView: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        backgroundColor: "#fff",
        padding: 20,
        width: "85%",
        borderRadius: 12,
        elevation: 5,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 15,
        color: "#000",
    },
    priorityRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    priorityButton: {
        borderWidth: 1,
        borderColor: "#ED1B59",
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    prioritySelected: { backgroundColor: "#ED1B59" },
    priorityButtonText: { color: "#ED1B59", fontWeight: "600" },
modalView: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.25)",
  justifyContent: "center",
  alignItems: "center",
},
modalBox: {
  backgroundColor: "#fff",
  width: "75%",
  borderRadius: 20,
  padding: 20,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 8,
  elevation: 6,
},
modalTitle: {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 15,
  textAlign: "center",
  color: "#333",
},
input: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 12,
  padding: 10,
  fontSize: 16,
  marginBottom: 15,
  color: "#000",
},
priorityRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 20,
},
priorityButton: {
  flex: 1,
  marginHorizontal: 4,
  borderWidth: 1,
  borderColor: "#ED1B59",
  borderRadius: 10,
  paddingVertical: 6,
  alignItems: "center",
},
prioritySelected: { backgroundColor: "#ED1B59" },
priorityButtonText: { color: "#ED1B59", fontWeight: "600" },
modalActions: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 10,
},
modalButton: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 10,
  marginHorizontal: 5,
  alignItems: "center",
},
modalButtonText: { color: "#fff", fontWeight: "bold" },

});
