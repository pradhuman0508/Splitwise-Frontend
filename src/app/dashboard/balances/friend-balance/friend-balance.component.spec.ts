import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendBalanceComponent } from './friend-balance.component';

describe('FriendBalanceComponent', () => {
  let component: FriendBalanceComponent;
  let fixture: ComponentFixture<FriendBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
