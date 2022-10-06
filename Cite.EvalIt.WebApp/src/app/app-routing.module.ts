import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { AppPermission } from '@app/core/enum/permission.enum';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';

const appRoutes: Routes = [

	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{
		path: 'home',
		loadChildren: () => import('@app/ui/home/home.module').then(m => m.HomeModule)
	},
	{
		path: 't/:tenantCode',
		loadChildren: () => import('@app/ui/misc/tenant/tenant.module').then(m => m.TenantModule)
	},
	{
		path: 'login',
		loadChildren: () => import('@idp-service/ui/login/login.module').then(m => m.LoginModule)
	},
	{
		path: 'signup-register',
		loadChildren: () => import('@idp-service/ui/user-registration/user-registration.module').then(m => m.UserRegistrationModule),
		data: {
			mode: SignUpMode.Register
		}
	},
	{
		path: 'signup-invitation',
		loadChildren: () => import('@idp-service/ui/user-registration/user-registration.module').then(m => m.UserRegistrationModule),
		data: {
			mode: SignUpMode.Invitation
		}
	},
	{
		path: 'directlink-register',
		loadChildren: () => import('@idp-service/ui/user-registration/user-registration.module').then(m => m.UserRegistrationModule),
		data: {
			mode: SignUpMode.Register,
			directlink: true,
		}
	},
	{
		path: 'email-reset',
		loadChildren: () => import('@user-service/ui/email-reset/email-reset.module').then(m => m.EmailResetModule)
	},
	{
		path: 'password-reset-confirmation',
		loadChildren: () => import('@idp-service/ui/password-reset/password-reset.module').then(m => m.PasswordResetModule)
	},
	{
		path: 'users',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewUsersPage]
			}
		},
		loadChildren: () => import('@user-service/ui/users/user.module').then(m => m.UserModule)
	},
	{
		path: 'app-users',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewUsersPage]
			}
		},
		loadChildren: () => import('@app/ui/app-user/app-user.module').then(m => m.AppUserModule)
	},
	{
		path: 'tags',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewTagsPage]
			}
		},
		loadChildren: () => import('@app/ui/tag/tag.module').then(m => m.TagModule)
	},
	{
		path: 'data-object-type',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewDataObjectTypesPage]
			}
		},
		loadChildren: () => import('@app/ui/data-object-type/data-object-type.module').then(m => m.DataObjectTypeModule)
	},
	{
		path: 'data-object',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewDataObjectsPage]
			}
		},
		loadChildren: () => import('@app/ui/data-object/data-object.module').then(m => m.DataObjectModule)
	},
	{
		path: 'rank-recalculation-task',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewRankRecalculationTaskPage]
			}
		},
		loadChildren: () => import('@app/ui/rank-recalculation-task/rank-recalculation-task.module').then(m => m.RankRecalculationTaskModule)
	},
	{
		path: 'user-public-profile',
		canLoad: [AuthGuard],
		loadChildren: () => import('@app/ui/misc/user-public-profile/user-public-profile.module').then(m => m.UserPublicProfileModule)
	},
	{
		path: 'my-network',
		loadChildren: () => import('@app/ui/my-network/my-network.module').then(m => m.MyNetworkModule)
	},
	{
		path: 'api-clients',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewApiClientsPage]
			}
		},
		loadChildren: () => import('@user-service/ui/api-client/api-client.module').then(m => m.ApiClientModule)
	},
	{
		path: 'user-role-assignment',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewRoleAssignmentPage]
			}
		},
		loadChildren: () => import('@idp-service/ui/user-role-assignment/user-role-assignment.module').then(m => m.UserRoleAssignmentModule)
	},
	{
		path: 'access-tokens',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewAccessTokensPage]
			}
		},
		loadChildren: () => import('@idp-service/ui/access-tokens/access-tokens.module').then(m => m.AccessTokensModule)
	},
	{
		path: 'user-invitation',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewUserInvitationPage]
			}
		},
		loadChildren: () => import('@idp-service/ui/user-invitation/user-invitation.module').then(m => m.UserInvitationModule)
	},
	{
		path: 'user-profile',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewUserProfilePage]
			}
		},
		loadChildren: () => import('@user-service/ui/user-profile/user-profile.module').then(m => m.UserProfileModule)
	},
	{
		path: 'consents',
		canLoad: [AuthGuard],
		loadChildren: () => import('@idp-service/ui/user-consents/user-consents.module').then(m => m.UserConsentsModule)
	},
	{
		path: 'forget-me',
		loadChildren: () => import('@user-service/ui/forget-me/forget-me.module').then(m => m.ForgetMeModule)
	},
	{
		path: 'what-you-know-about-me',
		loadChildren: () => import('@user-service/ui/what-you-know-about-me/what-you-know-about-me.module').then(m => m.WhatYouKnowAboutMeModule)
	},
	{
		path: 'configuration',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewTenantConfigurationPage]
			}
		},
		loadChildren: () => import('@app/ui/misc/tenant-configuration/tenant-configuration.module').then(m => m.TenantConfigurationModule)
	},
	{
		path: 'notifications',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewNotificationPage]
			}
		},
		loadChildren: () => import('@notification-service/ui/notification/notification.module').then(m => m.NotificationModule)
	},
	{
		path: 'inapp-notifications',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewInAppNotificationPage]
			},
			breadcrumb: {
				languageKey: 'APP.NAVIGATION.INAPP-NOTIFICATIONS',
				permissions: [AppPermission.ViewInAppNotificationPage],
			}
		},
		loadChildren: () => import('@notification-service/ui/inapp-notification/inapp-notification.module').then(m => m.InAppNotificationModule)
	},
	{
		path: 'notification-templates',
		canLoad: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewNotificationTemplatePage]
			}
		},
		loadChildren: () => import('@notification-service/ui/notification-template/notification-template.module').then(m => m.NotificationTemplateModule)
	},
	{ path: 'logout', loadChildren: () => import('@idp-service/ui/logout/logout.module').then(m => m.LogoutModule) },
	{ path: 'unauthorized', loadChildren: () => import('@common/unauthorized/unauthorized.module').then(m => m.UnauthorizedModule) },
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' })],
	exports: [RouterModule],
})
export class AppRoutingModule { }
