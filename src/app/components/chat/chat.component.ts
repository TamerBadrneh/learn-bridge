import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,   // *ngIf, *ngFor, [ngClass], etc.
    FormsModule     // [(ngModel)]
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  chats: any[] = [];
  messages: any[] = [];
  selectedChatId: number | null = null;
  selectedSessionId: number | null = null;
  selectedChatName = '';
  newMessage = '';

  loadingCancel = false;
  loadingFinish = false;

  // ⚠️ Make sure this matches your @RequestMapping("/api/sessions") in Spring
  private baseUrl = 'http://localhost:8080/api/session';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchChats();
  }

  fetchChats() {
    this.http
      .get<any[]>('http://localhost:8080/api/chat/my-chats', {
        withCredentials: true,
      })
      .subscribe({
        next: (data) => {
          // only keep those whose sessionStatus === 'ONGOING'
          this.chats = data.filter(chat => chat.sessionStatus === 'ONGOING');
        },
        error: (err) => console.error('Failed to fetch chats:', err),
      });
  }

  selectChat(chat: any) {
    this.selectedChatId    = chat.chatId;
    this.selectedSessionId = chat.sessionId;
    this.selectedChatName  = chat.participantName;
    this.fetchMessages(chat.chatId);
  }

  fetchMessages(chatId: number) {
    this.http
      .get<any[]>(`http://localhost:8080/api/chat/all-messages/${chatId}`, {
        withCredentials: true,
      })
      .subscribe({
        next: (data) => (this.messages = data),
        error: (err) => console.error('Failed to fetch messages:', err),
      });
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.selectedChatId === null) return;

    const body = { content: this.newMessage };
    this.http
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
            sender: 'LEARNER',
            senderName: sentMsg.senderName,
          });
          this.newMessage = '';
        },
        error: (err) => console.error('Failed to send message:', err),
      });
  }

  onCancelSession() {
    if (this.selectedSessionId === null) return;

    this.loadingCancel = true;
    this.http
      .put<any>(
        `${this.baseUrl}/cancel-session/${this.selectedSessionId}`,
        {},
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          alert('Session cancelled successfully.');
          window.location.reload();
        },
        error: (err) => {
          console.error('Error cancelling session', err);
          alert('Failed to cancel session.');
          this.loadingCancel = false;
        },
      });
  }

  onFinishSession() {
    if (this.selectedSessionId === null) return;

    this.loadingFinish = true;
    this.http
      .put<any>(
        `${this.baseUrl}/finish-session/${this.selectedSessionId}`,
        {},
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          alert('Session finished successfully.');
          window.location.reload();
        },
        error: (err) => {
          console.error('Error finishing session', err);
          alert('Failed to finish session.');
          this.loadingFinish = false;
        },
      });
  }
}
