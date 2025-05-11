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
  selectedChatName: string = '';
  selectedChatId: number | null = null;

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

  loadMessages(chatId: number) {
    this.selectedChatId = chatId;
    const chat = this.chats.find((c) => c.chatId === chatId);
    this.selectedChatName = chat?.participantName || 'Unknown';

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
}
