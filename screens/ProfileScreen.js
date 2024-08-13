import { StyleSheet, Text, View, Image, Pressable, ScrollView } from "react-native";
import React, { useEffect, useState, useContext , useCallback } from "react";
import axios from "axios";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreen = () => {
  const [user, setUser] = useState("");
  const navigation = useNavigation()
  const { userId, setUserId } = useContext(UserType);
  const [posts, setposts] = useState([])
  const fetchPost = async () => {
    try {
      const response = await axios.get(
        `http://192.168.46.86:3000/get-postss/${userId}`
      );
      if (!response) {
        console.log(" Error after Fetch ");
      }
      setposts(response.data)
    } catch (error) {
      console.log("error in fetching post ", error);
    }
  };
  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `http://192.168.46.86:3000/profile/${userId}`
      );
      const { user } = response.data;
      setUser(user);
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    fetchProfile();
    fetchPost();
  }, []);
  useFocusEffect(
    useCallback(() => {
      fetchPost();
    }, [])
  );
  const logout = () => {
    clearAuthToken();
  }
  const clearAuthToken = async () => {
    await AsyncStorage.removeItem("authToken");
    console.log("Cleared auth token");
    navigation.replace("Login")
  }
  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `http://192.168.46.86:3000/posts/${postId}/${userId}/like`
      );
      const updatedPost = response.data;

      const updatedPosts = posts?.map((post) =>
        post?._id === updatedPost._id ? updatedPost : post
      );

      setposts(updatedPosts);
    } catch (error) {
      console.log("Error liking the post", error);
    }
  };
  const handleDislike = async (postId) => {
    try {
      const response = await axios.put(
        `http://192.168.46.86:3000/posts/${postId}/${userId}/unlike`
      );
      const updatedPost = response.data;
      const updatedPosts = posts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      );
      console.log("updated ", updatedPosts)

      setposts(updatedPosts);
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };
  return (
    <ScrollView style={{ marginTop: 10, flex: 1, backgroundColor: "white" }}>
      <View style={{ marginTop: 55, padding: 15 }}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>{user?.name}</Text>
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: "#D0D0D0",
              }}
            >
              <Text>Threads.net</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 20, marginTop: 15 }}>
            <View>
              <Image
                style={{ width: 60, height: 60, borderRadius: 30, resizeMode: "contain" }}
                source={{ uri: "https://cdn-icons-png.flaticon.com/128/149/149071.png" }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 15, fontWeight: "400" }}>BTech.</Text>
              <Text style={{ fontSize: 15, fontWeight: "400" }}>Movie Buff | Musical Nerd</Text>
              <Text style={{ fontSize: 15, fontWeight: "400" }}>Love Yourself</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 15 }}>
            <Text style={{ color: "gray", fontSize: 15, marginTop: 10 }}>
              {user?.followers?.length} followers
            </Text>
            <Text style={{ color: "gray", fontSize: 15, marginTop: 10 }}>
              {posts?.length} Posts
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20 }}>
            <Pressable
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 10,
                borderColor: "#D0D0D0",
                borderWidth: 1,
                borderRadius: 5,
              }}
            >
              <Text>Edit Profile</Text>
            </Pressable>

            <Pressable
              onPress={logout}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 10,
                borderColor: "#D0D0D0",
                borderWidth: 1,
                borderRadius: 5,
              }}
            >
              <Text>Logout</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <View
                key={index}
                style={{
                  padding: 15,
                  borderColor: "#D0D0D0",
                  borderTopWidth: 1,
                  flexDirection: "row",
                  gap: 10,
                  marginVertical: 10,
                }}
              >
                <View>
                  <Image
                    style={{ width: 40, height: 40, borderRadius: 20, resizeMode: "contain" }}
                    source={{ uri: "https://cdn-icons-png.flaticon.com/128/149/149071.png" }}
                  />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: "bold", marginBottom: 4 }}>
                    {post.user.name}
                  </Text>
                  <Text>{post.content}</Text>
                  <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 15,
                }}
              >
                {post?.likes?.includes(userId) ? (
                  <AntDesign
                    onPress={() => handleDislike(post?._id)}
                    name="heart"
                    size={18}
                    color="red"
                  />
                ) : (
                  <AntDesign
                    onPress={() => handleLike(post?._id)}
                    name="hearto"
                    size={18}
                    color="black"
                  />
                )}

                <FontAwesome name="comment-o" size={18} color="black" />

                <Ionicons name="share-social-outline" size={18} color="black" />
              </View>

              <Text style={{ marginTop: 7, color: "gray" }}>
                {post?.likes?.length} likes • {post?.replies?.length} reply
              </Text>
                </View>
              </View>              
            ))
          ) : (
            <Text>No posts to display.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
