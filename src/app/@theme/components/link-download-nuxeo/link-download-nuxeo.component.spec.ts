import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkDownloadNuxeoComponent } from './link-download-nuxeo.component';

describe('LinkDownloadComponent', () => {
  let component: LinkDownloadNuxeoComponent;
  let fixture: ComponentFixture<LinkDownloadNuxeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkDownloadNuxeoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkDownloadNuxeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
