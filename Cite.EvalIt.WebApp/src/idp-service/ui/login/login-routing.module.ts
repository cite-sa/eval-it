import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SamlResponseLoginComponent } from '@idp-service/ui/auth-providers/saml/saml-login-response/saml-login-response.component';
import { CASResponseLoginComponent } from '@idp-service/ui/auth-providers/cas/cas-login-response/cas-login-response.component';
import { LoginComponent } from '@idp-service/ui/login/login.component';
import { DirectLinkLoginComponent } from '@idp-service/ui/login/direct-link/direct-link-login.component';
import { TaxisnetLoginResponseComponent } from '@idp-service/ui/auth-providers/taxisnet/taxisnet-login-response/taxisnet-login-response.component';
import { OpenIDConnectCodeResponseLoginComponent } from '@idp-service/ui/auth-providers/openid-connect-code/openid-connect-code-login-response/openid-connect-code-login-response.component';

const routes: Routes = [
	{
		path: '',
		component: LoginComponent
	},
	{
		path: 'direct-link/:tenantCode/:key',
		component: DirectLinkLoginComponent
	},
	{
		path: 'direct-link/:tenantId',
		component: DirectLinkLoginComponent
	},
	{
		path: 'external/saml',
		component: SamlResponseLoginComponent
	},
	{
		path: 'external/oidc/code',
		component: OpenIDConnectCodeResponseLoginComponent
	},
	{
		path: 'external/cas',
		component: CASResponseLoginComponent
	},
	{ path: 'taxis-net-login', component: TaxisnetLoginResponseComponent },
	{
		path: ':tenantCode',
		component: LoginComponent
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LoginRoutingModule { }
