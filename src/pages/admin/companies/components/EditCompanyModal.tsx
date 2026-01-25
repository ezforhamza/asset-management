import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Company } from "#/entity";
import adminService from "@/api/services/adminService";
import uploadService from "@/api/services/uploadService";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

interface EditCompanyModalProps {
	company: Company | null;
	open: boolean;
	onClose: () => void;
}

interface FormValues {
	companyName: string;
	contactEmail: string;
	logo?: string;
}

export function EditCompanyModal({ company, open, onClose }: EditCompanyModalProps) {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const form = useForm<FormValues>({
		defaultValues: {
			companyName: "",
			contactEmail: "",
			logo: "",
		},
	});

	useEffect(() => {
		if (company) {
			form.reset({
				companyName: company.companyName || "",
				contactEmail: company.contactEmail || "",
				logo: company.logo || "",
			});
			setLogoPreview(company.logo || null);
		}
	}, [company, form]);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		try {
			setIsUploading(true);
			const result = await uploadService.uploadCompanyLogo(file);
			if (result.images && result.images.length > 0) {
				const uploadedUrl = result.images[0].url;
				form.setValue("logo", uploadedUrl);
				setLogoPreview(uploadedUrl);
				toast.success("Logo uploaded successfully");
			}
		} catch {
			toast.error("Failed to upload logo");
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleRemoveLogo = () => {
		form.setValue("logo", "");
		setLogoPreview(null);
	};

	const mutation = useMutation({
		mutationFn: (data: FormValues) => adminService.updateCompany(company!._id, data),
		onSuccess: () => {
			toast.success("Company updated successfully");
			queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
			onClose();
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	const handleSubmit = (values: FormValues) => {
		mutation.mutate(values);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Company</DialogTitle>
					<DialogDescription>Update company information.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						{/* Company Logo - First in form */}
						<div className="space-y-2">
							<FormLabel>Company Logo</FormLabel>
							<div className="flex items-center gap-4">
								<Avatar className="h-16 w-16">
									<AvatarImage src={logoPreview || undefined} alt="Company logo" />
									<AvatarFallback className="bg-primary/10 text-primary">
										<Building2 className="h-8 w-8" />
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col gap-2">
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleFileSelect}
										className="hidden"
									/>
									<div className="flex gap-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => fileInputRef.current?.click()}
											disabled={isUploading}
										>
											{isUploading ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<Upload className="h-4 w-4 mr-2" />
											)}
											Upload
										</Button>
										{logoPreview && (
											<Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo}>
												<X className="h-4 w-4 mr-1" />
												Remove
											</Button>
										)}
									</div>
									<p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
								</div>
							</div>
						</div>

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
								required: "Email is required",
								pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contact Email *</FormLabel>
									<FormControl>
										<Input type="email" placeholder="admin@company.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Save Changes
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
