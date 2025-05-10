import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ChatMessage } from './ChatMessage';
import { Chat } from './Chat';
import { Observable, of } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class ChatService {
//   constructor(private firestore: AngularFirestore) {}

//   sendMessage(chatId: string, message: ChatMessage) {
//     // return this.firestore
//     //   .collection(`chats/${chatId}/messages`)
//     //   .add({ ...message, sent_at: new Date() });
//   }

//   getMessages(chatId: string) {
//     // return this.firestore
//     //   .collection<ChatMessage>(`chats/${chatId}/messages`, (ref) =>
//     //     ref.orderBy('sent_at')
//     //   )
//     //   .valueChanges();
//   }

//   getAllChats() {
//     // return this.firestore
//     //   .collection<Chat>('chats')
//     //   .valueChanges({ idField: 'chat_id' });
//   }
// }

// Mock Up till backend be ready for...
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private mockMessages = [
    { sender: 'user1', message: 'Hello!', timestamp: new Date() },
    { sender: 'user2', message: 'Hey there!', timestamp: new Date() },
  ];

  getMessages(chatId: string): Observable<any[]> {
    return of(this.mockMessages);
  }

  sendMessage(chatId: string, message: any): Promise<void> {
    this.mockMessages.push(message);
    return Promise.resolve();
  }
}
