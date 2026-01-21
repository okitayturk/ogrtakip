
// Fix: Use namespaced import to resolve potential "no exported member" errors in certain module resolution environments
import * as firebaseApp from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy
} from "firebase/firestore";
import { Student, StudentFormData, TemrinScores } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAjXo9Oqjx8TOAsjSwKD1aRUwfzDPo_32Y",
  authDomain: "ogrencitakipdb.firebaseapp.com",
  projectId: "ogrencitakipdb",
  storageBucket: "ogrencitakipdb.firebasestorage.app",
  messagingSenderId: "156353228149",
  appId: "1:156353228149:web:dab266645d827d55cfb73c",
  measurementId: "G-HBGX9W2G81"
};

// Initialize Firebase using the namespaced app access
const app = firebaseApp.getApps().length === 0 
  ? firebaseApp.initializeApp(firebaseConfig) 
  : firebaseApp.getApp();

const db = getFirestore(app);
const COLLECTION_NAME = 'students';

// Helper to calculate average
const calculateAverage = (scores: TemrinScores) => {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return parseFloat((sum / values.length).toFixed(1));
};

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    try {
      const studentsRef = collection(db, COLLECTION_NAME);
      const q = query(studentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          studentNo: data.studentNo,
          fullName: data.fullName,
          gender: data.gender,
          scores: data.scores,
          average: data.average,
          createdAt: data.createdAt
        } as Student;
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  add: async (data: StudentFormData): Promise<Student> => {
    const studentData = {
      ...data,
      average: calculateAverage(data.scores),
      createdAt: Date.now(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), studentData);
    return { ...studentData, id: docRef.id } as Student;
  },

  update: async (id: string, data: StudentFormData): Promise<void> => {
    const studentRef = doc(db, COLLECTION_NAME, id);
    const updateData = {
      ...data,
      average: calculateAverage(data.scores)
    };
    await updateDoc(studentRef, updateData);
  },

  delete: async (id: string): Promise<void> => {
    const studentRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(studentRef);
  }
};
