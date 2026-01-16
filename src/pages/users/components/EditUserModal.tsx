import { Camera, Loader2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import uploadService from "@/api/services/uploadService";
import userService from "@/api/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface EditUserModalProps {
	user: UserInfo | null;
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

interface EditUserForm {
	name: string;
	email: string;
	role: string;
	adminType: string;
}

export function EditUserModal({ user, open, onClose, onSuccess }: EditUserModalProps) {
	const [loading, setLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const form = useForm<EditUserForm>({
		defaultValues: {
			name: "",
			email: "",
			role: "field_user",
			adminType: "full",
		},
	});

	const selectedRole = form.watch("role");

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name || "",
				email: user.email || "",
				role: user.role || "field_user",
				adminType: user.adminType || "full",
			});
			setPreviewUrl(null);
			setSelectedFile(null);
		}
	}, [user, form]);

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
		reader.onloadend = () => {
			setPreviewUrl(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleSubmit = async (values: EditUserForm) => {
		if (!user?.id) return;

		setLoading(true);
		try {
			let imageUrl = user.profilePic;

			// If a new file was selected, upload it first
			if (selectedFile) {
				const uploadResponse = await uploadService.uploadUserImage(selectedFile);
				imageUrl = uploadResponse.images[0]?.url;
			}

			const updateData: any = {
				name: values.name,
				role: values.role as "field_user" | "customer_admin",
				adminType: values.role === "customer_admin" ? (values.adminType as "full" | "read_only") : null,
			};

			// Only include profilePic if it changed
			if (imageUrl !== user.profilePic) {
				updateData.profilePic = imageUrl;
			}

			await userService.updateUser(user.id, updateData);

			toast.success("User updated successfully");
			onSuccess();
			onClose();
		} catch {
			// Error toast is handled by apiClient
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Edit User
					</DialogTitle>
					<DialogDescription>Update user details and permissions</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						{/* Profile Picture Section */}
						<div className="flex items-center gap-4 pb-4 border-b">
							<Avatar className="h-16 w-16">
								<AvatarImage src={previewUrl || user?.profilePic || undefined} alt={user?.name} />
								<AvatarFallback className="text-lg">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<p className="text-sm font-medium mb-1">Profile Picture</p>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleImageSelect}
									className="hidden"
								/>
								<Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
									<Camera className="h-4 w-4 mr-2" />
									Change Picture
								</Button>
								{selectedFile && <p className="text-xs text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
							</div>
						</div>

						<FormField
							control={form.control}
							name="name"
							rules={{ required: "Name is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input type="email" disabled {...field} />
									</FormControl>
									<p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select role" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="field_user">Field User</SelectItem>
											<SelectItem value="customer_admin">Admin</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{selectedRole === "customer_admin" && (
							<FormField
								control={form.control}
								name="adminType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Admin Type</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select admin type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="full">Full Admin</SelectItem>
												<SelectItem value="read_only">Read-Only Admin</SelectItem>
											</SelectContent>
										</Select>
										<p className="text-xs text-muted-foreground mt-1">
											Read-only admins can only view data, not create/edit/delete
										</p>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<div className="flex gap-3 pt-2">
							<Button type="button" variant="outline" onClick={onClose} className="flex-1">
								Cancel
							</Button>
							<Button type="submit" disabled={loading} className="flex-1">
								{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Save Changes
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default EditUserModal;
