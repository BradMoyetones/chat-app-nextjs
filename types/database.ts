export interface ConversationFull extends Conversation {
    participants: ParticipantFull[]
    messages: MessageFull[]
    unseenCount: number
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    createdAt: string;
};

export interface UserSearh extends User {
    sentRequests: ContactRequest[]
    receivedRequests: ContactRequest[]
};

export interface Message {
    id: number;
    createdAt: string;
    content: string | null;
    senderId: number;
    conversationId: number;
    updatedAt: string | null;
    deleted: boolean;
};

export interface MessageFull extends Message {
    reads: MessageRead[]
};
export interface Attachment {
    id: number;
    messageId: number;
    userId: number;
    url: string;
    type: string;
    uploadedAt: string;
};
export interface MessageRead {
    id: number;
    messageId: number;
    userId: number;
    readAt: string;
};
export interface Participant {
    id: number;
    conversationId: number;
    userId: number;
    joinedAt: string;
    deletedAt: string | null;
};

export interface ParticipantFull extends Participant {
    user: User
};

export interface Conversation {
    id: number;
    createdAt: string;
    title: string | null;
    isGroup: boolean;
    creatorId: number;
};

export interface ContactRequest {
    id: number;
    senderId: number;
    receiverId: number;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: string;
    respondedAt: string
}