import { Pipe, PipeTransform } from '@angular/core';
import { UserClaim } from '@idp-service/core/model/user-claim.model';

@Pipe({ name: 'ClaimSerialize' })
export class ClaimSerializePipe implements PipeTransform {
	constructor() { }

	public transform(value : UserClaim[], claimName: string = null ): string {
        if (value?.length > 0) return value?.filter(p => claimName == null ? true : p.claim == claimName).map(p => p.value).join(", ");
        return "";
	}
}
