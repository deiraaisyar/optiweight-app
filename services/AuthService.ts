// import auth from '@react-native-firebase/auth';
// import {GoogleSignin} from '@react-native-google-signin/google-signin';

// export const signInWithEmail = async (email: string, password: string) => {
//   return await auth().signInWithEmailAndPassword(email, password);
// };

// export const signUpWithEmail = async (email: string, password: string) => {
//   return await auth().createUserWithEmailAndPassword(email, password);
// };

// export const signInWithGoogle = async () => {
//   await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
//   const signInResult = await GoogleSignin.signIn();
//   const idToken = signInResult.idToken || signInResult?.data?.idToken;
//   if (!idToken) throw new Error('Google Sign-In gagal, ID token tidak ditemukan');
//   const googleCredential = auth.GoogleAuthProvider.credential(idToken);
//   return await auth().signInWithCredential(googleCredential);
// };

// export const getCurrentUser = () => {
//   return auth().currentUser;
// };