import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { ClaimSerializePipe } from '@app/core/formatting/pipes/claim-serialize.pipe';
import { IsActiveTypePipe } from '@app/core/formatting/pipes/is-active-type.pipe';
import { ListCountPipe } from '@app/core/formatting/pipes/list-count.pipe';
import { RankRecalculationTaskStatusPipe } from '@app/core/formatting/pipes/rank-recalculation-task-status.pipe';
import { RankScorePipe } from '@app/core/formatting/pipes/rank-score.pipe';
import { TagAppliesToTypePipe } from '@app/core/formatting/pipes/tag-applies-to-type.pipe';
import { TagListSerializePipe } from '@app/core/formatting/pipes/tag-list-serialize.pipe';
import { TagTypePipe } from '@app/core/formatting/pipes/tag-type.pipe';
import { UserNetworkRelationshipPipe } from '@app/core/formatting/pipes/user-network-relationship.pipe';
import { CommonFormattingModule } from '@common/formatting/common-formatting.module';
import { PipeService } from '@common/formatting/pipe.service';

//
//
// This is shared module that provides all formatting utils. Its imported only once on the AppModule.
//
//
@NgModule({
	imports: [
		CommonFormattingModule
	],
	declarations: [
		IsActiveTypePipe,
		RankScorePipe,
		ClaimSerializePipe
	],
	exports: [
		CommonFormattingModule,
		IsActiveTypePipe,
		RankScorePipe,
		ClaimSerializePipe
	],
	providers: [
		AppEnumUtils,
		PipeService,
		DatePipe,
		IsActiveTypePipe,
		TagAppliesToTypePipe,
		TagTypePipe,
		TagListSerializePipe,
		ListCountPipe,
		UserNetworkRelationshipPipe,
		RankRecalculationTaskStatusPipe,
		RankScorePipe,
		ClaimSerializePipe
	]
})
export class FormattingModule { }
