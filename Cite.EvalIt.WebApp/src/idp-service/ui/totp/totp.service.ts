import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseService } from '@common/base/base.service';
import { TotpDialogComponent } from '@idp-service/ui/totp/dialog/totp-dialog.component';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class TotpService extends BaseService {

	constructor(
		private authService: AuthService,
		private dialog: MatDialog
	) { super(); }

	public askForTotpIfAvailable(actionToPerform: (totp?: string) => void) {
		if (this.authService.hasTotp()) {
			let dialogRef;
			dialogRef = this.dialog.open(TotpDialogComponent);
			dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
				if (!result) { return; }
				actionToPerform(result);
			});
		} else {
			actionToPerform();
		}
	}
}
