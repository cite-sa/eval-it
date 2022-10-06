using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
    public class NotificationsConfig
    {
        public class UserFollowTemplateKeys
        {
            public string Name { get; set; }
            public string TargetUserName { get; set; }
            public string TargetUserId { get; set; }
        }

        public class UserTrustTemplateKeys
        {
            public string Name { get; set; }
            public string TargetUserName { get; set; }
            public string TargetUserId { get; set; }
        }

        public class UserUnfollowTemplateKeys
        {
            public string Name { get; set; }
            public string TargetUserName { get; set; }
            public string TargetUserId { get; set; }
        }

        public class UserUntrustTemplateKeys
        {
            public string Name { get; set; }
            public string TargetUserName { get; set; }
            public string TargetUserId { get; set; }
        }

        public class UserReviewSignedTemplateKeys
        {
            public string Name { get; set; }
            public string TargetUserName { get; set; }
            public string TargetUserId { get; set; }
            public string TargetReviewId { get; set; }
            public string TargetObjectId { get; set; }
            public string TargetObjectName { get; set; }
        }

        public class UserReviewUnsignedTemplateKeys
        {
            public string Name { get; set; }
            public string TargetReviewId { get; set; }
            public string TargetObjectId { get; set; }
            public string TargetObjectName { get; set; }
        }

        public class UserLikeSignedTemplateKeys
        {
            public string Name { get; set; }
            public string TargetUserName { get; set; }
            public string TargetUserId { get; set; }
            public string TargetReviewId { get; set; }
            public string TargetObjectId { get; set; }
            public string TargetObjectName { get; set; }
        }

        public class UserLikeUnsignedTemplateKeys
        {
            public string Name { get; set; }
            public string TargetReviewId { get; set; }
            public string TargetObjectId { get; set; }
            public string TargetObjectName { get; set; }
        }

        public class NotificationTemplate<TemplateKeys>
        {
            public Guid? NotificationKey { get; set; }
            public TemplateKeys Template { get; set; }
        }

        public NotificationTemplate<UserFollowTemplateKeys> UserFollow { get; set; }

        public NotificationTemplate<UserTrustTemplateKeys> UserTrust { get; set; }

        public NotificationTemplate<UserUnfollowTemplateKeys> UserUnfollow { get; set; }

        public NotificationTemplate<UserUntrustTemplateKeys> UserUntrust { get; set; }

        public NotificationTemplate<UserReviewSignedTemplateKeys> UserReviewSigned { get; set; }

        public NotificationTemplate<UserReviewUnsignedTemplateKeys> UserReviewUnsigned { get; set; }

        public NotificationTemplate<UserLikeSignedTemplateKeys> UserLikeSigned { get; set; }

        public NotificationTemplate<UserLikeUnsignedTemplateKeys> UserLikeUnsigned { get; set; }

    }
}