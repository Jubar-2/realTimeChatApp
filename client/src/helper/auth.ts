import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { signUpSchema } from "@/schema/Sign-up";
import { z } from "zod";
import { BaseUrl } from "@/constant"
import type { signInSchema } from '@/schema/Sign-in';

type CheckAuthPayload = { id: number };

export function useSignUp() {
  return useMutation({
    mutationFn: (data: z.infer<typeof signUpSchema>) => {
      return axios.post(BaseUrl + '/api/v1/user/registration', data);
    }
  });
}


export function useSignIn() {
  return useMutation({
    mutationFn: (data: z.infer<typeof signInSchema>) => {
      return axios.post(BaseUrl + '/api/v1/user/login', data);
    },
  });
}

export function useCheckAuthorize() {
  return useMutation<void, AxiosError, CheckAuthPayload>({
    mutationFn: (data) => {
      return axios.post(BaseUrl + '/api/v1/user/checkauthorize', data);
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: () => {
      return axios.post(BaseUrl + '/api/v1/user/refreshtoken');
    }
  });
} 