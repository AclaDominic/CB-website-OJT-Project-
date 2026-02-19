import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

const DynamicTitle = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      document.title = "Cliberduche System";
    } else {
      // Optional: restore default title or handle page-specific titles here
      // For now, consistent with user request: default if not logged in.
      // We can just set it to "Cliberduche Profile" or let individual pages set it if needed.
      // But user specifically asked for "index" title change.
      document.title = "Cliberduche Profile";
    }
  }, [user, location]);
  // Added location dependency in case we want page-specific overrides later,
  // but for strictly user-based, 'user' is enough.
  // Actually, if we navigate away, we might want to re-assert, but 'user' state persists.
  // Kept simple for now.

  return null;
};

export default DynamicTitle;
