import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ChatFilterPipe } from './Chat Filter Pipe.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../report/Report Service.component';

// Documented By Tamer
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatFilterPipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
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

  /**
   * Initialize the component by fetching user data and chat history.
   * After user data is fetched, we fetch the chat history.
   * The chat history is fetched based on the chat id passed in the route.
   * If the chat id is not present in the route, the chat history is not fetched.
   * If the user data fetch fails, an error message is logged to the console.
   */
  ngOnInit(): void {
    this.authService.fetchUserData().subscribe({
      next: () => {
        this.currentUserId = this.authService.userData.userId;
        this.fetchChats();
      },
      error: (err) => console.error('Error fetching user data:', err),
    });
    this.chatId = Number(this.route.snapshot.paramMap.get('chatId'));
  }

  /**
   * Handles the event of a user selecting a file to upload.
   * If a file is selected, it is stored in the component's state and
   * the `uploadFile` method is called to upload the file to the server.
   * @param event The event object containing the selected file.
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadFile();
    }
  }

  /**
   * Uploads the selected file to the server for the currently selected chat.
   * The file is uploaded using a POST request with the chat ID included in the URL.
   * On successful upload, the file information is added to the messages list.
   * If the upload fails, an error is logged to the console.
   *
   * Prerequisites:
   * - `selectedFile` should be set with the file to be uploaded.
   * - `selectedChatId` should be set with the ID of the chat to which the file is being uploaded.
   *
   * No operation is performed if `selectedFile` or `selectedChatId` is not set.
   */
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

  /**
   * Fetches the chats for the currently logged-in user.
   *
   * Depending on the user's role, either the my-chats or the review-chat
   * endpoint is used to fetch the chats. The chats are stored in the `chats` array
   * and the `applyFilter` method is called to filter the chats based on the current
   * filter term.
   *
   * Prerequisites:
   * - `authService.userData` should be set with the user's data.
   * - `baseUrlForChat` should be set with the base URL for the chat API.
   * - `chatId` should be set with the ID of the chat for which the messages are being fetched,
   *   if the user is an admin.
   *
   * No operation is performed if any of the above prerequisites are not met.
   */
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

  /**
   * Applies the current filter to the chats and returns the filtered chats.
   *
   * If the filter is set to 'ALL', all chats are returned.
   * Otherwise, the chats are filtered by their session status, which should
   * match the current filter.
   *
   * @returns {any[]} The filtered chats.
   */
  applyFilter() {
    return this.selectedFilter === 'ALL'
      ? this.chats
      : this.chats.filter((chat) => chat.sessionStatus === this.selectedFilter);
  }

  /**
   * Sets the current filter and applies it to the chats.
   *
   * The filter is set to the given status, and the chats are filtered
   * accordingly by calling the `applyFilter` method.
   *
   * @param status The status to filter the chats by.
   */
  setFilter(status: 'ONGOING' | 'FINISHED' | 'CANCELLED' | 'ALL') {
    this.selectedFilter = status;
    this.applyFilter();
  }

  /**
   * Selects a chat and updates the component's state with the chat details.
   *
   * This method sets the selected chat ID, session ID, participant name,
   * learner name, and instructor name based on the provided chat object.
   * It also fetches the messages associated with the selected chat.
   *
   * @param chat The chat object containing details of the chat to be selected.
   */
  selectChat(chat: any) {
    this.selectedChatId = chat.chatId;
    this.selectedSessionId = chat.sessionId;
    this.selectedChatName = chat.participantName;
    this.learnerName = chat.learnerName;
    this.instructorName = chat.instructorName;
    this.fetchMessages(chat.chatId);
  }

  /**
   * Fetches the messages and files associated with a chat.
   *
   * This method makes two API calls to fetch the messages and files associated
   * with the given chat ID. The messages and files are then merged into a single
   * array, sorted by timestamp, and stored in the `messages` array.
   *
   * If any of the API calls fail, an error is logged to the console.
   *
   * @param chatId The ID of the chat to fetch messages and files for.
   */
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
      })
      .catch((err) => console.error('Failed to fetch chat content:', err));
  }

  /**
   * Sends a message to the selected chat.
   *
   * This method makes a POST request to the backend to send the message.
   * If the message is successfully sent, it is added to the `messages` array.
   * If the message fails to send, an error is logged to the console.
   */
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

  /**
   * Cancels the selected session.
   *
   * This method makes a PUT request to the backend to cancel the session.
   * If the session is successfully cancelled, a success alert is shown and
   * the page is reloaded to reflect the change.
   * If the session fails to cancel, an error alert is shown and the loading
   * indicator is stopped.
   */
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

  /**
   * Finishes the selected session.
   *
   * This method makes a PUT request to the backend to finish the session.
   * If the session is successfully finished, a success alert is shown and
   * the page is reloaded to reflect the change.
   * If the session fails to finish, an error alert is shown and the loading
   * indicator is stopped.
   */
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

  /**
   * Navigates to the report user page based on the current user's role.
   *
   * This method sets the chat ID in the report service and navigates to the
   * appropriate report-user page. The navigation path is determined by the
   * user's role, directing learners to '/learner/report-user' and instructors
   * to '/instructor/report-user'.
   */
  navigateToReport() {
    this.reportService.setChatId(this.selectedChatId!);
    const path =
      this.authService.userData.role.toLowerCase() === 'learner'
        ? '/learner/report-user'
        : '/instructor/report-user';
    this.router.navigate([path]);
  }

  /**
   * Navigates to the learner rate-instructor page.
   *
   * This method sets the chat ID in the session storage and navigates to the
   * learner rate-instructor page. If the selected chat ID is null, the method
   * does nothing.
   */
  navigateToRateInstructor() {
    if (this.selectedChatId === null) return;
    sessionStorage.setItem('rateChatId', this.selectedChatId.toString());
    this.router.navigate(['/learner/rate-instructor']);
  }

  /**
   * Determines if the selected chat is inactive.
   *
   * This method checks if the selected chat's session status is either
   * 'CANCELLED' or 'FINISHED'. If the selected chat ID is null, the method
   * returns false. Otherwise, it returns true if the session is inactive
   * and false if it is active.
   *
   * @returns {boolean} True if the selected chat is inactive, false otherwise.
   */
  isSessionInactive(): boolean {
    const selectedChat = this.chats.find(
      (chat) => chat.chatId === this.selectedChatId
    );
    const status = selectedChat?.sessionStatus;
    console.log('Session status:', status);
    return status === 'CANCELLED' || status === 'FINISHED';
  }
}
