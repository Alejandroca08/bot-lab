import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { restQuery } from '../lib/supabase';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';

export const ConversationContext = createContext(null);

export function ConversationProvider({ children }) {
  const auth = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationIdState] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = auth?.session?.access_token;

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  // Load conversations when active project changes
  useEffect(() => {
    if (!activeProject || !auth?.session) {
      setConversations([]);
      return;
    }

    const loadConversations = async () => {
      setLoading(true);

      const select = encodeURIComponent('*,messages(*),annotations(*)');
      const { data, error } = await restQuery(
        `/rest/v1/conversations?select=${select}&project_id=eq.${activeProject.id}&order=created_at.desc`,
        {},
        token
      );

      if (!error && data) {
        setConversations(data.map(normalizeConversation));
      }

      setLoading(false);
    };

    loadConversations();
  }, [activeProject?.id, auth?.session, token]);

  const createConversation = useCallback(async (projectId, simulatedPhoneNumber, customerName) => {
    const row = {
      project_id: projectId,
      user_id: auth?.session?.user?.id,
      simulated_phone_number: simulatedPhoneNumber,
      customer_name: customerName,
      bot_status: 'active',
    };

    const { data, error } = await restQuery(
      '/rest/v1/conversations?select=*',
      { method: 'POST', body: row, prefer: 'return=representation', single: true },
      token
    );

    if (error) {
      console.error('Failed to create conversation:', error.message);
      return null;
    }

    const conv = normalizeConversation({ ...data, messages: [], annotations: [] });
    setConversations((prev) => [conv, ...prev]);
    return conv;
  }, [auth?.session, token]);

  const addMessage = useCallback(async (conversationId, message) => {
    const row = {
      conversation_id: conversationId,
      sender: message.sender,
      type: message.type || 'text',
      content: message.content,
      metadata: message.metadata || {},
      status: message.status || 'sending',
    };

    const { data, error } = await restQuery(
      '/rest/v1/messages?select=*',
      { method: 'POST', body: row, prefer: 'return=representation', single: true },
      token
    );

    if (error) {
      console.error('Failed to add message:', error.message);
      return null;
    }

    const normalized = normalizeMessage(data);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, normalized] }
          : c
      )
    );
    return normalized;
  }, [token]);

  const updateMessageStatus = useCallback(async (conversationId, messageId, status) => {
    const { error } = await restQuery(
      `/rest/v1/messages?id=eq.${messageId}`,
      { method: 'PATCH', body: { status }, prefer: 'return=minimal' },
      token
    );

    if (error) {
      console.error('Failed to update message status:', error.message);
      return;
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, status } : m
              ),
            }
          : c
      )
    );
  }, [token]);

  const setBotStatus = useCallback(async (conversationId, status) => {
    const { error } = await restQuery(
      `/rest/v1/conversations?id=eq.${conversationId}`,
      { method: 'PATCH', body: { bot_status: status }, prefer: 'return=minimal' },
      token
    );

    if (error) {
      console.error('Failed to set bot status:', error.message);
      return;
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, botStatus: status } : c
      )
    );
  }, [token]);

  const addAnnotation = useCallback(async (conversationId, messageId, annotation) => {
    const row = {
      conversation_id: conversationId,
      message_id: messageId,
      user_id: auth?.session?.user?.id,
      category: annotation.category,
      severity: annotation.severity,
      note: annotation.note,
      suggestion: annotation.suggestion || '',
    };

    const { data, error } = await restQuery(
      '/rest/v1/annotations?select=*',
      { method: 'POST', body: row, prefer: 'return=representation', single: true },
      token
    );

    if (error) {
      console.error('Failed to add annotation:', error.message);
      return null;
    }

    const normalized = normalizeAnnotation(data);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, annotations: [...c.annotations, normalized] }
          : c
      )
    );
    return normalized;
  }, [auth?.session, token]);

  const removeAnnotation = useCallback(async (conversationId, annotationId) => {
    const { error } = await restQuery(
      `/rest/v1/annotations?id=eq.${annotationId}`,
      { method: 'DELETE' },
      token
    );

    if (error) {
      console.error('Failed to remove annotation:', error.message);
      return;
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, annotations: c.annotations.filter((a) => a.id !== annotationId) }
          : c
      )
    );
  }, [token]);

  const deleteConversation = useCallback(async (id) => {
    const { error } = await restQuery(
      `/rest/v1/conversations?id=eq.${id}`,
      { method: 'DELETE' },
      token
    );

    if (error) {
      console.error('Failed to delete conversation:', error.message);
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationIdState(null);
    }
  }, [activeConversationId, token]);

  const setActiveConversationId = useCallback((id) => {
    setActiveConversationIdState(id);
  }, []);

  const getConversationsForProject = useCallback(
    (projectId) => conversations.filter((c) => c.projectId === projectId),
    [conversations]
  );

  const value = useMemo(() => ({
    conversations,
    activeConversationId,
    activeConversation,
    loading,
    createConversation,
    addMessage,
    updateMessageStatus,
    setBotStatus,
    addAnnotation,
    removeAnnotation,
    deleteConversation,
    setActiveConversationId,
    getConversationsForProject,
  }), [
    conversations, activeConversationId, activeConversation, loading,
    createConversation, addMessage, updateMessageStatus, setBotStatus,
    addAnnotation, removeAnnotation, deleteConversation,
    setActiveConversationId, getConversationsForProject,
  ]);

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

function normalizeConversation(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    simulatedPhoneNumber: row.simulated_phone_number,
    customerName: row.customer_name,
    botStatus: row.bot_status,
    createdAt: row.created_at,
    messages: (row.messages || [])
      .map(normalizeMessage)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    annotations: (row.annotations || []).map(normalizeAnnotation),
  };
}

function normalizeMessage(row) {
  return {
    id: row.id,
    sender: row.sender,
    type: row.type,
    content: row.content,
    metadata: row.metadata || {},
    status: row.status,
    timestamp: row.created_at,
  };
}

function normalizeAnnotation(row) {
  return {
    id: row.id,
    messageId: row.message_id,
    category: row.category,
    severity: row.severity,
    note: row.note,
    suggestion: row.suggestion || '',
    createdAt: row.created_at,
  };
}
