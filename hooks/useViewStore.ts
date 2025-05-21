import { create } from "zustand";

type ViewType = "chat" | "settings" | "profile" | "none";

type Store = {
    type: ViewType;
    chatId?: number; // se mantiene aunque el type no sea "chat"
    setView: (view: ViewType) => void;
    setChat: (chatId: number) => void;
};

export const useViewStore = create<Store>((set) => ({
    type: "none",
    chatId: undefined,
    setView: (type) => set({ type }),
    setChat: (chatId) => set({ chatId, type: "chat" }),
}));
