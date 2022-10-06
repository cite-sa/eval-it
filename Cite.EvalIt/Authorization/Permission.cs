using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Authorization
{
	public static class Permission
	{
		//User
		public const String BrowseUser = "BrowseUser";
		public const String EditUser = "EditUser";
        public const String DeleteUser = "DeleteUser";
		// Profile
		public const String BrowseUserProfile = "BrowseUserProfile";
		//Tag
		public const String BrowseTag = "BrowseTag";
		public const String EditTag = "EditTag";
		public const String DeleteTag = "DeleteTag";
		//Data Object
		public const String BrowseDataObject = "BrowseDataObject";
		public const String EditDataObject = "EditDataObject";
		public const String DeleteDataObject = "DeleteDataObject";
		//Data Object Type
		public const String BrowseDataObjectType = "BrowseDataObjectType";
		public const String EditDataObjectType = "EditDataObjectType";
		public const String DeleteDataObjectType = "DeleteDataObjectType";
		//Data Object Review
		public const String BrowseDataObjectReview = "BrowseDataObjectReview";
		public const String EditDataObjectReview = "EditDataObjectReview";
		public const String DeleteDataObjectReview = "DeleteDataObjectReview";
		//Data Object Review Feedback
		public const String BrowseDataObjectReviewFeedback = "BrowseDataObjectReviewFeedback";
		public const String EditDataObjectReviewFeedback = "EditDataObjectReviewFeedback";
		public const String DeleteDataObjectReviewFeedback = "DeleteDataObjectReviewFeedback";
		//Rank Recalculation Task
		public const String BrowseRankRecalculationTask = "BrowseRankRecalculationTask";
		public const String EditRankRecalculationTask = "EditRankRecalculationTask";
		public const String DeleteRankRecalculationTask = "DeleteRankRecalculationTask";
		// UI Pages
		public const String ViewUsersPage = "ViewUsersPage";
		public const String ViewTagsPage = "ViewTagsPage";
		public const String ViewDataObjectTypesPage = "ViewDataObjectTypesPage";
		public const String ViewDataObjectsPage = "ViewDataObjectsPage";
		public const String ViewRankRecalculationTaskPage = "ViewRankRecalculationTaskPage";
		public const String ViewApiClientsPage = "ViewApiClientsPage";
		public const String ViewRoleAssignmentPage = "ViewRoleAssignmentPage";
		public const String ViewAccessTokensPage = "ViewAccessTokensPage";
		public const String ViewUserInvitationPage = "ViewUserInvitationPage";
		public const String ViewUserProfilePage = "ViewUserProfilePage";
		public const String ViewForgetMeRequestPage = "ViewForgetMeRequestPage";
		public const String ViewWhatYouKnowAboutMeRequestPage = "ViewWhatYouKnowAboutMeRequestPage";
		public const String ViewNotificationPage = "ViewNotificationPage";
		public const String ViewNotificationEventRulePage = "ViewNotificationEventRulePage";
		public const String ViewInAppNotificationPage = "ViewInAppNotificationPage";
		public const String ViewNotificationTemplatePage = "ViewNotificationTemplatePage";
	}
}
