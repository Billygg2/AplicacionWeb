import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lcg } from './lcg';

describe('Lcg', () => {
  let component: Lcg;
  let fixture: ComponentFixture<Lcg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lcg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lcg);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
