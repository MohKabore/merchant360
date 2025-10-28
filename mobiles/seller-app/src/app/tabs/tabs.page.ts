// tabs.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true,
  selector:'app-tabs',
  imports:[IonicModule, RouterModule, CommonModule],
  templateUrl:'./tabs.page.html',
  styleUrls:['./tabs.page.scss']
})
export class TabsPage {}