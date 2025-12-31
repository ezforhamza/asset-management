import { Camera, Check, Copy, Loader2, UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import uploadService from "@/api/services/uploadService";
import userService from "@/api/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface CreateUserModalProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

interface CreateUserForm {
	name: string;
	email: string;
	role: string;
}

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
	const [loading, setLoading] = useState(false);
	const [tempPassword, setTempPassword] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const form = useForm<CreateUserForm>({
		defaultValues: {
			name: "",
			email: "",
			role: "field_user",
		},
	});

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

	const handleSubmit = async (values: CreateUserForm) => {
		setLoading(true);
		try {
			let profilePicUrl = "";

			// If a file was selected, upload it first
			if (selectedFile) {
				const uploadResponse = await uploadService.uploadUserImage(selectedFile);
				profilePicUrl = uploadResponse.url;
			}

			const result = await userService.createFieldWorker({
				name: values.name,
				email: values.email,
				role: values.role as "field_user" | "customer_admin",
				profilePic: profilePicUrl,
			});

			setTempPassword(result.temporaryPassword ?? null);
			toast.success("User created successfully");
		} catch {
			toast.error("Failed to create user");
		} finally {
			setLoading(false);
		}
	};

	const handleCopyPassword = () => {
		if (tempPassword) {
			navigator.clipboard.writeText(tempPassword);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleClose = () => {
		const hadTempPassword = !!tempPassword;
		form.reset();
		setTempPassword(null);
		setCopied(false);
		setSelectedFile(null);
		setPreviewUrl(null);
		onClose();
		if (hadTempPassword) {
			onSuccess();
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<UserPlus className="h-5 w-5" />
						{tempPassword ? "User Created!" : "Add Team Member"}
					</DialogTitle>
					<DialogDescription>
						{tempPassword ? "Share these credentials with the new user" : "Create a new field worker account"}
					</DialogDescription>
				</DialogHeader>

				{tempPassword ? (
					<div className="space-y-4">
						<div className="rounded-lg border bg-muted/50 p-4 space-y-3">
							<div>
								<Label className="text-xs text-muted-foreground">Email</Label>
								<p className="font-medium">{form.getValues("email")}</p>
							</div>
							<div>
								<Label className="text-xs text-muted-foreground">Temporary Password</Label>
								<div className="flex items-center gap-2 mt-1">
									<code className="flex-1 bg-background px-3 py-2 rounded border font-mono text-sm">
										{tempPassword}
									</code>
									<Button variant="outline" size="icon" onClick={handleCopyPassword}>
										{copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
									</Button>
								</div>
							</div>
						</div>

						<p className="text-sm text-muted-foreground">
							The user will be prompted to change their password on first login.
						</p>

						<Button onClick={handleClose} className="w-full">
							Done
						</Button>
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
							{/* Profile Picture Section */}
							<div className="flex items-center gap-4 pb-4 border-b">
								<Avatar className="h-16 w-16">
									<AvatarImage src={previewUrl || undefined} alt="Profile" />
									<AvatarFallback className="text-lg">
										<UserPlus className="h-6 w-6" />
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<p className="text-sm font-medium mb-1">Profile Picture (Optional)</p>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleImageSelect}
										className="hidden"
									/>
									<Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
										<Camera className="h-4 w-4 mr-2" />
										Choose Picture
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
											<Input type="email" placeholder="john@company.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Role</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
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

							<div className="flex gap-3 pt-2">
								<Button type="button" variant="outline" onClick={handleClose} className="flex-1">
									Cancel
								</Button>
								<Button type="submit" disabled={loading} className="flex-1">
									{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
									Create User
								</Button>
							</div>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default CreateUserModal;
