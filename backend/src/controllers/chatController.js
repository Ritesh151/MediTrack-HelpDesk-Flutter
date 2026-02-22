// TODO: Implement MongoDB-based chat logic
export const sendMessage = async (req, res) => {
    res.status(501).json({ message: "Chat service is under maintenance" });
};

export const getMessages = async (req, res) => {
    res.json([]);
};
