import { Component, signal } from '@angular/core';
import { Lcg } from './lcg/lcg';

@Component({
  selector: 'app-root',
  imports: [Lcg],
  template: `<app-lcg></app-lcg>`,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('random-generator');
}
