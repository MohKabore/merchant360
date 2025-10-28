import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterSheetPage } from './filter-sheet.page';

describe('FilterSheetPage', () => {
  let component: FilterSheetPage;
  let fixture: ComponentFixture<FilterSheetPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterSheetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
