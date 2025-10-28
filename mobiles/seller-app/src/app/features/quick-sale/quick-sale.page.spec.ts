import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuickSalePage } from './quick-sale.page';

describe('QuickSalePage', () => {
  let component: QuickSalePage;
  let fixture: ComponentFixture<QuickSalePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickSalePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
