import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar,
  Avatar, TextField, Button, IconButton, Divider, FormControl, InputLabel,
  Select, MenuItem, Grid, Badge, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import { getAllMessages, getAdvertConversation, sendMessage, markMessageAsRead } from 'utils/api';

// Styled components (keep the same as in your original code)
const ChatWindow = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 200px)',
  overflow: 'hidden',
}));

const MessageList = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
}));

const MessageItem = styled(Box)(({ theme, sent }) => ({
  display: 'flex',
  justifyContent: sent ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1),
}));

const MessageContent = styled(Paper)(({ theme, sent }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: '20px',
  backgroundColor: sent ? theme.palette.primary.main : theme.palette.grey[300],
  color: sent ? theme.palette.primary.contrastText : theme.palette.text.primary,
  maxWidth: '70%',
}));


function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messageListRef = useRef(null);

  useEffect(() => {
    fetchAllMessages();
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchAllMessages = async () => {
    try {
      setLoading(true);
      const response = await getAllMessages();
      const groupedConversations = groupMessagesByConversation(response.data.messages);
      setConversations(groupedConversations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };


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
      // Mark messages as read
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
        setMessages([...messages, response.data.message]);
        setNewMessage('');
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
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>
        <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IconButton>
                <SearchIcon />
              </IconButton>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    button
                    selected={selectedConversation && selectedConversation.id === conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <ListItemAvatar>
                      <Badge color="secondary" badgeContent={conversation.unreadCount} overlap="circular">
                        <Avatar src={conversation.participants[0].avatar} alt={conversation.participants[0].name} />
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={conversation.participants.map(p => p.name).join(', ')} 
                      secondary={`${conversation.advert.title} - ${conversation.lastMessage.content.substring(0, 30)}...`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <ChatWindow>
            {selectedConversation ? (
              <>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">
                    {selectedConversation.participants.map(p => p.name).join(', ')} - {selectedConversation.advert.title}
                  </Typography>
                </Box>
                <MessageList ref={messageListRef}>
                  {messages.map((message) => (
                    <MessageItem key={message._id} sent={message.sender.role === 'admin'}> 
                      <MessageContent sent={message.sender._id === 'admin_id'}>
                        <Typography variant="body2">{message.content}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </Typography>
                      </MessageContent>
                    </MessageItem>
                  ))}
                </MessageList>
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <IconButton color="primary" onClick={handleSendMessage}>
                    <SendIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
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