import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiX,
  FiSearch,
  FiMessageSquare,
  FiUsers,
  FiLock,
  FiCheck,
  FiAlertCircle,
  FiMail,
  FiUserCheck,
  FiArrowRight,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { checkUserByEmailApi, createConversationApi } from '../../api/client';
import { Avatar } from './Avatar';
import { User } from '../../types';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatSelected?: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onChatSelected,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { conversations, setActiveConversationId, refreshConversations, startDirectChat } =
    useChat();

  const [selectedTab, setSelectedTab] = useState<'direct' | 'group'>('direct');
  const [emailInput, setEmailInput] = useState('');
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const [searchStatus, setSearchStatus] = useState<
    'idle' | 'found' | 'not_found' | 'self_error'
  >('idle');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  if (!isOpen) return null;

  const handleCheckEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      toast.warning('Please enter an email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setSearchStatus('not_found');
      setErrorMessage('Please enter a valid email format (e.g. name@example.com).');
      setFoundUser(null);
      return;
    }

    if (currentUser?.email && currentUser.email.toLowerCase().trim() === cleanEmail) {
      setSearchStatus('self_error');
      setErrorMessage('You cannot start a direct conversation with your own email.');
      setFoundUser(null);
      return;
    }

    try {
      setIsCheckingUser(true);
      setSearchStatus('idle');
      setErrorMessage('');
      setFoundUser(null);

      const user = await checkUserByEmailApi(cleanEmail);

      if (user) {
        setFoundUser(user);
        setSearchStatus('found');
      } else {
        setSearchStatus('not_found');
        setErrorMessage(`No user registered with email "${cleanEmail}".`);
      }
    } catch (error: any) {
      if (error.isSelf) {
        setSearchStatus('self_error');
        setErrorMessage('You cannot start a direct conversation with your own email.');
      } else {
        setSearchStatus('not_found');
        setErrorMessage(
          error.message || `No registered user found with email "${cleanEmail}".`
        );
      }
      setFoundUser(null);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleOpenChatWithUser = async (targetEmail: string) => {
    try {
      setIsOpeningChat(true);
      const conv = await startDirectChat(targetEmail);

      if (conv?.id) {
        if (onChatSelected) {
          onChatSelected();
        }
        onClose();
        navigate('/chat');
      } else {
        toast.error('Could not open conversation with this user.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start chat.');
    } finally {
      setIsOpeningChat(false);
    }
  };

  const handleSelectExistingConv = (convId: string) => {
    setActiveConversationId(convId);
    if (onChatSelected) {
      onChatSelected();
    }
    onClose();
    navigate('/chat');
  };

  const handleToggleGroupContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact for the group.');
      return;
    }

    try {
      setIsCreatingGroup(true);
      const newGroup = await createConversationApi(selectedContacts, groupName.trim());
      await refreshConversations();

      const groupId = newGroup?.id;
      if (groupId) {
        setActiveConversationId(groupId);
        if (onChatSelected) {
          onChatSelected();
        }
        toast.success(`Group "${groupName}" created successfully!`);
      }

      onClose();
      navigate('/chat');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create group channel.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-xs">
              <FiMessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                New Conversation
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enter recipient email to verify & start chat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedTab('direct')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${selectedTab === 'direct'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
          >
            <FiMail className="w-3.5 h-3.5" />
            <span>Search by Email</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('group')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${selectedTab === 'group'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
          >
            <FiUsers className="w-3.5 h-3.5" />
            <span>Create Group</span>
          </button>
        </div>

        {selectedTab === 'direct' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <form onSubmit={handleCheckEmail} className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                User Email Address
              </label>

              <div className="relative flex items-center">
                <FiMail className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (searchStatus !== 'idle') {
                      setSearchStatus('idle');
                      setFoundUser(null);
                      setErrorMessage('');
                    }
                  }}
                  placeholder="Enter full email (e.g. user@gmail.com)"
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  autoFocus
                />
                {emailInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput('');
                      setSearchStatus('idle');
                      setFoundUser(null);
                      setErrorMessage('');
                    }}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={!emailInput.trim() || isCheckingUser}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isCheckingUser ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying user existence...</span>
                  </>
                ) : (
                  <>
                    <FiSearch className="w-4 h-4" />
                    <span>Check User</span>
                  </>
                )}
              </button>
            </form>

            {isCheckingUser && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-center animate-pulse">
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  Checking database for {emailInput}...
                </p>
              </div>
            )}

            {!isCheckingUser && searchStatus === 'not_found' && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-left animate-in fade-in">
                <FiAlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    User Not Found
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    {errorMessage || `No account exists with email: ${emailInput}`}
                  </p>
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1">
                    Please ensure the email is spelled correctly or that the user has signed up.
                  </p>
                </div>
              </div>
            )}
            {!isCheckingUser && searchStatus === 'self_error' && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-left animate-in fade-in">
                <FiAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    That's Your Account
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}
            {!isCheckingUser && searchStatus === 'found' && foundUser && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm animate-in zoom-in-95 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    <FiUserCheck className="w-3 h-3" />
                    <span>Registered User Found</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Ready to chat
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <Avatar
                    name={foundUser.name}
                    avatarUrl={foundUser.avatarUrl}
                    size="md"
                    online={foundUser.online}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {foundUser.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      {foundUser.email}
                    </p>
                    {foundUser.about && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5 truncate">
                        "{foundUser.about}"
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isOpeningChat}
                  onClick={() => handleOpenChatWithUser(foundUser.email)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isOpeningChat ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Opening Conversation...</span>
                    </>
                  ) : (
                    <>
                      <FiMessageSquare className="w-4 h-4" />
                      <span>Start Conversation</span>
                      <FiArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}
            {searchStatus === 'idle' && conversations.length > 0 && (
              <div className="pt-2">
                <p className="px-1 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Recent Conversations
                </p>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => handleSelectExistingConv(conv.id)}
                      className="w-full p-2.5 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          name={conv.name}
                          avatarUrl={conv.avatar}
                          size="sm"
                          online={conv.online}
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {conv.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {conv.isGroup ? 'Group Channel' : 'Direct Chat'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
                        <FiLock className="w-3 h-3 text-emerald-600" />
                        <span>Encrypted</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleCreateGroup} className="flex-1 flex flex-col p-4 overflow-y-auto">
            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-900 dark:text-slate-200 block mb-1">
                Channel / Group Name *
              </label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="#Design-System or Project Alpha"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <label className="text-xs font-semibold text-slate-900 dark:text-slate-200 block mb-1">
              Select Teammates ({selectedContacts.length} selected)
            </label>
            <div className="flex-1 overflow-y-auto max-h-48 border border-slate-100 dark:border-slate-800 rounded-xl p-2 space-y-1 mb-4">
              {conversations.map((contact: any) => {
                const contactId = contact.id;
                const isSelected = selectedContacts.includes(contactId);
                return (
                  <div
                    key={contactId}
                    onClick={() => handleToggleGroupContact(contactId)}
                    className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        name={contact.name}
                        avatarUrl={contact.avatar}
                        size="xs"
                        online={contact.online}
                      />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {contact.name}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                        }`}
                    >
                      {isSelected && <FiCheck className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={!groupName.trim() || isCreatingGroup}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isCreatingGroup ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Group Channel...</span>
                </>
              ) : (
                <span>Create Group Channel</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};