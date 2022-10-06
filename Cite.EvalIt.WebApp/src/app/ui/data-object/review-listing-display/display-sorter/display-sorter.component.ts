import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ColumnSortEvent, SortDirection } from '@common/modules/listing/listing.component';

@Component({
  selector: 'app-display-sorter',
  templateUrl: './display-sorter.component.html',
  styleUrls: ['./display-sorter.component.scss']
})
export class DisplaySorterComponent implements OnInit {

	currentSortColumn: string = null;
	sortDirection: SortDirection = SortDirection.Ascending;

  @Input() sort : [string, string][]
  @Output() changeSort : EventEmitter<ColumnSortEvent> = new EventEmitter<ColumnSortEvent>();

  constructor() { }

  ngOnInit(): void {
  }
  
  toggleDirection(dir: SortDirection)
  {
    return dir == SortDirection.Ascending ? SortDirection.Descending : SortDirection.Ascending;
  }

	onSortChange(event: MatButtonToggleChange)
	{
		if( !this.currentSortColumn) {
				this.currentSortColumn = event.value;
				this.sortDirection = SortDirection.Ascending;
		}
		else {
      event.source.buttonToggleGroup.value = [event.value];
      if( event.value == this.currentSortColumn) {
				this.sortDirection = this.toggleDirection(this.sortDirection);
      }
      else {
        this.currentSortColumn = event.value;
        this.sortDirection = SortDirection.Ascending;
      }
		}

    var resEvent: ColumnSortEvent = {
      column: null,
      previousValue: event.value == this.currentSortColumn ? this.toggleDirection(this.sortDirection) : null,
      newValue: this.sortDirection,
      sortDescriptors: [{direction: this.sortDirection, property: this.currentSortColumn }]
    }

    this.changeSort.emit(resEvent);
  }
}
