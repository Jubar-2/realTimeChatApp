import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { BaseUrl } from "@/constant"

const useGetAllUsers = () => {
    return useQuery({
        queryKey: ["get-all-users"],
        queryFn: async () => {
            return axios.get(BaseUrl + "/api/v1/user/all-user");
        },
    })

}

const useGetMessages = (conversationId: Number) => {
    return useQuery({
        queryKey: ["get-message"],
        queryFn: async () => {
            return await axios.get(BaseUrl + `/api/v1/message/${conversationId}/get-message`);
        },
    });
}

function useFiendUsers(search: string) {
    return useQuery({
        queryKey: ["fiend-users", search],
        queryFn: async () => {
            const { data } = await axios.get(BaseUrl + `/api/v1/user/fiend-users`, {
                params: { search },
            });
            return data;
        }
    });
}

export { useGetAllUsers, useGetMessages, useFiendUsers }