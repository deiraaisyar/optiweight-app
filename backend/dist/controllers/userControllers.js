"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.saveUserData = exports.fetchUserData = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const fetchUserData = async (req, res) => {
    const { userId } = req.params;
    try {
        const userDoc = await firebaseConfig_1.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const userData = userDoc.data();
        res.json(userData);
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.fetchUserData = fetchUserData;
const saveUserData = async (req, res) => {
    const { uid } = req.params;
    const userData = req.body;
    try {
        await firebaseConfig_1.db.collection('users').doc(uid).set(userData, { merge: true });
        res.status(200).send({ success: true });
    }
    catch (error) {
        console.error('Error saving user data:', error);
        res.status(500).send({ error: 'Failed to save user data' });
    }
};
exports.saveUserData = saveUserData;
const getUser = async (req, res) => {
    try {
        const userSnapshot = await firebaseConfig_1.db.collection('users').doc(req.params.id).get();
        if (!userSnapshot.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ id: userSnapshot.id, ...userSnapshot.data() });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
};
exports.getUser = getUser;
