import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {ClipboardModule} from '@angular/cdk/clipboard';

import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    ClipboardModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatButtonModule,
    MatListModule
  ]
})
export class MaterialModule { }
