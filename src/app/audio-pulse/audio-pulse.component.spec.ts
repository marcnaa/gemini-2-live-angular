import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioPulseComponent } from './audio-pulse.component';

describe('AudioPulseComponent', () => {
  let component: AudioPulseComponent;
  let fixture: ComponentFixture<AudioPulseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioPulseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioPulseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
