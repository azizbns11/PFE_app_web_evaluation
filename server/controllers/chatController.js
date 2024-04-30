const Chat = require('../models/chat');
const User = require('../models/user');
const Message=require('../models/message')
const chatController = {
  createChat: async (req, res) => {
    try {
      const { chatName, users } = req.body;
      
      
      let existingChat = await Chat.findOne({
        users: { $all: users },
    
      }).populate('users', '-password').populate('latestMessage');

 
      if (existingChat) {
        return res.status(200).json(existingChat);
      }

      const chat = new Chat({
        chatName,
     
        users
      });

      const savedChat = await chat.save();
      res.status(201).json(savedChat);
    } catch (error) {
      console.error('Error creating/accessing chat:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  fetchChats: async (req, res) => {
    try {
   
      const userId = req.userId;
   
  
      let chats = await Chat.find({ users: userId })
        .populate({
          path: 'users',
          select: '-password', 
          populate: {
            path: 'role', 
            select: 'role', 
          },
        })
        .populate('latestMessage')
        .sort({ updatedAt: -1 }); 
  
     
  
     
      chats = await User.populate(chats, {
        path: 'latestMessage.sender', 
        select: 'firstName lastName groupName role',
      });
  
     
      res.status(200).json(chats); 
    } catch (error) {
      console.error('Error fetching chats:', error); 
      res.status(500).json({ error: 'Internal server error' }); 
    }
  }
  ,
  sendMessage: async (req, res) => {
    try {
      const { content, chatId } = req.body;

      if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
      }

      if (!req.userId) { 
        console.log("User information not available");
        return res.status(400).json({ error: "User information not available" });
      }

      var newMessage = {
        sender: req.userId, 
        content: content,
        chat: chatId,
      };

      var message = await Message.create(newMessage);

      message = await message.populate("sender"); 
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "firstName lastName groupName image", 
      });

      await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

      res.json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Server error' });
    }
},
allMessages: async (req, res) => {
  try {
    const { chatId } = req.params;
 

   
    if (!chatId) {
      console.log("Chat ID is missing");
      return res.sendStatus(400);
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "firstName lastName groupName image")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
},

};

module.exports = chatController;
