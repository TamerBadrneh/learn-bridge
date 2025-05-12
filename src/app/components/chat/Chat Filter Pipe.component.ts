import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chatFilter',
  standalone: true,
})
export class ChatFilterPipe implements PipeTransform {
  transform(chats: any[], searchTerm: string): any[] {
    if (!searchTerm) return chats;
    const term = searchTerm.toLowerCase();
    return chats.filter((chat) =>
      (chat.participantName || '').toLowerCase().includes(term)
    );
  }
}
