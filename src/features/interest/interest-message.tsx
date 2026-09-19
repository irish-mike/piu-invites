import "server-only";

import { cacheLife, io } from "next/cache";
import type { ReactElement } from "react";

import { getSubmissionEmails } from "@/integrations/formspark";
import { getInterestMessage } from "./interest";

const messageClasses = "absolute inset-x-0 top-2 text-center font-sans text-xs leading-4 text-muted";

async function getCachedInterestMessage(): Promise<string | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 600 });

  const submissions = await getSubmissionEmails();
  if (!submissions.ok) {
    console.warn("Interest count unavailable", { reason: submissions.reason, status: submissions.status });
    return null;
  }

  return getInterestMessage(submissions.emails);
}

export async function InterestMessage(): Promise<ReactElement | null> {
  await io();
  const isInterestEnabled = Boolean(process.env.FORMSPARK_API_TOKEN?.trim());
  if (!isInterestEnabled) return null;

  const message = await getCachedInterestMessage();
  return message ? <p className={messageClasses}>{message}</p> : null;
}
