import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import { useUserActions, useUserInfo } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

interface ProfileForm {
	name: string;
	email: string;
}

export function ProfileTab() {
	const userInfo = useUserInfo();
	const { setUserInfo } = useUserActions();
	const queryClient = useQueryClient();

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
		mutationFn: (data: ProfileForm) => userService.updateUser(userInfo?.id || "", data),
		onSuccess: (data) => {
			toast.success("Profile updated successfully");
			setUserInfo(data);
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update profile");
		},
	});

	const handleSubmit = (values: ProfileForm) => {
		updateProfileMutation.mutate(values);
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
							<p className="text-sm capitalize">{userInfo?.role?.replace("_", " ")}</p>
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
