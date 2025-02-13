import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlTrayComponent } from './control-tray.component';

describe('ControlTrayComponent', () => {
  let component: ControlTrayComponent;
  let fixture: ComponentFixture<ControlTrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlTrayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
