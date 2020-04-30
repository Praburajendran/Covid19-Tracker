import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CovidDetailsComponent } from './covid-details.component';

describe('CovidDetailsComponent', () => {
  let component: CovidDetailsComponent;
  let fixture: ComponentFixture<CovidDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CovidDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CovidDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
