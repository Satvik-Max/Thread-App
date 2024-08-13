import User from "../components/User"
import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { UserType } from "../UserContext";

const ActivityScreen = () => {
    const [selectedButton, setSelectedButton] = useState("people");
    const [users, setUsers] = useState([]);
    const { userId, setUserId } = useContext(UserType);

    const handleButtonClick = (buttonName) => {
        setSelectedButton(buttonName);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.userId;
                setUserId(userId);
                const response = await axios.get(`http://192.168.43.186:3000/user/${userId}`);
                setUsers(response.data);
            } catch (error) {
                console.log("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [selectedButton, setUserId]);

    return (
        <ScrollView style={{ marginTop: 50 }}>
            <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Activity</Text>

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-around",
                        marginTop: 12,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => handleButtonClick("people")}
                        style={[
                            styles.button,
                            selectedButton === "people" && styles.selectedButton,
                        ]}
                    >
                        <Text style={[styles.buttonText, selectedButton === "people" && styles.selectedButtonText]}>People</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleButtonClick("all")}
                        style={[
                            styles.button,
                            selectedButton === "all" && styles.selectedButton,
                        ]}
                    >
                        <Text style={[styles.buttonText, selectedButton === "all" && styles.selectedButtonText]}>All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleButtonClick("requests")}
                        style={[
                            styles.button,
                            selectedButton === "requests" && styles.selectedButton,
                        ]}
                    >
                        <Text style={[styles.buttonText, selectedButton === "requests" && styles.selectedButtonText]}>Requests</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    {selectedButton === "people" && (
                        <View style={{ marginTop: 20 }}>
                            {users?.map((item, index) => (
                                <User key={index} item={item} />
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    button: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "white",
        borderColor: "#D0D0D0",
        borderRadius: 6,
        borderWidth: 0.7,
    },
    selectedButton: {
        backgroundColor: "black",
    },
    buttonText: {
        textAlign: "center",
        fontWeight: "bold",
        color: "black",
    },
    selectedButtonText: {
        color: "white",
    },
});

export default ActivityScreen;
