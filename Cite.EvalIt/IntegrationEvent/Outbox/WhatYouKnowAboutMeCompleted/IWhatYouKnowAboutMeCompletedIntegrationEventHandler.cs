﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public interface IWhatYouKnowAboutMeCompletedIntegrationEventHandler
	{
		Task HandleAsync(WhatYouKnowAboutMeCompletedIntegrationEvent @event);
	}
}
