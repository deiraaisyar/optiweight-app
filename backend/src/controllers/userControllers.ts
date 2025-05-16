import { Request, Response } from 'express';
import admin from 'firebase-admin';

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
    res.json({
      fullName: userData?.fullName || '',
      preferredName: userData?.preferredName || '',
      dateOfBirth: userData?.dateOfBirth || null,
      weight: userData?.weight || 0,
      height: userData?.height || null,
      gender: userData?.gender || '',
      profileCompleted: userData?.profileCompleted || false,
      streakCount: userData?.streakCount || 0,
      weeklyWorkouts: userData?.weeklyWorkouts || 0,
      streakHistory: userData?.streakHistory || [],
      lastStreakUpdate: userData?.lastStreakUpdate || null,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const saveUserData = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const userData = req.body;

  try {
    console.time('Save User Data'); // Tambahkan log waktu
    const db = admin.firestore();

    // Simpan data pengguna ke Firestore
    await db.collection('users').doc(uid).set(userData, { merge: true });

    console.timeEnd('Save User Data'); // Log waktu selesai
    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).send({ error: 'Failed to save user data' });
  }
};