import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private chatId: number | null = null;

  setChatId(id: number) {
    this.chatId = id;
  }

  getChatId(): number | null {
    return this.chatId;
  }
}
