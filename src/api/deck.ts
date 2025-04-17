import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { firestore } from "./common/firebase";

export const getDecks = async () => {
    const docRef = doc(firestore, "decks", "");
    const docSnap = await getDoc(docRef);
    const q = query(collection(firestore, 'decks'), where('ownerID', '==', ''))

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
    });

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
    } else {
        console.log("No such document!");
    }
}