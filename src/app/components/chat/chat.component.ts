import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  currentUserId: number | null = null;
  selectedFile: File | null = null;

  loadingCancel = false;
  loadingFinish = false;

  private baseUrlForSession = 'http://localhost:8080/api/session';
  private baseUrlForChat = 'http://localhost:8080/api/chat';
  private baseUrlForFiles = 'http://localhost:8080/api/file';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.fetchUserData().subscribe({
      next: () => {
        this.currentUserId = this.authService.userData.userId;
        this.fetchChats();
      },
      error: (err) => console.error('Error fetching user data:', err),
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadFile();
    }
  }

  uploadFile() {
    if (!this.selectedFile || this.selectedChatId === null) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http
      .post<any>(
        `${this.baseUrlForFiles}/upload/${this.selectedChatId}`,
        formData,
        {
          withCredentials: true,
        }
      )
      .subscribe({
        next: (res) => {
          console.log('Upload success:', res);
        },
        error: (err) => {
          console.error('Upload failed:', err);
        },
      });
  }

  fetchChats() {
    this.http
      .get<any[]>(`${this.baseUrlForChat}/my-chats`, {
        withCredentials: true,
      })
      .subscribe({
        next: (data) => {
          this.chats = data;
        },
        error: (err) => console.error('Failed to fetch chats:', err),
      });
  }

  selectChat(chat: any) {
    this.selectedChatId = chat.chatId;
    this.selectedSessionId = chat.sessionId;
    this.selectedChatName = chat.participantName;
    this.fetchMessages(chat.chatId);
  }

  fetchMessages(chatId: number) {
    this.http
      .get<any[]>(`${this.baseUrlForChat}/all-messages/${chatId}`, {
        withCredentials: true,
      })
      .subscribe({
        next: (data) => {
          this.messages = data.map((msg) => ({
            ...msg,
            text: msg.content,
            timestamp: msg.sentAt,
            isSender: msg.senderId === this.currentUserId,
          }));
        },
        error: (err) => console.error('Failed to fetch messages:', err),
      });
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.selectedChatId === null) return;

    const body = { content: this.newMessage };
    this.http
      .post<any>(
        `${this.baseUrlForChat}/send-message/${this.selectedChatId}`,
        body,
        { withCredentials: true }
      )
      .subscribe({
        next: (sentMsg) => {
          this.messages.push({
            text: sentMsg.content,
            timestamp: sentMsg.sentAt,
            senderName: sentMsg.senderName,
            isSender: true,
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
        `${this.baseUrlForSession}/cancel-session/${this.selectedSessionId}`,
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
        `${this.baseUrlForSession}/finish-session/${this.selectedSessionId}`,
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
