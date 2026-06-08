import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Save, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import uploadService from "@/api/services/uploadService";
import userService from "@/api/services/userService";
import { useUserActions, useUserInfo } from "@/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

interface ProfileForm {
	name: string;
	email: string;
	phone: string;
}

export function ProfileSettings() {
	const userInfo = useUserInfo();
	const { setUserInfo } = useUserActions();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [profileImage, setProfileImage] = useState<string | null>(userInfo?.profilePic || null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const form = useForm<ProfileForm>({
		defaultValues: {
			name: userInfo?.name || "",
			email: userInfo?.email || "",
			phone: userInfo?.phone || "",
		},
	});

	useEffect(() => {
		if (userInfo) {
			form.reset({ name: userInfo.name, email: userInfo.email, phone: userInfo.phone || "" });
			if (!selectedFile) setProfileImage(userInfo.profilePic || null);
		}
	}, [userInfo, form, selectedFile]);

	const updateProfileMutation = useMutation({
		mutationFn: async (data: ProfileForm & { profilePic?: string }) => {
			return userService.updateUser(userInfo?.id || "", data);
		},
		onSuccess: (data) => {
			toast.success("Profile updated successfully");
			setUserInfo({ ...userInfo, ...data } as UserInfo);
			setProfileImage(data.profilePic || null);
			setSelectedFile(null);
			setPreviewUrl(null);
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: () => {},
	});

	const handleSubmit = async (values: ProfileForm) => {
		try {
			let imageUrl = profileImage;
			if (selectedFile) {
				const uploadResponse = await uploadService.uploadUserImage(selectedFile);
				imageUrl = uploadResponse.images[0]?.url;
			}
			const updateData: ProfileForm & { profilePic?: string } = { ...values };
			if (imageUrl !== userInfo?.profilePic) {
				updateData.profilePic = imageUrl || undefined;
			}
			await userService.updateMe({ name: values.name, phone: values.phone || null });
			const { phone: _phone, ...dataWithoutPhone } = updateData;
			updateProfileMutation.mutate(dataWithoutPhone as ProfileForm & { profilePic?: string });
		} catch {
			// handled by apiClient
		}
	};

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image size must be less than 5MB");
			return;
		}
		setSelectedFile(file);
		const reader = new FileReader();
		reader.onloadend = () => setPreviewUrl(reader.result as string);
		reader.readAsDataURL(file);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					Personal Profile
				</CardTitle>
				<CardDescription>Update your profile picture and personal details</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-6 mb-6 pb-6 border-b">
					<div className="relative">
						<Avatar className="h-20 w-20">
							<AvatarImage src={previewUrl || profileImage || undefined} alt={userInfo?.name} />
							<AvatarFallback className="text-xl">{userInfo?.name?.charAt(0).toUpperCase()}</AvatarFallback>
						</Avatar>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
						>
							<Camera className="h-3.5 w-3.5" />
						</button>
					</div>
					<div>
						<p className="text-sm font-medium mb-1">Profile Picture</p>
						<p className="text-sm text-muted-foreground">Upload a photo (max 5MB, JPG/PNG)</p>
						{selectedFile && <p className="text-xs text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
					</div>
					<input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="name"
								rules={{ required: "Name is required" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter your full name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								rules={{
									required: "Email is required",
									pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email Address</FormLabel>
										<FormControl>
											<Input type="email" placeholder="Enter your email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone Number</FormLabel>
										<FormControl>
											<Input type="tel" placeholder="e.g. +27 11 555 1234" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex justify-end">
							<Button type="submit" disabled={updateProfileMutation.isPending}>
								<Save className="h-4 w-4 mr-2" />
								{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

export default ProfileSettings;
