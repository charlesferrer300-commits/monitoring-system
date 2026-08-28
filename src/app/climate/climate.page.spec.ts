import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClimatePage } from './climate.page';

describe('ClimatePage', () => {
  let component: ClimatePage;
  let fixture: ComponentFixture<ClimatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClimatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
