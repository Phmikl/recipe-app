/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from 'src/models/Recipe';
import { ImagesService, LocalFile } from '../services/images.service';
import { RecipesService } from '../services/recipes.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  recipes: Recipe[] = [];
  images: LocalFile[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private imageService: ImagesService, private recipeService: RecipesService) {}

  ngOnInit(): void {
    this.recipeService.loadRecipes();
    this.recipes = this.recipeService.getRecipes();
    this.imageService.loadAllFiles();
    this.images = this.imageService.images;
  }

  ionViewWillEnter(){
    this.recipeService.loadRecipes();
    this.recipes = this.recipeService.getRecipes();
    this.imageService.loadAllFiles();
    this.images = this.imageService.images;
  }


  doRefresh(event: any) {
    this.recipeService.loadRecipes();
    this.recipes = this.recipeService.getRecipes();
    this.imageService.loadAllFiles();
    this.images = this.imageService.images;
    setTimeout(()=> {
      event.target.complete();
    }, 300);
  }

  navigateTo(id: number){
    this.router.navigate(['/tabs/tab1/'+id]);
  }
}
