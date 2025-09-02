import type { UserStoreTypes } from '@/types/user';
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const useUserStore = create<UserStoreTypes>()(
    persist(
        (set) => ({
            user: null,
            isAuthorize: false,
            setUser: (user) => set({
                user: { ...user },
                isAuthorize: true,
            }),
            clearUser: () => set({
                user: null,
                isAuthorize: false,
            }),
        }),
        {
            name: "login-storage",
            storage: createJSONStorage(() => localStorage)
        },
    ),
)

export default useUserStore;