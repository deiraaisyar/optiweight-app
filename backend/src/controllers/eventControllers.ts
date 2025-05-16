import { Request, Response } from 'express';
import { db } from '../firebaseConfig';

export const fetchWorkoutEvents = async (
  req: Request<{ userId: string }>,
  res: Response
): Promise<void> => {
  const { userId } = req.params;

  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('events')
      .where('type', '==', 'Workout')
      .get();

    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(events);
  } catch (error) {
    console.error('Error fetching workout events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removePastEvents = async (
    req: Request<{ userId: string }>,
    res: Response
  ): Promise<void> => {
    const { userId } = req.params;
  
    try {
      const now = new Date();
      const snapshot = await db
        .collection('users')
        .doc(userId)
        .collection('events')
        .get();
  
      const batch = db.batch();
  
      snapshot.docs.forEach(doc => {
        const event = doc.data();
        if (new Date(event.end) < now || event.completed) {
          batch.delete(doc.ref);
        }
      });
  
      await batch.commit();
      res.json({ message: 'Past events removed successfully' });
    } catch (error) {
      console.error('Error removing past events:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };