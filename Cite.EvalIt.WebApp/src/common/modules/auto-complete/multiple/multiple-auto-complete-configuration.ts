import { TemplateRef } from '@angular/core';
import { AutoCompleteGroup } from '@common/modules/auto-complete/auto-complete-group';
import { Observable } from 'rxjs';

export interface MultipleAutoCompleteConfiguration {
	// Delay for performing the request. Default: 200ms.
	requestDelay?: number;
	// Min characters for the filtering to be applied. Default: 3.
	minFilteringChars?: number;
	// Load and present items from start, without user query. Default: true.
	loadDataOnStart?: boolean;
	// Static or initial items.
	initialItems?: (excludedItems: any[]) => Observable<any[]>;
	// Data retrieval function
	filterFn?: (searchQuery: string, excludedItems: any[]) => Observable<any[]>;
	// Property formating for input
	displayFn?: (item: any) => string;
	// Function to group results in the drop down
	groupingFn?: (items: any[]) => AutoCompleteGroup[];
	// Display function for the drop down title
	titleFn?: (item: any) => string;
	// Display function for the drop down subtitle
	subtitleFn?: (item: any) => string;
	// Property formating template
	optionTemplate?: TemplateRef<any>;
	// Selected value formating template
	selectedValueTemplate?: TemplateRef<any>;
}
