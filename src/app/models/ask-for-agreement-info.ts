export interface AskForAgreementInfo {
  agreementId:       number;
  instructorId:      number;
  postId:            number | null;
  learnerId:         number;
  sessionsNumber:    number;
  ratingsNumber:     number;
  averageRating:     number;
  category:          string;
  subject:           string;
  description:       string;
  learnerName:       string;
  instructorName:    string;
  instructorBio:     string;
}