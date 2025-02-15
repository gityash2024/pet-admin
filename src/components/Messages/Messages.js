import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, TextField, IconButton, Badge, CircularProgress, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getAllMessages, getAdvertConversation, sendMessage, markMessageAsRead } from 'utils/api';

const ChatWindow = styled(Paper)({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 200px)',
  overflow: 'hidden',
  borderRadius: '12px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const MessageList = styled(Box)({
  flexGrow: 1,
  overflow: 'auto',
  padding: '16px',
  backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAElBMVEX8/vz08vT09vT8+vz8/vzs7uxH16TeAAAAAXRSTlMAQObYZgAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAUFJREFUOI3Vks3K3DAMRGGBL7KT3LP0BbIL2dvbUGjhfYGSjYsFhYb2/R+hkpyPrZ1NIfQsDMbfdxgLSWtFGb3V5PJ0c0r7xGfML+aBt9OL8nWdrjC/XB86HV/Mh1c3Dppl5xM4/FKSIoA1RQC5ioDPjzHwQzEBOLO3AImZEVCfgPFmAyJZAYCwA4LlG5p4yoCrNk+A80B8SQAHxMAcFKVwMGHBjAm0RDq5GPKICRoRkiMeF8ClEHGh0AHQ2wIkWAFhpANAqwBD1hSAEgaOtQOMR80AQhYUBpQVLYCow/BjQvbQYUCuJQEHsJYwQJsB5o4TPBbAOgFgaqV4u6ZJEDcCqWAEyR3sCtA2QQakJXZBCFN3YBbpAEr7QGqMLxkH4FpgH6Qh3kEUAZ5gBNEGRPkgy0sgO0j2JBG2rTsYu/8A7enP1dzOZcYAAAAASUVORK5CYII=")',
  backgroundRepeat: 'repeat',
});

const MessageItem = styled(Box)(({ sent }) => ({
  display: 'flex',
  justifyContent: sent ? 'flex-end' : 'flex-start',
  marginBottom: '8px',
}));

const MessageContent = styled(Paper)(({ sent }) => ({
  padding: '8px 16px',
  borderRadius: sent ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  backgroundColor: sent ? '#DCF8C6' : '#FFFFFF',
  color: '#000000',
  maxWidth: '70%',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  position: 'relative',
}));

const ConversationList = styled(Paper)({
  height: 'calc(100vh - 200px)',
  overflow: 'auto',
  borderRadius: '12px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: '#F0F2F5',
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'transparent',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'transparent',
    },
  },
});

const MessageTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: '#F0F2F5',
    '& fieldset': {
      borderColor: 'transparent',
    },
  },
});

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messageListRef = useRef(null);

  const fetchAllMessages = async () => {
    try {
      const response = await getAllMessages();
      const groupedConversations = groupMessagesByConversation(response.data.messages);
      setConversations(groupedConversations);
      if (selectedConversation) {
        const conversationResponse = await getAdvertConversation(selectedConversation.advert._id);
        setMessages(conversationResponse.data.messages);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMessages();
    const interval = setInterval(fetchAllMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const groupMessagesByConversation = (messages) => {
    const conversations = {};
    messages.forEach(message => {
      const conversationId = `${message.sender._id}-${message.recipient._id}-${message.advert._id}`;
      if (!conversations[conversationId]) {
        conversations[conversationId] = {
          id: conversationId,
          participants: [message.sender, message.recipient],
          advert: message.advert,
          lastMessage: message,
          unreadCount: message.read ? 0 : 1
        };
      } else {
        conversations[conversationId].lastMessage = message;
        if (!message.read) {
          conversations[conversationId].unreadCount += 1;
        }
      }
    });
    return Object.values(conversations);
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const response = await getAdvertConversation(conversation.advert._id);
      setMessages(response.data.messages);
      response.data.messages.forEach(message => {
        if (!message.read && message.recipient.role === 'admin') {
          markMessageAsRead(message._id);
        }
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        const messageData = {
          advertId: selectedConversation.advert._id,
          recipientId: selectedConversation.participants.find(p => p.role !== 'admin')._id,
          content: newMessage.trim()
        };
        const response = await sendMessage(messageData);
        setMessages(prevMessages => [...prevMessages, response.data.message]);
        setNewMessage('');
        fetchAllMessages();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const filteredConversations = conversations.filter(conversation => 
    conversation.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    conversation.advert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ConversationList elevation={0}>
            <Box sx={{ p: 2 }}>
              <SearchField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#54656F', mr: 1 }} />
                }}
              />
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    button
                    selected={selectedConversation && selectedConversation.id === conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: '#F0F2F5',
                      },
                      '&:hover': {
                        backgroundColor: '#F5F6F6',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge color="secondary" badgeContent={conversation.unreadCount} overlap="circular">
                        <Avatar src={conversation.participants[0].avatar} alt={conversation.participants[0].name} />
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={conversation.participants.map(p => p.name).join(', ')}
                      secondary={`${conversation.advert.title} - ${conversation.lastMessage.content.substring(0, 30)}...`}
                      primaryTypographyProps={{
                        sx: { fontWeight: conversation.unreadCount > 0 ? 600 : 400 }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </ConversationList>
        </Grid>
        <Grid item xs={12} md={8}>
          <ChatWindow elevation={0}>
            {selectedConversation ? (
              <>
                <Box sx={{ p: 2, backgroundColor: '#F0F2F5', borderBottom: '1px solid #E0E0E0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={selectedConversation.participants[0].avatar} sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {selectedConversation.participants.map(p => p.name).join(', ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedConversation.advert.title}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <MessageList ref={messageListRef}>
                  {messages.map((message) => (
                    <MessageItem key={message._id} sent={message.sender.role === 'admin'}>
                      <MessageContent sent={message.sender.role === 'admin'}>
                        <Typography variant="body2">{message.content}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#667781', mr: 0.5 }}>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          {message.sender.role === 'admin' && (
                            <DoneAllIcon sx={{ fontSize: 16, color: message.read ? '#53BDEB' : '#667781' }} />
                          )}
                        </Box>
                      </MessageContent>
                    </MessageItem>
                  ))}
                </MessageList>
                <Box sx={{ p: 2, backgroundColor: '#F0F2F5', display: 'flex', alignItems: 'center' }}>
                  <MessageTextField
                    fullWidth
                    size="small"
                    placeholder="Type a message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    sx={{ mr: 1 }}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={handleSendMessage}
                    sx={{ 
                      backgroundColor: '#00A884',
                      color: '#FFFFFF',
                      '&:hover': {
                        backgroundColor: '#00987A'
                      }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#F0F2F5' }}>
                <Typography variant="h6" color="text.secondary">Select a conversation to start messaging</Typography>
              </Box>
            )}
          </ChatWindow>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Messages;