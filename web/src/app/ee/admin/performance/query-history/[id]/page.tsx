"use client";
import { use } from "react";

import { Text } from "@opal/components";
import Spacer from "@/refresh-components/Spacer";
import Title from "@/components/ui/title";
import Separator from "@/refresh-components/Separator";
import { ChatSessionSnapshot, MessageSnapshot } from "../../usage/types";
import { FiBook } from "react-icons/fi";
import { timestampToReadableDate } from "@/lib/dateUtils";
import BackButton from "@/refresh-components/buttons/BackButton";
import { FeedbackBadge } from "../FeedbackBadge";
import { errorHandlingFetcher } from "@/lib/fetcher";
import useSWR from "swr";
import { ErrorCallout } from "@/components/ErrorCallout";
import { ThreeDotsLoader } from "@/components/Loading";
import CardSection from "@/components/admin/CardSection";

function MessageDisplay({ message }: { message: MessageSnapshot }) {
  return (
    <div>
      <p className="text-xs font-bold mb-1">
        {message.message_type === "user" ? "User" : "AI"}
      </p>
      <Text as="p" preventMarkdown>
        {message.message}
      </Text>
      {message.documents.length > 0 && (
        <div className="flex flex-col gap-y-2 mt-2">
          <p className="font-bold text-xs">Reference Documents</p>
          {message.documents.slice(0, 5).map((document) => {
            return (
              <span className="flex" key={document.document_id}>
                <Text as="p" preventMarkdown>
                  <FiBook
                    className={
                      "my-auto mr-1" + (document.link ? " text-link" : " ")
                    }
                  />
                  {document.link ? (
                    <span className="text-link">
                      <a href={document.link} target="_blank" rel="noreferrer">
                        {document.semantic_identifier}
                      </a>
                    </span>
                  ) : (
                    document.semantic_identifier
                  )}
                </Text>
              </span>
            );
          })}
        </div>
      )}
      {message.feedback_type && (
        <div className="mt-2">
          <p className="font-bold text-xs">Feedback</p>
          {message.feedback_text && (
            <Text as="p" preventMarkdown>
              {message.feedback_text}
            </Text>
          )}
          <div className="mt-1">
            <FeedbackBadge feedback={message.feedback_type} />
          </div>
        </div>
      )}
      <Separator />
    </div>
  );
}

export default function QueryPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const {
    data: chatSessionSnapshot,
    isLoading,
    error,
  } = useSWR<ChatSessionSnapshot>(
    `/api/admin/chat-session-history/${params.id}`,
    errorHandlingFetcher
  );

  if (isLoading) {
    return <ThreeDotsLoader />;
  }

  if (!chatSessionSnapshot || error) {
    return (
      <ErrorCallout
        errorTitle="Something went wrong :("
        errorMsg={`Failed to fetch chat session - ${error}`}
      />
    );
  }

  return (
    <main className="pt-4 mx-auto container">
      <BackButton />

      <CardSection className="mt-4">
        <Title>Chat Session Details</Title>

        <Spacer rem={0.25} />
        <Text as="p" preventMarkdown>
          {chatSessionSnapshot.assistant_name}
        </Text>
        <Spacer rem={0.25} />
        <Text as="p" preventMarkdown>
          {chatSessionSnapshot.user_email &&
            `${chatSessionSnapshot.user_email}, `}
          {timestampToReadableDate(chatSessionSnapshot.time_created)},{" "}
          {chatSessionSnapshot.flow_type}
        </Text>

        <Separator />

        <div className="flex flex-col">
          {chatSessionSnapshot.messages.map((message) => {
            return <MessageDisplay key={message.id} message={message} />;
          })}
        </div>
      </CardSection>
    </main>
  );
}
