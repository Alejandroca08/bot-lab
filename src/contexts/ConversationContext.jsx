import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';

export const ConversationContext = createContext(null);

const STORAGE_KEY = 'botlab_conversations';

function generateUUID() {
  return crypto.randomUUID();
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(conversations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

// --- Reducer ---

const ActionTypes = {
  CREATE: 'CREATE_CONVERSATION',
  DELETE: 'DELETE_CONVERSATION',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE_STATUS: 'UPDATE_MESSAGE_STATUS',
  SET_BOT_STATUS: 'SET_BOT_STATUS',
  ADD_ANNOTATION: 'ADD_ANNOTATION',
  REMOVE_ANNOTATION: 'REMOVE_ANNOTATION',
};

function conversationsReducer(state, action) {
  switch (action.type) {
    case ActionTypes.CREATE: {
      return [...state, action.payload];
    }

    case ActionTypes.DELETE: {
      return state.filter((c) => c.id !== action.payload);
    }

    case ActionTypes.ADD_MESSAGE: {
      const { conversationId, message } = action.payload;
      return state.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c
      );
    }

    case ActionTypes.UPDATE_MESSAGE_STATUS: {
      const { conversationId, messageId, status } = action.payload;
      return state.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, status } : m
              ),
            }
          : c
      );
    }

    case ActionTypes.SET_BOT_STATUS: {
      const { conversationId, status } = action.payload;
      return state.map((c) =>
        c.id === conversationId ? { ...c, botStatus: status } : c
      );
    }

    case ActionTypes.ADD_ANNOTATION: {
      const { conversationId, annotation } = action.payload;
      return state.map((c) =>
        c.id === conversationId
          ? { ...c, annotations: [...c.annotations, annotation] }
          : c
      );
    }

    case ActionTypes.REMOVE_ANNOTATION: {
      const { conversationId, annotationId } = action.payload;
      return state.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              annotations: c.annotations.filter((a) => a.id !== annotationId),
            }
          : c
      );
    }

    default:
      return state;
  }
}

export function ConversationProvider({ children }) {
  const [conversations, dispatch] = useReducer(
    conversationsReducer,
    null,
    loadFromStorage
  );

  const [activeConversationId, setActiveConversationIdState] = useState(null);

  // Use a ref to track the latest state for persistence,
  // avoiding stale closure issues with rapid dispatches.
  const stateRef = useRef(conversations);
  stateRef.current = conversations;

  const dispatchAndPersist = useCallback(
    (action) => {
      dispatch(action);
      const next = conversationsReducer(stateRef.current, action);
      stateRef.current = next;
      saveToStorage(next);
    },
    []
  );

  // --- Public API ---

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const createConversation = useCallback(
    (projectId, simulatedPhoneNumber, customerName) => {
      const now = new Date().toISOString();
      const conversation = {
        id: generateUUID(),
        projectId,
        simulatedPhoneNumber,
        customerName,
        messages: [],
        botStatus: 'active',
        createdAt: now,
        annotations: [],
      };
      dispatchAndPersist({ type: ActionTypes.CREATE, payload: conversation });
      return conversation;
    },
    [dispatchAndPersist]
  );

  const addMessage = useCallback(
    (conversationId, message) => {
      const fullMessage = {
        id: message.id ?? generateUUID(),
        sender: message.sender,
        type: message.type ?? 'text',
        content: message.content,
        timestamp: message.timestamp ?? new Date().toISOString(),
        status: message.status ?? 'sending',
        ...(message.metadata ? { metadata: message.metadata } : {}),
      };
      dispatchAndPersist({
        type: ActionTypes.ADD_MESSAGE,
        payload: { conversationId, message: fullMessage },
      });
      return fullMessage;
    },
    [dispatchAndPersist]
  );

  const updateMessageStatus = useCallback(
    (conversationId, messageId, status) => {
      dispatchAndPersist({
        type: ActionTypes.UPDATE_MESSAGE_STATUS,
        payload: { conversationId, messageId, status },
      });
    },
    [dispatchAndPersist]
  );

  const setBotStatus = useCallback(
    (conversationId, status) => {
      dispatchAndPersist({
        type: ActionTypes.SET_BOT_STATUS,
        payload: { conversationId, status },
      });
    },
    [dispatchAndPersist]
  );

  const addAnnotation = useCallback(
    (conversationId, messageId, annotation) => {
      const fullAnnotation = {
        id: annotation.id ?? generateUUID(),
        messageId,
        category: annotation.category,
        severity: annotation.severity,
        note: annotation.note,
        ...(annotation.suggestion ? { suggestion: annotation.suggestion } : {}),
        createdAt: annotation.createdAt ?? new Date().toISOString(),
      };
      dispatchAndPersist({
        type: ActionTypes.ADD_ANNOTATION,
        payload: { conversationId, annotation: fullAnnotation },
      });
      return fullAnnotation;
    },
    [dispatchAndPersist]
  );

  const removeAnnotation = useCallback(
    (conversationId, annotationId) => {
      dispatchAndPersist({
        type: ActionTypes.REMOVE_ANNOTATION,
        payload: { conversationId, annotationId },
      });
    },
    [dispatchAndPersist]
  );

  const deleteConversation = useCallback(
    (id) => {
      dispatchAndPersist({ type: ActionTypes.DELETE, payload: id });
      if (activeConversationId === id) {
        setActiveConversationIdState(null);
      }
    },
    [dispatchAndPersist, activeConversationId]
  );

  const setActiveConversationId = useCallback((id) => {
    setActiveConversationIdState(id);
  }, []);

  const getConversationsForProject = useCallback(
    (projectId) => conversations.filter((c) => c.projectId === projectId),
    [conversations]
  );

  const value = useMemo(
    () => ({
      conversations,
      activeConversationId,
      activeConversation,
      createConversation,
      addMessage,
      updateMessageStatus,
      setBotStatus,
      addAnnotation,
      removeAnnotation,
      deleteConversation,
      setActiveConversationId,
      getConversationsForProject,
    }),
    [
      conversations,
      activeConversationId,
      activeConversation,
      createConversation,
      addMessage,
      updateMessageStatus,
      setBotStatus,
      addAnnotation,
      removeAnnotation,
      deleteConversation,
      setActiveConversationId,
      getConversationsForProject,
    ]
  );

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      'useConversation must be used within a ConversationProvider'
    );
  }
  return context;
}

export default ConversationContext;
