export const deleteChat = async (_id: string) => {};
export const getRecentChats = async (_userId: string, _limit: number) => ({ chats: [] as any[], hasMore: false });
export const getUserChats = async (_userId: string) => ({ chats: [] as any[], hasMore: false });
export const updateChatPinned = async (id: string, isPinned: boolean) => ({ id, isPinned });
export const updateChatTitle = async (id: string, title: string) => ({ id, title });
export const updateChatVisibility = async (id: string, visibility: string) => ({ id, visibility });
