import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  chats: any[] = [];
  messages: any[] = [];
  selectedChatId: number | null = null;
  selectedChatName: string = '';
  newMessage: string = '';

  constructor(private _HttpClient: HttpClient) {}

  ngOnInit(): void {
    this.fetchChats();
  }

  fetchChats() {
    this._HttpClient
      .get<any[]>('http://localhost:8080/api/chat/my-chats', {
        withCredentials: true,
      })
      .subscribe({
        next: (data) => {
          this.chats = data;
        },
        error: (err) => {
          console.error('Failed to fetch chats:', err);
        },
      });
  }

  selectChat(chat: any) {
    this.selectedChatId = chat.chatId;
    this.selectedChatName = chat.participantName;
    this.fetchMessages(chat.chatId);
  }

  fetchMessages(chatId: number) {
    this._HttpClient
      .get<any[]>(`http://localhost:8080/api/chat/all-messages/${chatId}`, {
        withCredentials: true,
      })
      .subscribe({
        next: (data) => {
          this.messages = data;
        },
        error: (err) => {
          console.error('Failed to fetch messages:', err);
        },
      });
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.selectedChatId === null) return;

    const body = { content: this.newMessage };

    this._HttpClient
      .post<any>(
        `http://localhost:8080/api/chat/send-message/${this.selectedChatId}`,
        body,
        { withCredentials: true }
      )
      .subscribe({
        next: (sentMsg) => {
          this.messages.push({
            text: sentMsg.content,
            timestamp: sentMsg.sentAt,
            sender: 'LEARNER', // Adjust based on user role if needed
            senderName: sentMsg.senderName,
          });
          this.newMessage = '';
        },
        error: (err) => {
          console.error('Failed to send message:', err);
        },
      });
  }
}
