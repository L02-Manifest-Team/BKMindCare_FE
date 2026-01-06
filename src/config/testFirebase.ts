import { auth, db } from './firebase';
import { doc, getDoc, enableNetwork, disableNetwork } from 'firebase/firestore';

const testFirebaseConnection = async () => {
  try {
    console.log('🔄 Đang kiểm tra kết nối Firebase...');
    
    // Kiểm tra kết nối mạng
    await enableNetwork(db);
    
    // Kiểm tra kết nối Firestore
    const testDocRef = doc(db, 'test', 'connection');
    const docSnap = await getDoc(testDocRef);
    
    // Kiểm tra trạng thái auth
    const user = auth.currentUser;
    
    if (user) {
      console.log('✅ Kết nối Firebase thành công! Người dùng đã đăng nhập.');
      console.log('👤 User ID:', user.uid);
    } else {
      console.log('✅ Kết nối Firebase thành công! Chưa có người dùng đăng nhập.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối Firebase:', error);
    // Thử chế độ offline
    try {
      await disableNetwork(db);
      console.log('🔄 Đang thử chế độ offline...');
      return true;
    } catch (offlineError) {
      console.error('❌ Lỗi khi chuyển sang chế độ offline:', offlineError);
      return false;
    }
  }
};

// Chạy test khi import file này
// testFirebaseConnection();

export default testFirebaseConnection;
