using Cite.EvalIt.Audit;
using Cite.EvalIt.Common;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObjectType;
using Cite.EvalIt.Web.Common;
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
    [Route("api/app/dataobjecttype")]
    public class DataObjectTypeController : ControllerBase
    {
        private readonly CensorFactory _censorFactory;
        private readonly DataObjectTypeQuery _query;
        private readonly IDataObjectTypeService _dataObjectTypeService;
        private readonly BuilderFactory _builderFactory;
        private readonly ILogger<TagController> _logger;
        private readonly IAuditService _auditService;

        public DataObjectTypeController(
            CensorFactory censorFactory,
            DataObjectTypeQuery query,
            IDataObjectTypeService dataObjectTypeService,
            BuilderFactory builderFactory,
            ILogger<TagController> logger,
            IAuditService auditService)
        {
            this._censorFactory = censorFactory;
            this._query = query;
            this._dataObjectTypeService = dataObjectTypeService;
            this._builderFactory = builderFactory;
            this._logger = logger;
            this._auditService = auditService;
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<DataObjectType> Get([FromRoute] Guid id, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("get data object type by id");

            await this._censorFactory.Censor<DataObjectTypeCensor>().Censor(fieldSet);

            List<DataObjectType> model = await this._builderFactory.Builder<DataObjectTypeBuilder>().Build(fieldSet, await this._query
                                                                                                           .Ids(id)
                                                                                                           .IsActive(IsActive.Active)
                                                                                                           .Pagination(new Tools.Data.Query.Paging() { Size = 1, Offset = 0 })
                                                                                                           .Collect()
                                                                                                           );

            //this._auditService.Track(AuditableAction.DataObjectType_Lookup, new Dictionary<String, Object>{
            //  { "id", id },
            //  { "fieldSet", fieldSet }
            //});
            //this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return model?.FirstOrDefault();
        }

        [HttpPost("query")]
        [Authorize]
        public async Task<QueryResult<DataObjectType>> Query([FromBody] DataObjectTypeLookup lookup)
        {
            this._logger.Debug("dataObject query");

            await this._censorFactory.Censor<DataObjectTypeCensor>().Censor(lookup?.Project);

            this._query.SetParameters(lookup);
            List<DataObjectType> models = await this._builderFactory.Builder<EvalIt.Model.DataObjectTypeBuilder>().Build(lookup.Project, await this._query.Collect());

            int count = (lookup.Metadata != null && lookup.Metadata.CountAll) ? await this._query.CountAll() : models.Count;

            //this._auditService.Track(AuditableAction.DataObject_Lookup, "lookup", lookup);
            //this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return new QueryResult<DataObjectType>(models, count);
        }

        [HttpPost("persist")]
        [Authorize]
        [ValidationFilter(typeof(DataObjectTypePersist.DataObjectTypePersistValidator), "model")]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<DataObjectType> Persist([FromBody] DataObjectTypePersist model, [FromQuery] IFieldSet fieldSet)
        {
            this._logger.Debug("persisting data object");

            DataObjectType persisted = await this._dataObjectTypeService.PersistAsync(model, fieldSet);

            this._auditService.Track(AuditableAction.DataObjectType_Persist, new Dictionary<String, Object>{
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
            this._logger.Debug("deleting data object type {id}", id);

            await this._dataObjectTypeService.DeleteAndSaveAsync(id);

            this._auditService.Track(AuditableAction.DataObjectType_Delete, "id", id);
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);
        }

        [HttpPost("{dataObjectTypeId}/persistranking")]
        [Authorize]
        [ValidationFilter(typeof(DataObjectTypeRankingMethodologyPersist.DataObjectTypeRankingMethodologyPersistValidator), "model")]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<DataObjectTypeRankingMethodology> PersistRankingMethodology([FromRoute] Guid dataObjectTypeId, [FromBody] DataObjectTypeRankingMethodologyPersist model, [FromQuery] IFieldSet fieldSet)
        {
            this._logger.Debug("persisting data object ranking methodology");

            DataObjectTypeRankingMethodology persisted = await this._dataObjectTypeService.PersistRankingMethodology(dataObjectTypeId, model, fieldSet);

            this._auditService.Track(AuditableAction.DataObjectTypeRankingMethodology_Persist, new Dictionary<String, Object>{
              {"dataObjectTypeId", dataObjectTypeId },
              { "model", model },
              { "fieldSet", fieldSet }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return persisted;
        }


        [HttpPost("{id}/deleteranking")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<DataObjectTypeRankingMethodology> DeleteRankingMethodology([FromRoute] Guid id, [FromBody] DataObjectTypeRankingMethodologyPersist model, [FromQuery] IFieldSet fieldSet)
        {
            this._logger.Debug("deleting data object ranking methodology");

            DataObjectTypeRankingMethodology type = await this._dataObjectTypeService.DeleteRankingMethodology(id, model.Id.Value);

            this._auditService.Track(AuditableAction.DataObjectTypeRankingMethodology_Delete, "id", id);
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return type;
        }
    }
}
