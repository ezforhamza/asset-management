import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserInfo, UserToken } from "#/entity";
import { AdminType, StorageEnum, UserRole } from "#/enum";
import sessionService from "@/api/services/sessionService";
import userService, { type SignInReq } from "@/api/services/userService";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type UserStore = {
	userInfo: Partial<UserInfo>;
	userToken: UserToken;
	authStatus: AuthStatus;
	// Session ID to prevent cross-tab role bleeding
	sessionId: string;

	actions: {
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: UserToken) => void;
		clearUserInfoAndToken: () => void;
		setAuthStatus: (status: AuthStatus) => void;
		initializeAuth: () => void;
	};
};

// Generate a unique session ID for this tab
const generateSessionId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Store current tab's session ID in sessionStorage (tab-specific)
const TAB_SESSION_KEY = "currentTabSession";
const getOrCreateTabSessionId = (): string => {
	let tabSessionId = sessionStorage.getItem(TAB_SESSION_KEY);
	if (!tabSessionId) {
		tabSessionId = generateSessionId();
		sessionStorage.setItem(TAB_SESSION_KEY, tabSessionId);
	}
	return tabSessionId;
};

const useUserStore = create<UserStore>()(
	persist(
		(set, get) => {
			const actions = {
				setUserInfo: (userInfo: UserInfo) => {
					const tabSessionId = getOrCreateTabSessionId();
					set({ userInfo, sessionId: tabSessionId, authStatus: "authenticated" });
				},
				setUserToken: (userToken: UserToken) => {
					const tabSessionId = getOrCreateTabSessionId();
					set({ userToken, sessionId: tabSessionId });
				},
				clearUserInfoAndToken() {
					sessionStorage.removeItem(TAB_SESSION_KEY);
					set({ userInfo: {}, userToken: {}, authStatus: "unauthenticated", sessionId: "" });
				},
				setAuthStatus: (authStatus: AuthStatus) => {
					set({ authStatus });
				},
				initializeAuth: () => {
					const state = get();
					const tabSessionId = getOrCreateTabSessionId();

					// Simple check: if we have a token and user info with a role, user is authenticated
					if (state.userToken?.accessToken && state.userInfo?.role) {
						set({ authStatus: "authenticated", sessionId: tabSessionId });
					} else {
						// Clear any stale/partial data to prevent redirect loops
						set({ userInfo: {}, userToken: {}, authStatus: "unauthenticated", sessionId: "" });
					}
				},
			};

			return {
				userInfo: {},
				userToken: {},
				authStatus: "loading" as AuthStatus,
				sessionId: "",
				actions,
			};
		},
		{
			name: "userStore",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				[StorageEnum.UserInfo]: state.userInfo,
				[StorageEnum.UserToken]: state.userToken,
				sessionId: state.sessionId,
			}),
		},
	),
);

export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserToken = () => useUserStore((state) => state.userToken);
export const useAuthStatus = () => useUserStore((state) => state.authStatus);
export const useUserPermissions = () => useUserStore((state) => state.userInfo.permissions || []);
export const useUserRoles = () => useUserStore((state) => state.userInfo.roles || []);
export const useUserActions = () => useUserStore((state) => state.actions);

// Individual action selectors to prevent unnecessary re-renders
export const useSetUserInfo = () => useUserStore((state) => state.actions.setUserInfo);
export const useSetUserToken = () => useUserStore((state) => state.actions.setUserToken);
export const useClearUserInfoAndToken = () => useUserStore((state) => state.actions.clearUserInfoAndToken);
export const useSetAuthStatus = () => useUserStore((state) => state.actions.setAuthStatus);
export const useInitializeAuth = () => useUserStore((state) => state.actions.initializeAuth);

// Check if user is customer admin
export const useIsCustomerAdmin = () => useUserStore((state) => state.userInfo.role === UserRole.CUSTOMER_ADMIN);

// Check if user is a read-only admin (customer_admin with adminType = 'read_only')
export const useIsReadOnlyAdmin = () =>
	useUserStore(
		(state) => state.userInfo.role === UserRole.CUSTOMER_ADMIN && state.userInfo.adminType === AdminType.READ_ONLY,
	);

// Check if user can perform write operations (not a read-only admin)
export const useCanWrite = () =>
	useUserStore(
		(state) => !(state.userInfo.role === UserRole.CUSTOMER_ADMIN && state.userInfo.adminType === AdminType.READ_ONLY),
	);

// Check if user needs to change password
export const useMustChangePassword = () => useUserStore((state) => state.userInfo.mustChangePassword === true);

export const useSignIn = () => {
	const { setUserToken, setUserInfo } = useUserActions();

	const signInMutation = useMutation({
		mutationFn: userService.login,
	});

	const signIn = async (data: SignInReq) => {
		try {
			const res = await signInMutation.mutateAsync(data);
			const { user, tokens } = res;
			setUserToken({
				accessToken: tokens.access.token,
				refreshToken: tokens.refresh.token,
			});
			setUserInfo(user);
			return { mustChangePassword: user.mustChangePassword, role: user.role };
		} catch (err: unknown) {
			// Extract error message from API response
			const axiosError = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
			const errorMessage =
				axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || "Login failed";

			toast.error(errorMessage, {
				position: "top-center",
			});
			throw err;
		}
	};

	return signIn;
};

export const useSignOut = () => {
	const { clearUserInfoAndToken } = useUserActions();

	const signOut = async () => {
		try {
			// Call session logout API to invalidate tokens on server
			await sessionService.logout();
		} catch (error) {
			// Continue with logout even if API call fails
			console.error("Logout API error:", error);
		} finally {
			// Clear all user-related data from Zustand store
			clearUserInfoAndToken();

			// Clear any additional localStorage items that might have user data
			localStorage.removeItem("userStore");
			localStorage.removeItem(StorageEnum.UserInfo);
			localStorage.removeItem(StorageEnum.UserToken);
			localStorage.removeItem(StorageEnum.Settings);

			// Clear sessionStorage
			sessionStorage.clear();

			// Redirect to login page
			window.location.href = "/auth/login";
		}
	};

	return signOut;
};

export default useUserStore;
