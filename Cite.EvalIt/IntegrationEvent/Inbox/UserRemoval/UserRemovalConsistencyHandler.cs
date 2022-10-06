using Cite.EvalIt.Data.Context;
using Cite.EvalIt.Query;
using Cite.Tools.Data.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.IntegrationEvent.Inbox
{
	public class UserRemovalConsistencyHandler : IConsistencyHandler<UserRemovalConsistencyPredicates>
	{
		//private readonly QueryFactory _queryFactory;
		private readonly UserQuery _userQuery;

		public UserRemovalConsistencyHandler(UserQuery userQuery)
		{
			//this._queryFactory = queryFactory;
			_userQuery = userQuery;
		}

		public async Task<Boolean> IsConsistent(UserRemovalConsistencyPredicates consistencyPredicates)
		{
			int count = (await this._userQuery.Ids(consistencyPredicates.UserId).Collect()).Count();
			//int count = await this._queryFactory.Query<UserQuery>().Ids(consistencyPredicates.UserId).CountAsync();
			if (count == 0) return false;
			return true;
		}
	}
}
