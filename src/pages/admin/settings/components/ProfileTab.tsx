import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Save, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import uploadService from "@/api/services/uploadService";
import userService from "@/api/services/userService";
import { useUserActions, useUserInfo } from "@/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { formatLabel } from "@/utils/formatLabel";

interface ProfileForm {
	name: string;
	email: string;
}

export function ProfileTab() {
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
		},
	});

	useEffect(() => {
		if (userInfo) {
			form.reset({
				name: userInfo.name,
				email: userInfo.email,
			});
		}
	}, [userInfo, form]);

	const updateProfileMutation = useMutation({
		mutationFn: async (data: ProfileForm & { profilePic?: string }) => {
			return userService.updateUser(userInfo?.id || "", data);
		},
		onSuccess: (data) => {
			toast.success("Profile updated successfully");
			setUserInfo(data);
			setProfileImage(data.profilePic || null);
			setSelectedFile(null);
			setPreviewUrl(null);
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: (error: any) => {
			// Error toast is handled by apiClient;
		},
	});

	const handleSubmit = async (values: ProfileForm) => {
		try {
			let imageUrl = profileImage;

			// If a new file was selected, upload it first
			if (selectedFile) {
				const uploadResponse = await uploadService.uploadUserImage(selectedFile);
				imageUrl = uploadResponse.images[0]?.url;
			}

			// Update profile with form data and image URL (only if changed)
			const updateData: ProfileForm & { profilePic?: string } = { ...values };
			if (imageUrl !== userInfo?.profilePic) {
				updateData.profilePic = imageUrl || undefined;
			}

			updateProfileMutation.mutate(updateData);
		} catch (error: any) {
			// Error toast is handled by apiClient;
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

		// Store the file and create preview
		setSelectedFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewUrl(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Personal Information
					</CardTitle>
					<CardDescription>Update your personal details and contact information</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Profile Picture Section */}
					<div className="flex items-center gap-6 mb-6 pb-6 border-b">
						<Avatar className="h-24 w-24">
							<AvatarImage src={previewUrl || profileImage || undefined} alt={userInfo?.name} />
							<AvatarFallback className="text-2xl">{userInfo?.name?.charAt(0).toUpperCase()}</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<h3 className="font-medium mb-1">Profile Picture</h3>
							<p className="text-sm text-muted-foreground mb-3">Upload a profile picture (max 5MB)</p>
							<input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
							<Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
								<Camera className="h-4 w-4 mr-2" />
								Change Picture
							</Button>
							{selectedFile && <p className="text-xs text-muted-foreground mt-2">Selected: {selectedFile.name}</p>}
						</div>
					</div>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: "Invalid email address",
									},
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

							<div className="flex justify-end pt-4">
								<Button type="submit" disabled={updateProfileMutation.isPending}>
									<Save className="h-4 w-4 mr-2" />
									{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
					<CardDescription>View your account details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Role</p>
							<p className="text-sm capitalize">{formatLabel(userInfo?.role)}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">User ID</p>
							<p className="text-xs font-mono text-muted-foreground">{userInfo?.id}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
