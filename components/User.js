import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { UserType } from "../UserContext";

const User = ({ item }) => {
    const { userId, setUserId } = useContext(UserType);

    const [requestSent, setRequestSent] = useState(false);

    const sendFollow = async (currentUserId, selectedUserId) => {
        try {
            const response = await axios.post("http://192.168.43.186:3000/follow", {
                currentUserId,
                selectedUserId,
            });

            if (response.status === 200) {
                setRequestSent(true);
            }
        } catch (error) {
            console.log("error message", error);
        }
    };

    const handleUnfollow = async (targetId) => {
        try {
            const response = await axios.post("http://192.168.43.186:3000/users/unfollow", {
                loggedInUserId: userId,
                targetUserId: targetId,
            });

            if (response.status === 200) {
                setRequestSent(false);
            }
        } catch (error) {
            console.log("Error", error);
        }
    };

    useEffect(() => {
        setRequestSent(false);
    }, [userId, item]);

    return (
        <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        resizeMode: "contain",
                    }}
                    source={{
                        uri: "https://cdn-icons-png.flaticon.com/128/149/149071.png",
                    }}
                />

                <Text style={{ fontSize: 15, fontWeight: "500", flex: 1 }}>
                    {item?.name}
                </Text>

                {requestSent || item?.followers?.includes(userId) ? (
                    <Pressable
                        onPress={() => handleUnfollow(item?._id)}
                        style={{
                            borderColor: "#D0D0D0",
                            borderWidth: 1,
                            padding: 10,
                            marginLeft: 10,
                            width: 100,
                            borderRadius: 8,
                            marginTop: 17,
                        }}
                    >
                        <Text
                            style={{ textAlign: "center", fontSize: 15, fontWeight: "bold" }}
                        >
                            Following
                        </Text>
                    </Pressable>
                ) : (
                    <Pressable
                        onPress={() => sendFollow(userId, item._id)}
                        style={{
                            borderColor: "#D0D0D0",
                            borderWidth: 1,
                            padding: 10,
                            marginLeft: 10,
                            width: 100,
                            borderRadius: 8,
                            marginTop: 17,
                        }}
                    >
                        <Text
                            style={{ textAlign: "center", fontSize: 15, fontWeight: "bold" }}
                        >
                            Follow
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

export default User;

const styles = StyleSheet.create({});
