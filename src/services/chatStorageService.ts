import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { auth } from '../firebase';

export const getConversationMessages = async (conversationId: string) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  
  const messagesRef = collection(db, 'users', userId, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
