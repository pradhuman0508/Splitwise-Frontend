import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupExpensesComponent } from './group-expenses.component';

describe('GroupExpensesComponent', () => {
  let component: GroupExpensesComponent;
  let fixture: ComponentFixture<GroupExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
