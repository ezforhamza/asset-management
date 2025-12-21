import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import userService, { type SignInReq } from "@/api/services/userService";

import { toast } from "sonner";
import type { UserInfo, UserToken } from "#/entity";
import { StorageEnum, UserRole } from "#/enum";

type UserStore = {
	userInfo: Partial<UserInfo>;
	userToken: UserToken;

	actions: {
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: UserToken) => void;
		clearUserInfoAndToken: () => void;
	};
};

const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			userInfo: {},
			userToken: {},
			actions: {
				setUserInfo: (userInfo) => {
					set({ userInfo });
				},
				setUserToken: (userToken) => {
					set({ userToken });
				},
				clearUserInfoAndToken() {
					set({ userInfo: {}, userToken: {} });
				},
			},
		}),
		{
			name: "userStore",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				[StorageEnum.UserInfo]: state.userInfo,
				[StorageEnum.UserToken]: state.userToken,
			}),
		},
	),
);

export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserToken = () => useUserStore((state) => state.userToken);
export const useUserPermissions = () => useUserStore((state) => state.userInfo.permissions || []);
export const useUserRoles = () => useUserStore((state) => state.userInfo.roles || []);
export const useUserActions = () => useUserStore((state) => state.actions);

// Check if user is customer admin
export const useIsCustomerAdmin = () => useUserStore((state) => state.userInfo.role === UserRole.CUSTOMER_ADMIN);

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
			return { mustChangePassword: user.mustChangePassword };
		} catch (err: unknown) {
			const error = err as Error;
			toast.error(error.message || "Login failed", {
				position: "top-center",
			});
			throw err;
		}
	};

	return signIn;
};

export const useSignOut = () => {
	const { clearUserInfoAndToken } = useUserActions();

	const signOut = () => {
		clearUserInfoAndToken();
		window.location.href = "/login";
	};

	return signOut;
};

export default useUserStore;
