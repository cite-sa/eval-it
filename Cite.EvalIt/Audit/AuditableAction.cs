using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Audit
{
	public static class AuditableAction
	{
		//TODO: update here with Auditable actions

		public static readonly EventId IdentityTracking_Action = new EventId(1000, nameof(IdentityTracking_Action));
		//public static readonly EventId IdentityTracking_User_Persist = new EventId(1001, nameof(IdentityTracking_User_Persist));
		//public static readonly EventId IdentityTracking_User_Name = new EventId(1002, nameof(IdentityTracking_User_Name));

		//public static readonly EventId Principal_Lookup = new EventId(6000, nameof(Principal_Lookup));
		//public static readonly EventId ForgetMe_Persist = new EventId(7000, nameof(ForgetMe_Persist));
		//public static readonly EventId ForgetMe_Query = new EventId(7001, nameof(ForgetMe_Query));
		//public static readonly EventId ForgetMe_Query_Mine = new EventId(7002, nameof(ForgetMe_Query_Mine));
		//public static readonly EventId ForgetMe_Delete = new EventId(7003, nameof(ForgetMe_Delete));

		//public static readonly EventId WhatYouKnowAboutMe_Persist = new EventId(8000, nameof(WhatYouKnowAboutMe_Persist));
		//public static readonly EventId WhatYouKnowAboutMe_Query = new EventId(8001, nameof(WhatYouKnowAboutMe_Query));
		//public static readonly EventId WhatYouKnowAboutMe_Query_Mine = new EventId(8002, nameof(WhatYouKnowAboutMe_Query_Mine));
		//public static readonly EventId WhatYouKnowAboutMe_Delete = new EventId(8003, nameof(WhatYouKnowAboutMe_Delete));
		//public static readonly EventId WhatYouKnowAboutMe_Download = new EventId(8004, nameof(WhatYouKnowAboutMe_Download));

		//public static readonly EventId Service_Query = new EventId(11001, nameof(Service_Query));
		//public static readonly EventId Service_Lookup = new EventId(11002, nameof(Service_Lookup));
		//public static readonly EventId Service_Persist = new EventId(11003, nameof(Service_Persist));
		//public static readonly EventId Service_Delete = new EventId(11004, nameof(Service_Delete));
		//public static readonly EventId Service_Elastic_Sync = new EventId(11005, nameof(Service_Elastic_Sync));
		//public static readonly EventId Service_CreateDummyData = new EventId(11006, nameof(Service_CreateDummyData));
		//public static readonly EventId Service_CleanUp = new EventId(11007, nameof(Service_CleanUp));

		//public static readonly EventId Metric_Query = new EventId(12001, nameof(Metric_Query));
		//public static readonly EventId Metric_Lookup = new EventId(12002, nameof(Metric_Lookup));
		//public static readonly EventId Metric_Persist = new EventId(12003, nameof(Metric_Persist));
		//public static readonly EventId Metric_Delete = new EventId(12004, nameof(Metric_Delete));

		//public static readonly EventId ServiceResource_Query = new EventId(13001, nameof(ServiceResource_Query));
		//public static readonly EventId ServiceResource_Lookup = new EventId(13002, nameof(ServiceResource_Lookup));
		//public static readonly EventId ServiceResource_Persist = new EventId(13003, nameof(ServiceResource_Persist));
		//public static readonly EventId ServiceResource_Delete = new EventId(13004, nameof(ServiceResource_Delete));

		//public static readonly EventId UserRole_Query = new EventId(14001, nameof(UserRole_Query));
		//public static readonly EventId UserRole_Lookup = new EventId(14002, nameof(UserRole_Lookup));
		//public static readonly EventId UserRole_Persist = new EventId(14003, nameof(UserRole_Persist));
		//public static readonly EventId UserRole_Delete = new EventId(14004, nameof(UserRole_Delete));

		public static readonly EventId User_Persist = new EventId(15001, nameof(User_Persist));
		public static readonly EventId User_Delete = new EventId(15002, nameof(User_Delete));
		public static readonly EventId User_TagsSet = new EventId(15003, nameof(User_TagsSet));
		public static readonly EventId User_NetworkAdd = new EventId(15005, nameof(User_NetworkAdd));
		public static readonly EventId User_NetworkRemove = new EventId(15006, nameof(User_NetworkRemove));
		public static readonly EventId User_MyNetworkAdd = new EventId(15007, nameof(User_NetworkRemove));
		public static readonly EventId User_MyNetworkRemove = new EventId(15008, nameof(User_MyNetworkRemove));

		//public static readonly EventId User_Profile_Language = new EventId(15005, nameof(User_Profile_Language));
		//public static readonly EventId User_Profile_Lookup = new EventId(15006, nameof(User_Profile_Lookup));
		//public static readonly EventId User_Profile_Persist = new EventId(15007, nameof(User_Profile_Persist));
		//public static readonly EventId User_Name = new EventId(15008, nameof(User_Name));

		//public static readonly EventId AccountingEntry_Query = new EventId(16001, nameof(AccountingEntry_Query));
		//public static readonly EventId AccountingEntry_Calculate = new EventId(16002, nameof(AccountingEntry_Calculate));

		//public static readonly EventId ServiceAction_Query = new EventId(17001, nameof(ServiceAction_Query));
		//public static readonly EventId ServiceAction_Lookup = new EventId(17002, nameof(ServiceAction_Lookup));
		//public static readonly EventId ServiceAction_Persist = new EventId(17003, nameof(ServiceAction_Persist));
		//public static readonly EventId ServiceAction_Delete = new EventId(17004, nameof(ServiceAction_Delete));

		//public static readonly EventId User_Settings_Query = new EventId(18001, nameof(User_Settings_Query));
		//public static readonly EventId User_Settings_Lookup = new EventId(18002, nameof(User_Settings_Lookup));
		//public static readonly EventId User_Settings_Persist = new EventId(18003, nameof(User_Settings_Persist));
		//public static readonly EventId User_Settings_Delete = new EventId(18004, nameof(User_Settings_Delete));

		//public static readonly EventId ServiceSync_Query = new EventId(19001, nameof(ServiceSync_Query));
		//public static readonly EventId ServiceSync_Lookup = new EventId(19002, nameof(ServiceSync_Lookup));
		//public static readonly EventId ServiceSync_Persist = new EventId(19003, nameof(ServiceSync_Persist));
		//public static readonly EventId ServiceSync_Delete = new EventId(19004, nameof(ServiceSync_Delete));

		//public static readonly EventId UserInfo_Query = new EventId(20001, nameof(UserInfo_Query));
		//public static readonly EventId UserInfo_Lookup = new EventId(21002, nameof(UserInfo_Lookup));
		//public static readonly EventId UserInfo_Persist = new EventId(22003, nameof(UserInfo_Persist));
		//public static readonly EventId UserInfo_Delete = new EventId(23004, nameof(UserInfo_Delete));

		//public static readonly EventId ServiceResetEntrySync_Query = new EventId(21001, nameof(ServiceResetEntrySync_Query));
		//public static readonly EventId ServiceResetEntrySync_Lookup = new EventId(21002, nameof(ServiceResetEntrySync_Lookup));
		//public static readonly EventId ServiceResetEntrySync_Persist = new EventId(21003, nameof(ServiceResetEntrySync_Persist));
		//public static readonly EventId ServiceResetEntrySync_Delete = new EventId(21004, nameof(ServiceResetEntrySync_Delete));

		public static readonly EventId Tag_Persist = new EventId(22001, nameof(Tag_Persist));
		public static readonly EventId Tag_Delete = new EventId(22002, nameof(Tag_Delete));

		public static readonly EventId DataObject_Persist = new EventId(23001, nameof(DataObject_Persist));
		public static readonly EventId DataObject_Delete = new EventId(23002, nameof(DataObject_Delete));
		public static readonly EventId DataObject_TagsSet = new EventId(23003, nameof(DataObject_TagsSet));

		public static readonly EventId DataObjectReview_Persist = new EventId(23005, nameof(DataObjectReview_Persist));
		public static readonly EventId DataObjectReview_Delete = new EventId(23006, nameof(DataObjectReview_Delete));

		public static readonly EventId DataObjectReviewFeedback_Persist = new EventId(23007, nameof(DataObjectReviewFeedback_Persist));
		public static readonly EventId DataObjectReviewFeedback_Delete = new EventId(23008, nameof(DataObjectReviewFeedback_Delete));

		public static readonly EventId DataObjectType_Persist = new EventId(24001, nameof(DataObjectType_Persist));
		public static readonly EventId DataObjectType_Delete = new EventId(24002, nameof(DataObjectType_Delete));
		public static readonly EventId DataObjectTypeRankingMethodology_Persist = new EventId(24003, nameof(DataObjectTypeRankingMethodology_Persist));
		public static readonly EventId DataObjectTypeRankingMethodology_Delete = new EventId(24004, nameof(DataObjectTypeRankingMethodology_Delete));

		public static readonly EventId RankRecalculationTask_Start = new EventId(25001, nameof(RankRecalculationTask_Start));
		public static readonly EventId RankRecalculationTask_Cancel = new EventId(25002, nameof(RankRecalculationTask_Cancel));

	}
}
