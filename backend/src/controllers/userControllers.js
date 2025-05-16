"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUserData = exports.fetchUserData = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const fetchUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const userDoc = yield firebaseConfig_1.db.collection('users').doc(userId).get();
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
});
exports.fetchUserData = fetchUserData;
const saveUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const userData = req.body;
    try {
        yield firebaseConfig_1.db.collection('users').doc(uid).set(userData, { merge: true });
        res.status(200).send({ success: true });
    }
    catch (error) {
        console.error('Error saving user data:', error);
        res.status(500).send({ error: 'Failed to save user data' });
    }
});
exports.saveUserData = saveUserData;
