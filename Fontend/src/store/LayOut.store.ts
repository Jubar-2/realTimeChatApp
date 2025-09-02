import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserConversation } from "./chat.store";


interface LayoutStore {
    // activeTab: string; // current active tab name
    selectedContact: UserConversation | null; // currently selected contact
    setSelectedContact: (contact: UserConversation) => void;
    // setActiveTab: (tab: string) => void; // note: should be string, not boolean
}

const useLayOutStore = create<LayoutStore>()(
    persist(
        (set) => ({
            // activeTab: "chats",
            selectedContact: null,
            setSelectedContact: (contact: UserConversation) => set({ selectedContact: contact }),
            // setActiveTab: (tab: boolean) => set({ activeTab: tab })
        }),
        {
            name: "layout-storage",
            storage: createJSONStorage(() => localStorage)
        }
    )
)

export default useLayOutStore;