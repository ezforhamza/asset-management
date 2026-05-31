import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { PasswordInput } from "@/ui/password-input";

interface CreateSuperUserModalProps {
	open: boolean;
	onClose: () => void;
}

interface FormValues {
	name: string;
	email: string;
	password: string;
}

interface CreatedCredentials {
	name: string;
	email: string;
	password: string;
}

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	const handleCopy = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};
	return (
		<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy}>
			{copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
		</Button>
	);
}

export function CreateSuperUserModal({ open, onClose }: CreateSuperUserModalProps) {
	const queryClient = useQueryClient();
	const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);

	const form = useForm<FormValues>({
		defaultValues: { name: "", email: "", password: "" },
	});

	const mutation = useMutation({
		mutationFn: (data: FormValues) =>
			adminService.createSuperUserAccount({
				name: data.name,
				email: data.email,
				password: data.password || undefined,
			}),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: ["admin", "super-users"] });
			const finalPassword = response.temporaryPassword ?? variables.password;
			if (finalPassword) {
				setCredentials({ name: variables.name, email: variables.email, password: finalPassword });
			} else {
				toast.success("Super user created successfully");
				handleClose();
			}
		},
		onError: () => {},
	});

	const handleClose = () => {
		form.reset();
		setCredentials(null);
		onClose();
	};

	if (credentials) {
		const bothText = `Email: ${credentials.email} | Password: ${credentials.password}`;
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Check className="h-5 w-5 text-emerald-500" />
							Super user created successfully
						</DialogTitle>
						<DialogDescription>
							Share these credentials with the user. This password will <strong>NOT</strong> be shown again.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3 py-2">
						<div className="p-4 bg-muted rounded-lg space-y-3">
							{[
								{ label: "Name", value: credentials.name },
								{ label: "Email", value: credentials.email },
								{ label: "Password", value: credentials.password },
							].map(({ label, value }) => (
								<div key={label} className="flex items-center justify-between gap-2">
									<div className="min-w-0">
										<p className="text-xs text-muted-foreground">{label}</p>
										<p className="font-mono text-sm break-all">{value}</p>
									</div>
									<CopyButton text={value} />
								</div>
							))}
						</div>
						<Button
							variant="outline"
							size="sm"
							className="w-full"
							onClick={() => {
								navigator.clipboard.writeText(bothText);
								toast.success("Credentials copied");
							}}
						>
							<Copy className="h-4 w-4 mr-2" />
							Copy Both
						</Button>
					</div>

					<DialogFooter>
						<Button onClick={handleClose}>Done</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[460px]">
				<DialogHeader>
					<DialogTitle>Create Super User</DialogTitle>
					<DialogDescription>
						Create a support team member account. Leave password blank to auto-generate.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							rules={{ required: "Name is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name *</FormLabel>
									<FormControl>
										<Input placeholder="John Support" {...field} />
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
								pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email *</FormLabel>
									<FormControl>
										<Input type="email" placeholder="support@company.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password (optional)</FormLabel>
									<FormControl>
										<PasswordInput placeholder="Leave blank to auto-generate" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Create
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
