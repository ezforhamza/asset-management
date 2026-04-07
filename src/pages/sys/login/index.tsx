import { Navigate } from "react-router";

// Legacy login page - redirects to customer portal login
export default function LoginPage() {
	return <Navigate to="/customer-portal/login" replace />;
}
