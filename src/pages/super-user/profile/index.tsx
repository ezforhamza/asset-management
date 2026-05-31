import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock, User } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import userService, { type ChangePasswordReq } from "@/api/services/userService";
import { useUserActions, useUserInfo } from "@/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { PasswordInput } from "@/ui/password-input";

interface ChangePasswordForm extends ChangePasswordReq {
	confirmPassword: string;
}

export default function SuperUserProfilePage() {
	const userInfo = useUserInfo();
	const { setUserInfo } = useUserActions();
	const [nameValue, setNameValue] = useState(userInfo.name || "");
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [isChangingPw, setIsChangingPw] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const pwForm = useForm<ChangePasswordForm>({
		defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
	});

	const uploadMutation = useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData();
			formData.append("image", file);
			const res = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL || "/api/v1"}/uploads/user-image`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${(await import("@/store/userStore")).default.getState().userToken?.accessToken}`,
				},
				body: formData,
			});
			if (!res.ok) throw new Error("Upload failed");
			const data = await res.json();
			return data.imageUrl as string;
		},
		onSuccess: async (imageUrl) => {
			await adminService.updateUser(userInfo.id ?? "", { profilePic: imageUrl } as never);
			setUserInfo({ ...userInfo, profilePic: imageUrl } as never);
			toast.success("Profile picture updated");
		},
		onError: () => toast.error("Failed to upload image"),
	});

	const handleSaveProfile = async () => {
		if (!nameValue.trim()) return;
		setIsSavingProfile(true);
		try {
			await adminService.updateUser(userInfo.id ?? "", { name: nameValue } as never);
			setUserInfo({ ...userInfo, name: nameValue } as never);
			toast.success("Profile updated");
		} catch {}
		setIsSavingProfile(false);
	};

	const handleChangePassword = async (values: ChangePasswordForm) => {
		if (values.newPassword !== values.confirmPassword) {
			pwForm.setError("confirmPassword", { message: "Passwords do not match" });
			return;
		}
		setIsChangingPw(true);
		try {
			await userService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
			toast.success("Password changed successfully");
			pwForm.reset();
		} catch {}
		setIsChangingPw(false);
	};

	return (
		<div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
			{/* Personal Info */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Personal Information
					</CardTitle>
					<CardDescription>Update your display name and profile picture.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					{/* Avatar */}
					<div className="flex items-center gap-4">
						<Avatar className="h-16 w-16">
							<AvatarImage src={userInfo.profilePic || undefined} alt={userInfo.name} />
							<AvatarFallback className="bg-primary/10 text-primary text-xl">
								{userInfo.name?.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								disabled={uploadMutation.isPending}
							>
								{uploadMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Change Photo
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) uploadMutation.mutate(file);
								}}
							/>
						</div>
					</div>

					{/* Name */}
					<div className="space-y-2">
						<label htmlFor="profile-name" className="text-sm font-medium">
							Name
						</label>
						<Input
							id="profile-name"
							value={nameValue}
							onChange={(e) => setNameValue(e.target.value)}
							placeholder="Your name"
						/>
					</div>

					{/* Read-only fields */}
					<div className="space-y-2">
						<label htmlFor="profile-email" className="text-sm font-medium">
							Email
						</label>
						<Input
							id="profile-email"
							value={userInfo.email || ""}
							readOnly
							className="bg-muted/40 cursor-not-allowed"
						/>
						<p className="text-xs text-muted-foreground">Email cannot be changed from your profile.</p>
					</div>

					<div className="space-y-2">
						<label htmlFor="profile-role" className="text-sm font-medium">
							Role
						</label>
						<Input id="profile-role" value="Support Team" readOnly className="bg-muted/40 cursor-not-allowed" />
					</div>

					<Button onClick={handleSaveProfile} disabled={isSavingProfile || !nameValue.trim()}>
						{isSavingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Save Profile
					</Button>
				</CardContent>
			</Card>

			{/* Change Password */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Lock className="h-5 w-5" />
						Change Password
					</CardTitle>
					<CardDescription>
						Choose a strong password with at least 8 characters including a letter and a number.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...pwForm}>
						<form onSubmit={pwForm.handleSubmit(handleChangePassword)} className="space-y-4">
							<FormField
								control={pwForm.control}
								name="currentPassword"
								rules={{ required: "Current password is required" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Current Password</FormLabel>
										<FormControl>
											<PasswordInput placeholder="Enter current password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={pwForm.control}
								name="newPassword"
								rules={{
									required: "New password is required",
									minLength: { value: 8, message: "At least 8 characters" },
									pattern: { value: /^(?=.*[a-zA-Z])(?=.*\d)/, message: "Must contain a letter and a number" },
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Password</FormLabel>
										<FormControl>
											<PasswordInput placeholder="Enter new password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={pwForm.control}
								name="confirmPassword"
								rules={{ required: "Please confirm your password" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm New Password</FormLabel>
										<FormControl>
											<PasswordInput placeholder="Repeat new password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={isChangingPw}>
								{isChangingPw && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Change Password
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
