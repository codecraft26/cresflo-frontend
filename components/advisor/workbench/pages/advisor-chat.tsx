"use client";

import { AdvisorChatPanel } from "@/components/advisor/advisor-chat-panel";

import { useDashboardContext } from "../context";
import { RoleGuard } from "../shell";

function DashboardAdvisorChatPage() {
  const {
    chatActivity,
    conversation,
    conversationHistory,
    connectionState,
    isConversationHistoryLoading,
    isOrganizationView,
    lastAnswer,
    lastProvider,
    organizationSession,
    pendingChatMessage,
    sendSocketMessage,
    setChatMessage,
    setErrorMessage,
    setChatActivity,
    setLastAnswer,
    setPendingChatMessage,
    setStreamedAnswer,
    streamedAnswer,
    chatMessage,
    connectSocket,
  } = useDashboardContext();

  if (!isOrganizationView) {
    return (
      <RoleGuard
        allow={false}
        title="Advisor chat belongs to the organization workspace."
        description="Switch to the organization view to create conversations and stream tenant-scoped answers."
      />
    );
  }

  return (
      <AdvisorChatPanel
        session={organizationSession}
        connectionState={connectionState}
        conversation={conversation}
        conversationHistory={conversationHistory}
        isConversationHistoryLoading={isConversationHistoryLoading}
        chatMessage={chatMessage}
        pendingChatMessage={pendingChatMessage}
        activityLabel={chatActivity}
        streamedAnswer={streamedAnswer}
        lastAnswer={lastAnswer}
        lastProvider={lastProvider}
        onCreateConversation={() => {
          try {
            setChatActivity("Starting a new conversation");
            setPendingChatMessage("");
            sendSocketMessage({ type: "create_conversation" });
          } catch (error) {
            setChatActivity(null);
            setErrorMessage(
              error instanceof Error ? error.message : "Could not create conversation.",
            );
          }
        }}
        onReconnect={() => {
          if (organizationSession) {
            void connectSocket(organizationSession);
          }
        }}
        onChatMessageChange={setChatMessage}
        onSendMessage={() => {
          if (!conversation) {
            setErrorMessage("Create a conversation first.");
            return;
          }

          try {
            const message = chatMessage.trim();
            setStreamedAnswer("");
            setLastAnswer(null);
            setPendingChatMessage(message);
            setChatActivity("Sending your message");
            sendSocketMessage({
              type: "send_message",
              conversationId: conversation.id,
              message,
            });
            setChatMessage("");
          } catch (error) {
            setPendingChatMessage("");
            setChatActivity(null);
            setErrorMessage(
              error instanceof Error ? error.message : "Could not send message.",
            );
          }
        }}
        onApplyPrompt={setChatMessage}
        onSelectConversation={(conversationId) => {
          try {
            setChatActivity("Opening conversation");
            setPendingChatMessage("");
            setLastAnswer(null);
            sendSocketMessage({
              type: "get_conversation",
              conversationId,
            });
          } catch (error) {
            setChatActivity(null);
            setErrorMessage(
              error instanceof Error ? error.message : "Could not open conversation.",
            );
          }
        }}
        onLoadConversation={() => {
          if (!conversation) {
            setErrorMessage("Create a conversation first.");
            return;
          }

          try {
            setChatActivity("Reloading conversation");
            sendSocketMessage({
              type: "get_conversation",
              conversationId: conversation.id,
            });
          } catch (error) {
            setChatActivity(null);
            setErrorMessage(
              error instanceof Error ? error.message : "Could not reload conversation.",
            );
          }
        }}
      />
  );
}

export { DashboardAdvisorChatPage };
