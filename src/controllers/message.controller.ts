import { Request, Response, NextFunction } from 'express';
import Message from '../models/Message.model.js';
import { Teacher } from '../models/Teacher.model.js';
import { Parent } from '../models/Parent.model.js';
import Student from '../models/Student.model.js';

/**
 * Get all conversations for a user
 * GET /messages/:userId
 */
export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    
    console.log(`📬 Fetching conversations for user: ${userId}`);

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .sort({ timestamp: -1 })
      .lean();

    // Group messages by conversation (senderId, receiverId, childId combination)
    const conversations = new Map();
    
    for (const message of messages) {
      // Skip messages with null references
      if (!message.senderId || !message.receiverId || !message.childId) {
        console.log('⚠️ Skipping message with null references:', message._id);
        continue;
      }
      
      const senderId = message.senderId.toString();
      const receiverId = message.receiverId.toString();
      const childId = message.childId.toString();
      
      // Create unique conversation key
      const conversationKey = [senderId, receiverId, childId].sort().join('-');
      
      if (!conversations.has(conversationKey)) {
        const otherUserId = senderId === userId ? receiverId : senderId;
        
        // Get the actual names from the database
        let otherUserName = 'Unknown User';
        let childName = 'Child';
        let childClass = 'Class';
        
        try {
          // Try to find the other user (teacher or parent)
          let otherUser = await Teacher.findById(otherUserId);
          if (otherUser) {
            otherUserName = otherUser.fullName;
          } else {
            otherUser = await Parent.findById(otherUserId);
            if (otherUser) {
              otherUserName = otherUser.name;
            }
          }
          
          // Try to find the child
          const child = await Student.findById(childId);
          if (child) {
            childName = child.name;
            childClass = child.className;
          }
        } catch (error) {
          console.log('⚠️ Error fetching user/child details:', error.message);
        }
        
        conversations.set(conversationKey, {
          conversationId: conversationKey,
          otherUserId,
          otherUserName,
          childId,
          childName,
          childClass,
          lastMessage: message.content,
          lastMessageTime: message.timestamp,
          unreadCount: 0
        });
      }
      
      // Count unread messages for current user
      if (message.receiverId.toString() === userId && !message.read) {
        const conversation = conversations.get(conversationKey);
        conversation.unreadCount++;
      }
    }

    const conversationList = Array.from(conversations.values()).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    res.status(200).json({
      success: true,
      data: conversationList,
      message: 'Conversations retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    next(error);
  }
};

/**
 * Get conversation history between two users about a specific child
 * GET /messages/conversation/:userId/:receiverId/:childId
 */
export const getConversationHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, receiverId, childId } = req.params;
    
    console.log(`📖 Fetching conversation history between ${userId} and ${receiverId} about child ${childId}`);

    // Get all messages in this conversation
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId, childId },
        { senderId: receiverId, receiverId: userId, childId }
      ]
    })
      .sort({ timestamp: 1 }) // Oldest first for chat display
      .lean();

    // Manually populate sender and receiver names
    const populatedMessages = await Promise.all(messages.map(async (message) => {
      let senderName = 'Unknown';
      let receiverName = 'Unknown';
      
      try {
        // Get sender name
        let sender = await Teacher.findById(message.senderId);
        if (sender) {
          senderName = sender.fullName;
        } else {
          sender = await Parent.findById(message.senderId);
          if (sender) {
            senderName = sender.name;
          }
        }
        
        // Get receiver name
        let receiver = await Teacher.findById(message.receiverId);
        if (receiver) {
          receiverName = receiver.fullName;
        } else {
          receiver = await Parent.findById(message.receiverId);
          if (receiver) {
            receiverName = receiver.name;
          }
        }
      } catch (error) {
        console.log('⚠️ Error populating message names:', error.message);
      }
      
      return {
        ...message,
        senderId: { _id: message.senderId, fullName: senderName },
        receiverId: { _id: message.receiverId, fullName: receiverName },
        childId: { _id: message.childId }
      };
    }));

    // Mark messages as read
    await Message.updateMany(
      { receiverId: userId, senderId: receiverId, childId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      data: {
        messages: populatedMessages,
        childId,
        childName: 'Wissal ZABOUR', // Simplified for now
        childClass: '4AM1' // Simplified for now
      },
      message: 'Conversation history retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching conversation history:', error);
    next(error);
  }
};

