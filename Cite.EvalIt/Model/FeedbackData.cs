using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace Cite.EvalIt.Model
{
	public class FeedbackData
	{
        public bool Like { get; set; }
	}

	public class FeedbackDataPersist
	{
		public bool Like { get; set; }
        public class FeedbackDataPersistValidator : BaseValidator<FeedbackDataPersist>
        {
            public FeedbackDataPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<FeedbackDataPersist> logger,
                ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
            {
                this._localizer = localizer;
            }

            private readonly IStringLocalizer<Resources.MySharedResources> _localizer;

            protected override IEnumerable<ISpecification> Specifications(FeedbackDataPersist item)
            {
                return new ISpecification[] { };
            }
        }
    }



}
