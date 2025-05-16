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
exports.removePastEvents = exports.fetchWorkoutEvents = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const fetchWorkoutEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    console.log('Fetching workout events for userId:', userId);
    try {
        const eventsSnapshot = yield firebaseConfig_1.db
            .collection('users')
            .doc(userId)
            .collection('events')
            .get();
        console.log('Events snapshot size:', eventsSnapshot.size);
        if (eventsSnapshot.empty) {
            console.log('No events found for userId:', userId);
            res.status(404).json({ message: 'No events found' });
            return;
        }
        const events = eventsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        console.log('Workout events fetched:', events);
        res.json(events);
    }
    catch (error) {
        console.error('Error fetching workout events:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});
exports.fetchWorkoutEvents = fetchWorkoutEvents;
const removePastEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const now = new Date();
        const eventsSnapshot = yield firebaseConfig_1.db
            .collection('users')
            .doc(userId)
            .collection('events')
            .get();
        const batch = firebaseConfig_1.db.batch();
        eventsSnapshot.docs.forEach(doc => {
            const event = doc.data();
            if (new Date(event.end) < now) {
                batch.delete(doc.ref);
            }
        });
        yield batch.commit();
        res.status(200).json({ message: 'Past events removed successfully' });
    }
    catch (error) {
        console.error('Error removing past events:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});
exports.removePastEvents = removePastEvents;
//# sourceMappingURL=workoutEventsController.js.map
