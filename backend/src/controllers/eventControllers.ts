import { Request, Response } from 'express';
import { db } from '../firebaseConfig';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const fetchWorkoutEvents = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  const { userId } = req.params;
  console.log('Fetching workout events for userId:', userId);

  try {
    const eventsSnapshot = await db
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

    const events = eventsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    eventsSnapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
      console.log(doc.id, doc.data());
    });

    console.log('Workout events fetched:', events);

    res.json(events);
  } catch (error) {
    console.error('Error fetching workout events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removePastEvents = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  const { userId } = req.params;

  try {
    const now = new Date();
    const eventsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('events')
      .get();

    const batch = db.batch();
    eventsSnapshot.docs.forEach(doc => {
      const event = doc.data();
      if (new Date(event.end) < now) {
        batch.delete(doc.ref);
      }
    });

    await batch.commit();
    res.status(200).json({ message: 'Past events removed successfully' });
  } catch (error) {
    console.error('Error removing past events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const eventsSnapshot = await db.collection('events').get();
    const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};