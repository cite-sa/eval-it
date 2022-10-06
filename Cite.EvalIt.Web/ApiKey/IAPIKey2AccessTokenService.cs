using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.APIKey
{
	public interface IAPIKey2AccessTokenService
	{
		Task<String> AccessTokenFor(String apiKey);
		Task FlushCache(String apiKey);
	}
}
