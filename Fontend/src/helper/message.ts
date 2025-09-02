import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const useGetAllUsers = () => {
    return useQuery({
        queryKey: ["get-all-users"],
        queryFn: async () => {
            return axios.get("/api/v1/user/all-user");
        },
    })

}

const useGetMessages = (conversationId: Number) => {
    return useQuery({
        queryKey: ["get-message"],
        queryFn: async () => {
            return await axios.get(`/api/v1/message/${conversationId}/get-message`);
        },
    })
}

export { useGetAllUsers, useGetMessages }