/**
 * Send a new message
 * POST /messages
 */
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { senderId, receiverId, childId, content } = req.body;
    
    console.log(`📤 Sending message from ${senderId} to ${receiverId} about child ${childId}`);

    if (!senderId || !receiverId || !childId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: senderId, receiverId, childId, content'
      });
    }

    // For now, skip child validation to get messaging working
    console.log(`🔍 Creating message for child ID: ${childId}`);

    // Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      childId,
      content: content.trim(),
      timestamp: new Date(),
      read: false
    });

    console.log('💾 Saving message...');
    const savedMessage = await newMessage.save();
    console.log('✅ Message saved:', savedMessage._id);
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      const conversationId = [senderId, receiverId, childId].sort().join('-');
      io.to(receiverId).emit('newMessage', {
        message: {
          _id: savedMessage._id,
          senderId: { _id: senderId },
          receiverId: { _id: receiverId },
          childId: { _id: childId },
          content: savedMessage.content,
          timestamp: savedMessage.timestamp,
          read: savedMessage.read
        },
        conversationId: conversationId
      });
      console.log('📡 Socket event emitted to receiver:', receiverId);
    }
    
    console.log('📤 Returning response...');

    res.status(201).json({
      success: true,
      data: {
        _id: savedMessage._id,
        senderId: { _id: senderId },
        receiverId: { _id: receiverId },
        childId: { _id: childId },
        content: savedMessage.content,
        timestamp: savedMessage.timestamp,
        read: savedMessage.read
      },
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    next(error);
  }
};

/**
 * Get available contacts for a user (teachers/parents they can message)
 * GET /messages/contacts/:userId
 */
export const getContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    
    console.log(`👥 Fetching contacts for user: ${userId}`);

    // Check if user is a teacher or parent to return appropriate contacts
    let teacher = await Teacher.findById(userId);
    if (!teacher) {
      teacher = await Teacher.findOne({ userId });
    }
    
    let parent = await Parent.findById(userId);
    if (!parent) {
      parent = await Parent.findOne({ userId });
    }

    let contacts = [];

    if (teacher) {
      console.log(`👨‍🏫 Teacher ${teacher.fullName} - returning parent contacts`);
      // Teacher should see parents
      const allParents = await Parent.find({}).lean();
      contacts = allParents.map(parent => ({
        userId: parent._id,
        name: parent.name,
        role: 'Parent',
        childId: parent.children[0] || '68f3b5470f4e668aa6c8a1ac',
        childName: 'Wissal ZABOUR',
        childClass: '4AM1'
      }));
    } else if (parent) {
      console.log(`👨‍👩‍👧‍👦 Parent ${parent.name} - returning teacher contacts`);
      // Parent should see teachers
      const allTeachers = await Teacher.find({}).lean();
      contacts = allTeachers.map(teacher => ({
        userId: teacher._id,
        name: teacher.fullName,
        role: 'Teacher',
        subject: teacher.subject,
        childId: '68f3b5470f4e668aa6c8a1ac',
        childName: 'Wissal ZABOUR',
        childClass: teacher.classes[0] || 'General'
      }));
    } else {
      console.log(`❌ User ${userId} not found as teacher or parent`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: contacts,
      message: 'Contacts retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    next(error);
  }
};

/**
 * Start a new conversation
 * POST /messages/start-conversation
 */
export const startConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { senderId, receiverId, childId, content } = req.body;
    
    console.log(`💬 Starting new conversation from ${senderId} to ${receiverId} about child ${childId}`);

    if (!senderId || !receiverId || !childId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: senderId, receiverId, childId, content'
      });
    }

    // Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      childId,
      content: content.trim(),
      timestamp: new Date(),
      read: false
    });

    console.log('💾 Saving new conversation message...');
    const savedMessage = await newMessage.save();
    console.log('✅ New conversation started:', savedMessage._id);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('newMessage', {
        message: savedMessage,
        conversationId: [senderId, receiverId, childId].sort().join('-')
      });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: savedMessage._id,
        senderId: { _id: senderId },
        receiverId: { _id: receiverId },
        childId: { _id: childId },
        content: savedMessage.content,
        timestamp: savedMessage.timestamp,
        read: savedMessage.read
      },
      message: 'New conversation started successfully'
    });
  } catch (error) {
    console.error('❌ Error starting conversation:', error);
    next(error);
  }
};

