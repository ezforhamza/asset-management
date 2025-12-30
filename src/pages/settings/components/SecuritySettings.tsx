import { useMutation } from "@tanstack/react-query";
import { Check, Copy, Key, Loader2, QrCode, Shield, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import { Alert, AlertDescription } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";

export function SecuritySettings() {
	const navigate = useNavigate();
	const [setupModalOpen, setSetupModalOpen] = useState(false);
	const [verificationCode, setVerificationCode] = useState("");
	const [copiedCode, setCopiedCode] = useState(false);
	const [mfaEnabled, setMfaEnabled] = useState(false);

	const setupMutation = useMutation({
		mutationFn: userService.setupMFA,
		onSuccess: () => {
			setSetupModalOpen(true);
		},
		onError: () => {
			toast.error("Failed to initialize MFA setup");
		},
	});

	const verifyMutation = useMutation({
		mutationFn: userService.verifyMFA,
		onSuccess: () => {
			toast.success("MFA enabled successfully");
			setMfaEnabled(true);
			setSetupModalOpen(false);
			setVerificationCode("");
		},
		onError: () => {
			toast.error("Invalid verification code");
		},
	});

	const disableMutation = useMutation({
		mutationFn: userService.disableMFA,
		onSuccess: () => {
			toast.success("MFA disabled");
			setMfaEnabled(false);
		},
		onError: () => {
			toast.error("Failed to disable MFA");
		},
	});

	const handleToggleMFA = () => {
		if (mfaEnabled) {
			disableMutation.mutate();
		} else {
			setupMutation.mutate();
		}
	};

	const handleVerify = () => {
		if (verificationCode.length !== 6) {
			toast.error("Please enter a 6-digit code");
			return;
		}
		verifyMutation.mutate({ code: verificationCode });
	};

	const copyBackupCodes = () => {
		if (setupMutation.data?.backupCodes) {
			navigator.clipboard.writeText(setupMutation.data.backupCodes.join("\n"));
			setCopiedCode(true);
			toast.success("Backup codes copied");
			setTimeout(() => setCopiedCode(false), 2000);
		}
	};

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Security Settings
					</CardTitle>
					<CardDescription>Manage your account security and authentication methods</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* MFA Toggle */}
					<div className="flex items-center justify-between p-4 border rounded-lg bg-card">
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
								<Smartphone className="h-5 w-5 text-primary" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium leading-none">Two-Factor Authentication (2FA)</p>
								<p className="text-xs text-muted-foreground">
									Add an extra layer of security using an authenticator app
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 shrink-0">
							{mfaEnabled && (
								<span className="flex items-center gap-1 text-xs text-green-600">
									<ShieldCheck className="h-4 w-4" />
									Enabled
								</span>
							)}
							<Switch
								checked={mfaEnabled}
								onCheckedChange={handleToggleMFA}
								disabled={setupMutation.isPending || disableMutation.isPending}
							/>
						</div>
					</div>

					{/* Password Section */}
					<div className="flex items-center justify-between p-4 border rounded-lg bg-card">
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
								<Key className="h-5 w-5 text-primary" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium leading-none">Password</p>
								<p className="text-xs text-muted-foreground">Change your account password</p>
							</div>
						</div>
<<<<<<< HEAD
						<Button variant="outline" onClick={() => navigate("/change-password")}>
=======
						<Button variant="outline" size="sm" onClick={() => (window.location.href = "/change-password")}>
>>>>>>> nafees
							Change Password
						</Button>
					</div>

					{/* Active Sessions (future feature indicator) */}
					<div className="flex items-center justify-between p-4 border rounded-lg bg-card opacity-60">
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
								<Shield className="h-5 w-5 text-muted-foreground" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium leading-none">Active Sessions</p>
								<p className="text-xs text-muted-foreground">View and manage your active login sessions</p>
							</div>
						</div>
						<Button variant="outline" size="sm" disabled>
							Coming Soon
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* MFA Setup Modal */}
			<Dialog open={setupModalOpen} onOpenChange={setSetupModalOpen}>
				<DialogContent className="sm:max-w-[450px]">
					<DialogHeader>
						<DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
						<DialogDescription>
							Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* QR Code */}
						<div className="flex justify-center">
							<div className="p-4 bg-white rounded-lg border">
								{setupMutation.data?.qrCodeUrl ? (
									<img src={setupMutation.data.qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
								) : (
									<div className="w-48 h-48 flex items-center justify-center bg-muted">
										<QrCode className="h-24 w-24 text-muted-foreground" />
									</div>
								)}
							</div>
						</div>

						{/* Manual Entry Code */}
						{setupMutation.data?.secret && (
							<div className="text-center">
								<p className="text-xs text-muted-foreground mb-1">Or enter this code manually:</p>
								<code className="text-sm font-mono bg-muted px-3 py-1 rounded">{setupMutation.data.secret}</code>
							</div>
						)}

						{/* Verification Code Input */}
						<div className="space-y-2">
							<Label>Enter 6-digit verification code</Label>
							<Input
								type="text"
								inputMode="numeric"
								pattern="[0-9]*"
								maxLength={6}
								placeholder="000000"
								value={verificationCode}
								onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
								className="text-center text-2xl tracking-widest font-mono"
							/>
						</div>

						{/* Backup Codes */}
						{setupMutation.data?.backupCodes && (
							<Alert>
								<AlertDescription>
									<div className="flex items-center justify-between">
										<span className="text-sm">Save your backup codes securely</span>
										<Button variant="ghost" size="sm" onClick={copyBackupCodes}>
											{copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
										</Button>
									</div>
									<div className="mt-2 grid grid-cols-2 gap-1 text-xs font-mono">
										{setupMutation.data.backupCodes.map((code, idx) => (
											<span key={idx} className="bg-muted px-2 py-1 rounded">
												{code}
											</span>
										))}
									</div>
								</AlertDescription>
							</Alert>
						)}
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setSetupModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleVerify} disabled={verifyMutation.isPending || verificationCode.length !== 6}>
							{verifyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Verify & Enable
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
