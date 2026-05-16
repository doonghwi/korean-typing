import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore/lite'

const firebaseConfig = {
  apiKey: 'AIzaSyDmQgbg54jp3sDSWiPhRsVsPstyw9a9iOw',
  authDomain: 'korean-typing-3118c.firebaseapp.com',
  projectId: 'korean-typing-3118c',
  storageBucket: 'korean-typing-3118c.firebasestorage.app',
  messagingSenderId: '940024250777',
  appId: '1:940024250777:web:8f29c4ac827cf0de539308',
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
