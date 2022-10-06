using Cite.EvalIt.Audit;
using Cite.EvalIt.Common;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.Tag;
using Cite.EvalIt.Web.Common;
using Cite.EvalIt.Web.Model;
using Cite.EvalIt.Web.Transaction;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Censor;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging.Extensions;
using Cite.WebTools.CurrentPrincipal;
using Cite.WebTools.Validation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Controllers
{
	[Route("api/app/tag")]
	public class TagController : ControllerBase
	{
        private readonly CensorFactory _censorFactory;
        private readonly TagQuery _query;
        private readonly ITagService _tagService;
        private readonly BuilderFactory _builderFactory;
		private readonly ILogger<TagController> _logger;
		private readonly IAuditService _auditService;

        public TagController(
            CensorFactory censorFactory,
            TagQuery query,
            ITagService tagService,
            BuilderFactory builderFactory,
			ILogger<TagController> logger,
			ICurrentPrincipalResolverService currentPrincipalResolverService,
			IAuditService auditService)
		{
            this._censorFactory = censorFactory;
            this._query = query;
            this._tagService = tagService;
            this._builderFactory = builderFactory;
			this._logger = logger;
			this._auditService = auditService;
		}

        [HttpGet("{id}")]
        [Authorize]
        public async Task<Tag> Get([FromRoute] Guid id,[ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("get tag by id");

            await this._censorFactory.Censor<TagCensor>().Censor(fieldSet);

            List<Tag> model = await this._builderFactory.Builder<TagBuilder>().Build(fieldSet, await this._query
                                                                                                         .Ids(id)
                                                                                                         .IsActive(IsActive.Active)
                                                                                                         .Pagination(new Tools.Data.Query.Paging() { Size = 1, Offset = 0 })
                                                                                                         .Collect()
                                                                                                         );
            //this._auditService.Track(AuditableAction.Tag_Lookup, new Dictionary<String, Object>{
            //  { "id", id },
            //  { "fieldSet", fieldSet }
            //}); this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return model?.FirstOrDefault();
        }

        [HttpPost("query")]
        [Authorize]
        public async Task<QueryResult<Tag>> Query([FromBody] TagLookup lookup)
        {
            this._logger.Debug("tag query");

            await this._censorFactory.Censor<TagCensor>().Censor(lookup?.Project);

            this._query.SetParameters(lookup);
            List<Tag> models = await this._builderFactory.Builder<EvalIt.Model.TagBuilder>().Build(lookup.Project, await this._query.Collect());

            int count = (lookup.Metadata != null && lookup.Metadata.CountAll) ? await this._query.CountAll() : models.Count;

            //this._auditService.Track(AuditableAction.Tag_Lookup, "lookup", lookup);
            //this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return new QueryResult<Tag>(models, count);
        }

        [HttpPost("persist")]
        [Authorize]
        [ValidationFilter(typeof(TagPersist.TagPersistValidator), "model")]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<Tag> Persist([FromBody]TagPersist model,[FromQuery] IFieldSet fieldSet)
        {
            this._logger.Debug("persisting tag");

            Tag persisted = await this._tagService.PersistAsync(model, fieldSet);

            this._auditService.Track(AuditableAction.Tag_Persist, new Dictionary<String, Object>{
              { "model", model },
              { "fieldSet", fieldSet }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return persisted;
        }

        [HttpDelete("{id}")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task Delete([FromRoute] Guid id)
        {
            this._logger.Debug("deleting tag {id}", id);

            await this._tagService.DeleteAndSaveAsync(id);

            this._auditService.Track(AuditableAction.Tag_Delete, "id", id);
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);
        }
    }
}
