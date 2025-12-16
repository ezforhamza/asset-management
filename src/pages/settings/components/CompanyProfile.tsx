import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import companyService from "@/api/services/companyService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";

interface CompanyProfileForm {
	companyName: string;
	contactEmail: string;
	phone: string;
	address: string;
}

export function CompanyProfile() {
	const queryClient = useQueryClient();

	const { data: profile, isLoading } = useQuery({
		queryKey: ["company", "profile"],
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

	// Update form when data loads
	useEffect(() => {
		if (profile) {
			form.reset({
				companyName: profile.companyName || "",
				contactEmail: profile.contactEmail || "",
				phone: profile.phone || "",
				address: profile.address || "",
			});
		}
	}, [profile, form]);

	const mutation = useMutation({
		mutationFn: companyService.updateProfile,
		onSuccess: () => {
			toast.success("Company profile updated");
			queryClient.invalidateQueries({ queryKey: ["company", "profile"] });
		},
		onError: () => {
			toast.error("Failed to update profile");
		},
	});

	const handleSubmit = (values: CompanyProfileForm) => {
		mutation.mutate(values);
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-64 mt-2" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
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
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

						<Button type="submit" disabled={mutation.isPending}>
							{mutation.isPending ? (
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
