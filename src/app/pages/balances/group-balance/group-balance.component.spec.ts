import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupBalanceComponent } from './group-balance.component';

describe('GroupBalanceComponent', () => {
  let component: GroupBalanceComponent;
  let fixture: ComponentFixture<GroupBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
