using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.Tools.Json.Inflater;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Cite.EvalIt.Model
{
    public class ReviewEvaluationData
    {
        public List<ReviewEvaluation> Evaluations { get; set; }
    }

    public class ReviewEvaluation
    {
        public Guid OptionId { get; set; }
        public ReviewEvaluationType EvaluationType { get; set; }
    }

    public class AbsoluteIntegerEvaluation : ReviewEvaluation
    {
        public List<int> Values { get; set; }
    }

    public class AbsoluteDecimalEvaluation : ReviewEvaluation
    {
        public List<float> Values { get; set; }
    }

    public class PercentageEvaluation : ReviewEvaluation
    {
        public List<float> Values { get; set; }
    }

    public class TextEvaluation : ReviewEvaluation
    {
        public List<string> Values { get; set; }
    }

    public class ScaleEvaluation : ReviewEvaluation
    {
        public List<int> Values { get; set; }
    }

    public class SelectionEvaluation : ReviewEvaluation
    {
        public List<string> Values { get; set; }
    }


    public class ReviewEvaluationDataPersist
    {
        public List<IReviewEvaluationPersist> Evaluations { get; set; }
    }

    [JsonConverter(typeof(SubTypeConverter))]
    [SubTypeConverterAnchor(nameof(IReviewEvaluationPersist.EvaluationType), typeof(ReviewEvaluationType))]
    [SubTypeConverterMap(ReviewEvaluationType.AbsoluteDecimalEvaluation, typeof(AbsoluteDecimalEvaluationPersist))]
    [SubTypeConverterMap(ReviewEvaluationType.AbsoluteIntegerEvaluation, typeof(AbsoluteIntegerEvaluationPersist))]
    [SubTypeConverterMap(ReviewEvaluationType.PercentageEvaluation, typeof(PercentageEvaluationPersist))]
    [SubTypeConverterMap(ReviewEvaluationType.TextEvaluation, typeof(TextEvaluationPersist))]
    [SubTypeConverterMap(ReviewEvaluationType.ScaleEvaluation, typeof(ScaleEvaluationPersist))]
    [SubTypeConverterMap(ReviewEvaluationType.SelectionEvaluation, typeof(SelectionEvaluationPersist))]
    public interface IReviewEvaluationPersist
    {
        public Guid OptionId { get; set; }
        public ReviewEvaluationType EvaluationType { get; set; }
    }

    public class ReviewEvaluationPersist : IReviewEvaluationPersist
    {
        public Guid OptionId { get; set; }
        public ReviewEvaluationType EvaluationType { get; set; }

        public class ReviewEvaluationPersistValidator : BaseValidator<ReviewEvaluationPersist>
        {
            public ReviewEvaluationPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<ReviewEvaluationPersist> logger,
                ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
            {
                this._localizer = localizer;
            }

            protected readonly IStringLocalizer<Resources.MySharedResources> _localizer;

            protected override IEnumerable<ISpecification> Specifications(ReviewEvaluationPersist item)
            {
                return new ISpecification[] {
                    //optionid must be valid guid
                    this.Spec()
                        .Must(() => this.IsValidGuid(item.OptionId))
                        .FailOn(nameof(ReviewEvaluationPersist.OptionId)).FailWith(this._localizer["Validation_Required", nameof(ReviewEvaluationPersist.OptionId)]),
					//EvaluationConfigurationType enum must be vaild
					this.Spec()
                        .Must(() => Enum.IsDefined(typeof(ReviewEvaluationType),item.EvaluationType) )
                        .FailOn(nameof(ReviewEvaluationPersist.EvaluationType)).FailWith(this._localizer["Validation_Required", nameof(ReviewEvaluationPersist.EvaluationType)]),
                };
            }
        }
    }

    public class AbsoluteIntegerEvaluationPersist : ReviewEvaluationPersist
    {
        public List<int> Values { get; set; }
    }

    public class AbsoluteDecimalEvaluationPersist : ReviewEvaluationPersist
    {
        public List<float> Values { get; set; }
    }

    public class PercentageEvaluationPersist : ReviewEvaluationPersist
    {
        public List<float> Values { get; set; }
    }

    public class TextEvaluationPersist : ReviewEvaluationPersist
    {
        public List<string> Values { get; set; }
    }

    public class ScaleEvaluationPersist : ReviewEvaluationPersist
    {
        public List<int> Values { get; set; }
    }

    public class SelectionEvaluationPersist : ReviewEvaluationPersist
    {
        public List<string> Values { get; set; }
    }
}
