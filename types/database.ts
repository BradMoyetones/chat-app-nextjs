export interface ConversationFull {
    id: number
    title: string | null
    isGroup: boolean
    createdAt: string // o Date si lo parseás
    creatorId: number
    participants: {
        id: number
        userId: number
        conversationId: number
        joinedAt: string // o Date
        deletedAt: string | null // o Date | null
        user: {
        id: number
        firstName: string
        lastName: string
        }
    }[]
    messages: {
        id: number
        content: string
        senderId: number
        conversationId: number
        createdAt: string // o Date
        updatedAt: string // o Date
        deleted: boolean
    }[]
}
