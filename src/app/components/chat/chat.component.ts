import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ChatFilterPipe } from './Chat Filter Pipe.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../report/Report Service.component';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Documented By Tamer
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatFilterPipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  // Data members
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
  chatId: number;
  learnerName: string = '';
  instructorName: string = '';
  loadingCancel = false;
  loadingFinish = false;

  // Live chat functionality
  private messagePollingSubscription?: Subscription;
  private chatListPollingSubscription?: Subscription;
  private lastMessageTimestamp: Date | null = null;
  private readonly POLLING_INTERVAL = 2000; // 2 seconds

  private readonly baseUrlForSession =
    'https://learn-bridge-back-end.onrender.com/api/session';
  private readonly baseUrlForChat =
    'https://learn-bridge-back-end.onrender.com/api/chat';
  private readonly baseUrlForFiles =
    'https://learn-bridge-back-end.onrender.com/api/file';

  // Constructor with Injected Values for use...
  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router,
    private reportService: ReportService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.authService.fetchUserData().subscribe({
      next: () => {
        this.currentUserId = this.authService.userData.userId;
        this.fetchChats();
        this.startChatListPolling();
      },
      error: (err) => console.error('Error fetching user data:', err),
    });
    this.chatId = Number(this.route.snapshot.paramMap.get('chatId'));
  }

  ngOnDestroy(): void {
    this.stopMessagePolling();
    this.stopChatListPolling();
  }

  private startMessagePolling(): void {
    if (this.messagePollingSubscription) {
      this.messagePollingSubscription.unsubscribe();
    }

    this.messagePollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(switchMap(() => this.fetchNewMessages()))
      .subscribe({
        next: (newData) => {
          if (
            newData &&
            (newData.messages.length > 0 || newData.files.length > 0)
          ) {
            this.updateMessagesWithNewData(newData);
          }
        },
        error: (err) => console.error('Error polling messages:', err),
      });
  }

  private stopMessagePolling(): void {
    if (this.messagePollingSubscription) {
      this.messagePollingSubscription.unsubscribe();
      this.messagePollingSubscription = undefined;
    }
  }

  private startChatListPolling(): void {
    if (this.chatListPollingSubscription) {
      this.chatListPollingSubscription.unsubscribe();
    }

    this.chatListPollingSubscription = interval(this.POLLING_INTERVAL * 2) // Poll chat list less frequently
      .pipe(switchMap(() => this.fetchChatsData()))
      .subscribe({
        next: (data) => {
          if (data) {
            const newChats = Array.isArray(data) ? data : [data];
            this.updateChatList(newChats);
          }
        },
        error: (err) => console.error('Error polling chat list:', err),
      });
  }

  private stopChatListPolling(): void {
    if (this.chatListPollingSubscription) {
      this.chatListPollingSubscription.unsubscribe();
      this.chatListPollingSubscription = undefined;
    }
  }

  private fetchNewMessages() {
    if (!this.selectedChatId) return Promise.resolve(null);

    const timestamp = this.lastMessageTimestamp
      ? this.lastMessageTimestamp.toISOString()
      : '';

    const messages$ = this.http.get<any[]>(
      `${this.baseUrlForChat}/all-messages/${this.selectedChatId}${
        timestamp ? `?after=${timestamp}` : ''
      }`,
      { withCredentials: true }
    );

    const files$ = this.http.get<any[]>(
      `${this.baseUrlForFiles}/chat-files/${this.selectedChatId}${
        timestamp ? `?after=${timestamp}` : ''
      }`,
      { withCredentials: true }
    );

    return Promise.all([messages$.toPromise(), files$.toPromise()])
      .then(([messages = [], files = []]) => ({
        messages: messages || [],
        files: files || [],
      }))
      .catch((err) => {
        console.error('Failed to fetch new messages:', err);
        return null;
      });
  }

  private fetchChatsData() {
    let url = '';
    const role = this.authService.userData?.role?.toUpperCase();

    if (role === 'ADMIN')
      url = `https://learn-bridge-back-end.onrender.com/api/chat/admin/review-chat/${this.chatId}`;
    else url = `${this.baseUrlForChat}/my-chats`;

    return this.http
      .get<any>(url, { withCredentials: true })
      .toPromise()
      .catch((err) => {
        console.error('Failed to fetch chats:', err);
        return null;
      });
  }

  private updateMessagesWithNewData(newData: {
    messages: any[];
    files: any[];
  }): void {
    const formattedMessages = (newData.messages || []).map((msg) => ({
      type: 'message',
      text: msg.content,
      timestamp: new Date(msg.sentAt),
      isSender: msg.senderId === this.currentUserId,
      senderName: msg.senderName,
    }));

    const formattedFiles = (newData.files || []).map((file) => ({
      type: 'file',
      fileName: file.fileName,
      fileType: file.fileType,
      fileData: file.fileData,
      timestamp: new Date(file.uploadedAt),
      isSender: file.senderId === this.currentUserId,
    }));

    const newMessages = [...formattedMessages, ...formattedFiles];

    // Filter out messages that already exist
    const existingTimestamps = new Set(
      this.messages.map((msg) => msg.timestamp.getTime())
    );
    const uniqueNewMessages = newMessages.filter(
      (msg) => !existingTimestamps.has(msg.timestamp.getTime())
    );

    if (uniqueNewMessages.length > 0) {
      this.messages = [...this.messages, ...uniqueNewMessages].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Update last message timestamp
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage) {
        this.lastMessageTimestamp = new Date(lastMessage.timestamp);
      }

      // Auto-scroll to bottom on new messages
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  private updateChatList(newChats: any[]): void {
    // Update chat list without losing current selection
    const oldLength = this.chats.length;
    this.chats = newChats;

    // If new chats were added, apply filter
    if (newChats.length !== oldLength) {
      this.applyFilter();
    }
  }

  private scrollToBottom(): void {
    try {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
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
          const newFileMessage = {
            type: 'file',
            fileName: res.fileName,
            fileType: res.fileType,
            fileData: res.fileData,
            timestamp: new Date(res.uploadedAt),
            isSender: true,
          };

          this.messages.push(newFileMessage);
          this.lastMessageTimestamp = new Date(res.uploadedAt);
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (err) => {
          console.error('Upload failed:', err);
        },
      });
  }

  fetchChats() {
    let url = '';
    const role = this.authService.userData?.role?.toUpperCase();

    if (role === 'ADMIN')
      url = `https://learn-bridge-back-end.onrender.com/api/chat/admin/review-chat/${this.chatId}`;
    else url = `${this.baseUrlForChat}/my-chats`;

    this.http.get<any>(url, { withCredentials: true }).subscribe({
      next: (data) => {
        this.chats = Array.isArray(data) ? data : [data];
        console.log(this.chats);
        this.applyFilter();
      },
      error: (err) => console.error('Failed to fetch chats:', err),
    });
  }

  applyFilter() {
    return this.selectedFilter === 'ALL'
      ? this.chats
      : this.chats.filter((chat) => chat.sessionStatus === this.selectedFilter);
  }

  setFilter(status: 'ONGOING' | 'FINISHED' | 'CANCELLED' | 'ALL') {
    this.selectedFilter = status;
    this.applyFilter();
  }

  selectChat(chat: any) {
    // Stop polling for previous chat
    this.stopMessagePolling();

    this.selectedChatId = chat.chatId;
    this.selectedSessionId = chat.sessionId;
    this.selectedChatName = chat.participantName;
    this.learnerName = chat.learnerName;
    this.instructorName = chat.instructorName;
    this.lastMessageTimestamp = null;

    this.fetchMessages(chat.chatId).then(() => {
      // Start polling for new messages after initial load
      this.startMessagePolling();
    });
  }

  fetchMessages(chatId: number): Promise<void> {
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

    return Promise.all([messages$.toPromise(), files$.toPromise()])
      .then(([messages = [], files = []]) => {
        const formattedMessages = (messages || []).map((msg) => ({
          type: 'message',
          text: msg.content,
          timestamp: new Date(msg.sentAt),
          isSender: msg.senderId === this.currentUserId,
          senderName: msg.senderName,
        }));

        const formattedFiles = (files || []).map((file) => ({
          type: 'file',
          fileName: file.fileName,
          fileType: file.fileType,
          fileData: file.fileData,
          timestamp: new Date(file.uploadedAt),
          isSender: file.senderId === this.currentUserId,
        }));

        const merged = [...formattedMessages, ...formattedFiles];
        this.messages = merged.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Set last message timestamp
        if (this.messages.length > 0) {
          const lastMessage = this.messages[this.messages.length - 1];
          this.lastMessageTimestamp = new Date(lastMessage.timestamp);
        }

        // Scroll to bottom after loading messages
        setTimeout(() => this.scrollToBottom(), 100);
      })
      .catch((err) => {
        console.error('Failed to fetch chat content:', err);
        throw err;
      });
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.selectedChatId === null) return;

    const body = { content: this.newMessage };
    const messageToSend = this.newMessage;
    this.newMessage = ''; // Clear input immediately for better UX

    this.http
      .post<any>(
        `${this.baseUrlForChat}/send-message/${this.selectedChatId}`,
        body,
        { withCredentials: true }
      )
      .subscribe({
        next: (sentMsg) => {
          // DON'T add the message immediately to avoid duplicates
          // Instead, let the polling mechanism handle it or wait for server confirmation

          // Update the last message timestamp to ensure polling picks up the new message
          this.lastMessageTimestamp = new Date(sentMsg.sentAt);

          // Force a single fetch to get the latest messages including the one just sent
          this.fetchNewMessages().then((newData) => {
            if (
              newData &&
              (newData.messages.length > 0 || newData.files.length > 0)
            ) {
              this.updateMessagesWithNewData(newData);
            }
          });
        },
        error: (err) => {
          console.error('Failed to send message:', err);
          // Restore message on error
          this.newMessage = messageToSend;
        },
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
          // Refresh chat list instead of full page reload
          this.fetchChats();
          this.loadingCancel = false;
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
          // Refresh chat list instead of full page reload
          this.fetchChats();
          this.loadingFinish = false;
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

  navigateToRateInstructor() {
    if (this.selectedChatId === null) return;
    sessionStorage.setItem('rateChatId', this.selectedChatId.toString());
    this.router.navigate(['/learner/rate-instructor']);
  }

  isSessionInactive(): boolean {
    const selectedChat = this.chats.find(
      (chat) => chat.chatId === this.selectedChatId
    );
    const status = selectedChat?.sessionStatus;
    console.log('Session status:', status);
    return status === 'CANCELLED' || status === 'FINISHED';
  }

  // Track by function for better performance with ngFor
  trackByMessage(index: number, message: any): any {
    return message.timestamp ? message.timestamp.getTime() : index;
  }
}
