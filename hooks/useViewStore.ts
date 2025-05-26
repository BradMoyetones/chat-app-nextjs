import { create } from "zustand";

export type ViewType = "chat" | "settings" | "profile" | "theme" | "contacts" | "calls" | "none";

type Store = {
    type: ViewType;
    chatId: number | null; // se mantiene aunque el type no sea "chat"
    setView: (view: ViewType) => void;
    setChat: (chatId: number | null) => void;
};

export const useViewStore = create<Store>((set) => ({
    type: "chat",
    chatId: null,
    setView: (type) => set({ type }),
    setChat: (chatId) => set({ chatId, type: "chat" }),
}));
