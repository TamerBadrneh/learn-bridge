import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ChatFilterPipe } from './Chat Filter Pipe.component';
import { Router } from '@angular/router';
import { ReportService } from '../report/Report Service.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatFilterPipe],
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
  chatSearchTerm: string = '';
  selectedFilter: 'ONGOING' | 'FINISHED' | 'CANCELLED' | 'ALL' = 'ALL';

  loadingCancel = false;
  loadingFinish = false;

  private baseUrlForSession = 'http://localhost:8080/api/session';
  private baseUrlForChat = 'http://localhost:8080/api/chat';
  private baseUrlForFiles = 'http://localhost:8080/api/file';

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router,
    private reportService: ReportService
  ) {}

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
          this.messages.push({
            fileName: res.fileName,
            fileType: res.fileType,
            fileData: res.fileData,
            timestamp: res.uploadedAt,
            isSender: true,
          });
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
          this.applyFilter(); // Apply filter after loading
        },
        error: (err) => console.error('Failed to fetch chats:', err),
      });
  }

  applyFilter() {
    console.log(this.chats);
    return this.selectedFilter === 'ALL'
      ? this.chats
      : this.chats.filter((chat) => chat.sessionStatus === this.selectedFilter);
  }

  setFilter(status: 'ONGOING' | 'FINISHED' | 'CANCELLED' | 'ALL') {
    this.selectedFilter = status;
    this.applyFilter();
  }

  selectChat(chat: any) {
    this.selectedChatId = chat.chatId;
    this.selectedSessionId = chat.sessionId;
    this.selectedChatName = chat.participantName;
    this.fetchMessages(chat.chatId);
  }

  fetchMessages(chatId: number) {
    const messages$ = this.http.get<any[]>(
      `${this.baseUrlForChat}/all-messages/${chatId}`,
      {
        withCredentials: true,
      }
    );

    const files$ = this.http.get<any[]>(
      `${this.baseUrlForFiles}/chat-files/${chatId}`,
      {
        withCredentials: true,
      }
    );

    Promise.all([messages$.toPromise(), files$.toPromise()])
      .then(([messages = [], files = []]) => {
        const formattedMessages = (messages || []).map((msg) => ({
          type: 'message',
          text: msg.content,
          timestamp: msg.sentAt,
          isSender: msg.senderId === this.currentUserId,
          senderName: msg.senderName,
        }));

        const formattedFiles = (files || []).map((file) => ({
          type: 'file',
          fileName: file.fileName,
          fileType: file.fileType,
          fileData: file.fileData,
          timestamp: file.uploadedAt,
          isSender: file.senderId === this.currentUserId,
        }));

        const merged = [...formattedMessages, ...formattedFiles];
        this.messages = merged.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      })
      .catch((err) => console.error('Failed to fetch chat content:', err));
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

  navigateToReport() {
    this.reportService.setChatId(this.selectedChatId!);
    const path =
      this.authService.userData.role.toLowerCase() === 'learner'
        ? '/learner/report-user'
        : '/instructor/report-user';
    this.router.navigate([path]);
  }

  isSessionInactive(): boolean {
    const selectedChat = this.chats.find(
      (chat) => chat.chatId === this.selectedChatId
    );
    const status = selectedChat?.sessionStatus;
    console.log('Session status:', status);
    return status === 'CANCELLED' || status === 'FINISHED';
  }
}
