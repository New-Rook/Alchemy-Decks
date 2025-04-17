import { auth, firestore } from "./firebase";
import { addDoc, collection, deleteDoc, doc, setDoc } from "firebase/firestore";

export const getDataFromDatabase = async (path: string, id: string, data: any) => {
  const user = auth.currentUser

  if (!user) {
    console.log('no user')
    // warn user
    return
  }

  try {
    // const docRef = await addDoc(collection(firestore, path), data);
    await setDoc(doc(firestore, path, id), data);
    // console.log("Document written with ID: ", docRef);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export const setDataToDatabase = async (path: string, id: string, data: any) => {
  const user = auth.currentUser

  if (!user) {
    console.log('no user')
    // warn user
    return
  }

  try {
    // const docRef = await addDoc(collection(firestore, path), data);
    await setDoc(doc(firestore, path, id), data);
    // console.log("Document written with ID: ", docRef);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// export const removeDataFromDatabase = async (path: string, data: any) => {
//   const user = auth.currentUser

//   if (!user) {
//     console.log('no user')
//     // warn user
//     return
//   }

//   try {
//     const docRef = collection(firestore, path)
//     deleteDoc(docRef)
//     console.log("Document written with ID: ", docRef.id);
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// }