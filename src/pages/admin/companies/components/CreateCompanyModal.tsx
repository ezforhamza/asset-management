import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import { Alert, AlertDescription } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

interface CreateCompanyModalProps {
	open: boolean;
	onClose: () => void;
}

interface FormValues {
	companyName: string;
	contactEmail: string;
	adminName: string;
	adminEmail: string;
	adminPassword: string;
}

interface CreatedCredentials {
	companyName: string;
	email: string;
	temporaryPassword: string;
}

export function CreateCompanyModal({ open, onClose }: CreateCompanyModalProps) {
	const queryClient = useQueryClient();
	const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
	const [copied, setCopied] = useState<"email" | "password" | "all" | null>(null);

	const form = useForm<FormValues>({
		defaultValues: {
			companyName: "",
			contactEmail: "",
			adminName: "",
			adminEmail: "",
			adminPassword: "",
		},
	});

	const mutation = useMutation({
		mutationFn: adminService.createCompany,
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
			// Show credentials screen
			setCredentials({
				companyName: variables.companyName,
				email: variables.admin.email,
				temporaryPassword: variables.admin.password,
			});
			toast.success("Company created successfully");
		},
		onError: () => {
			toast.error("Failed to create company");
		},
	});

	const handleClose = () => {
		form.reset();
		setCredentials(null);
		setCopied(null);
		onClose();
	};

	const handleSubmit = (values: FormValues) => {
		mutation.mutate({
			companyName: values.companyName,
			contactEmail: values.contactEmail,
			admin: {
				name: values.adminName,
				email: values.adminEmail,
				password: values.adminPassword,
			},
		});
	};

	const copyToClipboard = async (text: string, type: "email" | "password" | "all") => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(type);
			toast.success("Copied to clipboard");
			setTimeout(() => setCopied(null), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	};

	const copyAllCredentials = () => {
		if (!credentials) return;
		const text = `Company: ${credentials.companyName}\nEmail: ${credentials.email}\nTemporary Password: ${credentials.temporaryPassword}\n\nNote: User must change password on first login.`;
		copyToClipboard(text, "all");
	};

	// Show credentials after successful creation
	if (credentials) {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="text-green-600">Company Created Successfully!</DialogTitle>
						<DialogDescription>
							Share these credentials with the company admin. They will be required to change their password on first
							login.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<Alert>
							<AlertDescription className="text-amber-600">
								⚠️ Save these credentials now. The password cannot be retrieved later.
							</AlertDescription>
						</Alert>

						<div className="space-y-3 bg-muted/50 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Company</p>
									<p className="font-medium">{credentials.companyName}</p>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Email</p>
									<p className="font-mono text-sm">{credentials.email}</p>
								</div>
								<Button variant="ghost" size="icon" onClick={() => copyToClipboard(credentials.email, "email")}>
									{copied === "email" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
								</Button>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Temporary Password</p>
									<p className="font-mono text-sm font-bold">{credentials.temporaryPassword}</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => copyToClipboard(credentials.temporaryPassword, "password")}
								>
									{copied === "password" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
								</Button>
							</div>
						</div>
					</div>

					<DialogFooter className="flex-col sm:flex-row gap-2">
						<Button variant="outline" onClick={copyAllCredentials} className="w-full sm:w-auto">
							{copied === "all" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
							Copy All Credentials
						</Button>
						<Button onClick={handleClose} className="w-full sm:w-auto">
							Done
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create New Company</DialogTitle>
					<DialogDescription>
						Add a new company to the system. A customer admin account will be created automatically.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="space-y-4">
							<div className="text-sm font-medium text-muted-foreground">Company Information</div>
							<FormField
								control={form.control}
								name="companyName"
								rules={{ required: "Company name is required" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Name *</FormLabel>
										<FormControl>
											<Input placeholder="Enter company name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="contactEmail"
								rules={{
									required: "Contact email is required",
									pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact Email *</FormLabel>
										<FormControl>
											<Input type="email" placeholder="contact@company.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-4 pt-4 border-t">
							<div className="text-sm font-medium text-muted-foreground">Default Admin Account</div>
							<FormField
								control={form.control}
								name="adminName"
								rules={{ required: "Admin name is required" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Admin Name *</FormLabel>
										<FormControl>
											<Input placeholder="John Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="adminEmail"
								rules={{
									required: "Admin email is required",
									pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Admin Email *</FormLabel>
										<FormControl>
											<Input type="email" placeholder="admin@company.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="adminPassword"
								rules={{
									required: "Password is required",
									minLength: { value: 8, message: "Password must be at least 8 characters" },
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Admin Password *</FormLabel>
										<FormControl>
											<Input type="password" placeholder="Min 8 characters" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Create Company
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
