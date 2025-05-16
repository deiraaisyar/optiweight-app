import { Request, Response } from 'express';
import admin from 'firebase-admin';
import { db } from '../firebaseConfig';

export const fetchUserData = async (
  req: Request<{ userId: string }>,
  res: Response
): Promise<void> => {
  const { userId } = req.params;

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userData = userDoc.data();
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const saveUserData = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const userData = req.body;

  try {
    await db.collection('users').doc(uid).set(userData, { merge: true });
    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).send({ error: 'Failed to save user data' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userSnapshot = await db.collection('users').doc(req.params.id).get();
    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ id: userSnapshot.id, ...userSnapshot.data() });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};