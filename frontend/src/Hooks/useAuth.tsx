import { useFrappeAuth, useFrappeGetDoc } from 'frappe-react-sdk';

export const useAuth = () => {
  const auth = useFrappeAuth();
  const userDoc = useFrappeGetDoc(
    "User",
    auth.currentUser || undefined,
    auth.currentUser ? ["current_user_details", auth.currentUser] : undefined,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  );
  const userDetails = userDoc?.data || {};
  return {
    user: userDetails,
    ...auth,
  };
};
