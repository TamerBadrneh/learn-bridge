import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LearnerOfferService {
  private storageKey = 'learnerOfferInfo';

  setOfferInfo(data: any, notificationId?: number): void {
    const combinedData = notificationId ? { ...data, notificationId } : data;
    localStorage.setItem(this.storageKey, JSON.stringify(combinedData));
  }

  getOfferInfo(): any {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  clearOfferInfo(): void {
    localStorage.removeItem(this.storageKey);
  }
}
