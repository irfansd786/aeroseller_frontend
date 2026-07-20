import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDeZQJw1_LoRfZvkd-aTtzAkQJYaFdne0A',
  authDomain: 'aero-sell.firebaseapp.com',
  projectId: 'aero-sell',
  storageBucket: 'aero-sell.firebasestorage.app',
  messagingSenderId: '508265850065',
  appId: '1:508265850065:web:d90e28e264eb6a7fa951f0',
  measurementId: 'G-XMRQWNSWPS'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
};

export const signInWithGooglePopup = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  return userCredential.user;
};

export const signInWithGoogleRedirect = async () => {
  return signInWithRedirect(auth, googleProvider);
};

export const getGoogleRedirectResult = async () => {
  const result = await getRedirectResult(auth);
  return result?.user || null;
};

export const sendPasswordReset = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const signOutFirebase = async () => {
  return firebaseSignOut(auth);
};

export const toAppUser = (user: FirebaseUser, phone?: string) => ({
  name: user.displayName || 'AeroCart Customer',
  email: user.email || '',
  phone: phone || ''
});

// Store customer profile when they sign up
export const saveCustomerProfile = async (uid: string, email: string, name: string, phone: string = '') => {
  try {
    const customerDocRef = doc(db, 'customers', uid);
    await setDoc(customerDocRef, {
      uid,
      email,
      name,
      phone,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving customer profile:', error);
    throw error;
  }
};

// Store customer order with product details
export const saveCustomerOrder = async (order: any) => {
  try {
    const ordersCollection = collection(db, 'orders');
    const orderDoc = await addDoc(ordersCollection, {
      orderId: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.shippingAddress?.phone || '',
      items: order.items.map((item: any) => ({
        productId: item.productId,
        productName: item.name,
        price: item.price,
        discount: item.discount || 0,
        quantity: item.quantity,
        image: item.image
      })),
      summary: order.summary,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || 'Pending',
      orderStatus: order.status || 'Pending',
      createdAt: new Date().toISOString()
    });
    return orderDoc.id;
  } catch (error) {
    console.error('Error saving customer order:', error);
    throw error;
  }
};

// Get customer orders from Firestore
export const getCustomerOrders = async (email: string) => {
  try {
    const ordersCollection = collection(db, 'orders');
    const q = query(ordersCollection, where('customerEmail', '==', email));
    const querySnapshot = await getDocs(q);
    const orders: any[] = [];
    querySnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }
};

