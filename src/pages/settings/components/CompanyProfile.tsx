import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Camera, Loader2, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import companyService from "@/api/services/companyService";
import uploadService from "@/api/services/uploadService";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

interface CompanyProfileForm {
	companyName: string;
	contactEmail: string;
	phone: string;
	address: string;
}

export function CompanyProfile() {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [uploadingLogo, setUploadingLogo] = useState(false);

	// Fetch current company profile
	const { data: company, isLoading: loadingProfile } = useQuery({
		queryKey: ["company-profile"],
		queryFn: companyService.getProfile,
	});

	const form = useForm<CompanyProfileForm>({
		defaultValues: {
			companyName: "",
			contactEmail: "",
			phone: "",
			address: "",
		},
	});

	// Populate form when company data loads
	useEffect(() => {
		if (company) {
			form.reset({
				companyName: company.companyName || "",
				contactEmail: company.contactEmail || "",
				phone: company.phone || "",
				address: company.address || "",
			});
			// Set the current logo as preview if exists
			if (company.logo) {
				setPreviewUrl(company.logo);
			}
		}
	}, [company, form]);

	const mutation = useMutation({
		mutationFn: companyService.updateProfile,
		onSuccess: () => {
			toast.success("Company profile updated");
			queryClient.invalidateQueries({ queryKey: ["company-profile"] });
		},
		onError: () => {
			// Error toast is handled by apiClient;
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

	const handleSubmit = async (values: CompanyProfileForm) => {
		setUploadingLogo(true);
		try {
			let logoUrl = company?.logo || "";

			// If a new file was selected, upload it first
			if (selectedFile) {
				const uploadResponse = await uploadService.uploadCompanyLogo(selectedFile);
				logoUrl = uploadResponse.images[0]?.url;
			}

			await mutation.mutateAsync({
				...values,
				logo: logoUrl,
			});

			setSelectedFile(null);
		} catch {
			// Error handled by mutation
		} finally {
			setUploadingLogo(false);
		}
	};

	const getCompanyInitials = () => {
		const name = form.watch("companyName") || company?.companyName || "C";
		return name.substring(0, 2).toUpperCase();
	};

	if (loadingProfile) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Company Profile
					</CardTitle>
					<CardDescription>Your organization's basic information</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Building2 className="h-5 w-5" />
					Company Profile
				</CardTitle>
				<CardDescription>Your organization's basic information</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
						{/* Company Logo Section */}
						<div className="space-y-2">
							<Label>Company Logo</Label>
							<div className="flex items-center gap-4">
								<div className="relative">
									<Avatar className="h-20 w-20">
										<AvatarImage src={previewUrl || undefined} alt="Company logo" />
										<AvatarFallback className="text-lg bg-primary/10 text-primary">
											{getCompanyInitials()}
										</AvatarFallback>
									</Avatar>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
									>
										<Camera className="h-3.5 w-3.5" />
									</button>
								</div>
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Upload a company logo. Recommended size: 200x200px.</p>
									<p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, GIF up to 5MB</p>
								</div>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleImageSelect}
									className="hidden"
								/>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="companyName"
								rules={{ required: "Company name is required" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="contactEmail"
								rules={{ required: "Email is required" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact Email</FormLabel>
										<FormControl>
											<Input type="email" {...field} />
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
											<Input type="tel" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button type="submit" disabled={mutation.isPending || uploadingLogo}>
							{mutation.isPending || uploadingLogo ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							Save Changes
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

export default CompanyProfile;
