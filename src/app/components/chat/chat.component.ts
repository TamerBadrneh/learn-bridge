import { Component, OnInit } from '@angular/core';
import { ChatService } from './ChatService';
import { ChatMessage } from './ChatMessage';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  messages$: Observable<ChatMessage[]> | undefined;
  messageText = '';
  chatId = 'example_chat_id'; // Replace with actual chatId

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.messages$ = this.chatService.getMessages(this.chatId);
  }

  sendMessage() {
    if (!this.messageText.trim()) return;
    const msg: ChatMessage = {
      sender_id: 1,
      sender_name: 'You',
      content: this.messageText,
      sent_at: new Date(),
    };
    this.chatService.sendMessage(this.chatId, msg);
    this.messageText = '';
  }
}
