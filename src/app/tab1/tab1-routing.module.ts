import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { Tab1Page } from './tab1.page';

const routes: Routes = [
  { path: '', component: Tab1Page, pathMatch: 'full' },
  { path: ':id', component: DetailComponent},
  { path: ':id/edit', component: EditComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1PageRoutingModule {}
