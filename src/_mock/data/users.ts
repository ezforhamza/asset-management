import type { UserInfo } from "#/entity";
import { UserRole } from "#/enum";

export const MOCK_COMPANY_ID = "company_001";

export const MOCK_USERS: UserInfo[] = [
	{
		id: "user_001",
		email: "admin@assetguard.com",
		username: "admin",
		name: "John Admin",
		role: UserRole.CUSTOMER_ADMIN,
		companyId: MOCK_COMPANY_ID,
		mustChangePassword: false,
		lastLogin: "2025-01-10T14:30:00Z",
	},
	{
		id: "user_002",
		email: "ali@assetguard.com",
		username: "ali",
		name: "Ali Ahmed",
		role: UserRole.FIELD_USER,
		companyId: MOCK_COMPANY_ID,
		mustChangePassword: false,
		lastLogin: "2025-01-10T09:15:00Z",
	},
	{
		id: "user_003",
		email: "sara@assetguard.com",
		username: "sara",
		name: "Sara Khan",
		role: UserRole.FIELD_USER,
		companyId: MOCK_COMPANY_ID,
		mustChangePassword: false,
		lastLogin: "2025-01-09T16:45:00Z",
	},
	{
		id: "user_004",
		email: "ahmed@assetguard.com",
		username: "ahmed",
		name: "Ahmed Hassan",
		role: UserRole.FIELD_USER,
		companyId: MOCK_COMPANY_ID,
		mustChangePassword: true,
		lastLogin: undefined,
	},
	{
		id: "user_005",
		email: "fatima@assetguard.com",
		username: "fatima",
		name: "Fatima Malik",
		role: UserRole.FIELD_USER,
		companyId: MOCK_COMPANY_ID,
		mustChangePassword: false,
		lastLogin: "2025-01-08T11:20:00Z",
	},
];

export const MOCK_CREDENTIALS = {
	email: "admin@assetguard.com",
	password: "admin123",
};
