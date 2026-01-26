import { Socket, Server as SocketIOServer } from 'socket.io';
import { logger } from '@/utils/logger';

export function chatHandlers(socket: Socket, io: SocketIOServer) {
  // Join chat room
  socket.on('join_chat', async (data: { chatId: string }) => {
    try {
      const { chatId } = data;
      const userId = socket.data.userId;

      // TODO: Verify user has access to this chat
      
      await socket.join(chatId);
      
      logger.info('User joined chat', {
        userId,
        chatId,
        socketId: socket.id
      });

      // Notify other users in the chat
      socket.to(chatId).emit('user_joined', {
        userId,
        timestamp: new Date()
      });

      socket.emit('joined_chat', {
        chatId,
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Error joining chat', {
        userId: socket.data.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      socket.emit('error', {
        type: 'join_chat_error',
        message: 'Failed to join chat'
      });
    }
  });

  // Leave chat room
  socket.on('leave_chat', async (data: { chatId: string }) => {
    try {
      const { chatId } = data;
      const userId = socket.data.userId;

      await socket.leave(chatId);
      
      logger.info('User left chat', {
        userId,
        chatId,
        socketId: socket.id
      });

      // Notify other users in the chat
      socket.to(chatId).emit('user_left', {
        userId,
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Error leaving chat', {
        userId: socket.data.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Send message
  socket.on('send_message', async (data: {
    chatId: string;
    message: string;
    language: string;
  }) => {
    try {
      const { chatId, message, language } = data;
      const userId = socket.data.userId;

      // TODO: Save message to database
      // TODO: Translate message if needed
      // TODO: Get AI negotiation suggestions

      const messageData = {
        id: `temp_${Date.now()}`, // TODO: Use actual message ID from database
        senderId: userId,
        originalText: message,
        originalLanguage: language,
        timestamp: new Date(),
        chatId
      };

      // Broadcast message to all users in the chat
      io.to(chatId).emit('new_message', messageData);

      logger.info('Message sent', {
        userId,
        chatId,
        messageLength: message.length
      });

    } catch (error) {
      logger.error('Error sending message', {
        userId: socket.data.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      socket.emit('error', {
        type: 'send_message_error',
        message: 'Failed to send message'
      });
    }
  });

  // Typing indicator
  socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
    try {
      const { chatId, isTyping } = data;
      const userId = socket.data.userId;

      socket.to(chatId).emit('user_typing', {
        userId,
        isTyping,
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Error handling typing indicator', {
        userId: socket.data.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Mark messages as read
  socket.on('mark_read', async (data: { chatId: string; messageId: string }) => {
    try {
      const { chatId, messageId } = data;
      const userId = socket.data.userId;

      // TODO: Update message read status in database

      socket.to(chatId).emit('message_read', {
        messageId,
        readBy: userId,
        timestamp: new Date()
      });

      logger.debug('Message marked as read', {
        userId,
        chatId,
        messageId
      });

    } catch (error) {
      logger.error('Error marking message as read', {
        userId: socket.data.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}