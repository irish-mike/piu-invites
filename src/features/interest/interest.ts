import { registrationSchema } from "@/features/registration/registration-schema";

const visibilityThreshold = 30;
const milestoneStep = 10;

export function countUniqueEmails(emails: readonly unknown[]): number {
  const uniqueEmails = new Set<string>();

  for (const email of emails) {
    const normalized = registrationSchema.shape.email.safeParse(email);
    if (normalized.success) uniqueEmails.add(normalized.data);
  }

  return uniqueEmails.size;
}

export function getInterestMessage(emails: readonly unknown[]): string | null {
  const count = countUniqueEmails(emails);
  if (count < visibilityThreshold) return null;

  const milestone = Math.floor(count / milestoneStep) * milestoneStep;
  return `${milestone}+ spirits are interested`;
}
