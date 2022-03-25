/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Directory, Filesystem, FileWriteResult, WriteFileResult } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';
import { LoadingController, ToastController } from '@ionic/angular';
import { Ingredient } from 'src/models/Ingredient';
import { Recipe } from 'src/models/Recipe';
import { ImagesService, LocalFile } from '../services/images.service';
import { RecipesService } from '../services/recipes.service';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  images: LocalFile[] = [];
  latestImg: LocalFile;
  photoTaken = false;
  recipes: Recipe[]= [];

  recipeForm: FormGroup;
  constructor(private loadinCtrl: LoadingController, private toastController: ToastController, private recipeService: RecipesService, private imageService: ImagesService) {}

  get controls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  ngOnInit(): void {
    this.initForm();
    this.recipeService.loadRecipes();
    this.recipes = this.recipeService.getRecipes();
    this.photoTaken = false;
    this.imageService.newLatestImg.subscribe((img) => {
      this.latestImg = img;
    });
  }

  //Recipe Form
  initForm(){
    this.recipeForm = new FormGroup({
      title: new FormControl('', Validators.required),
      ingredients: new FormArray([]),
      description: new FormControl('', Validators.required)
    });
  }

  addIngredient(){
    (this.recipeForm.get('ingredients') as FormArray).push(
      new FormGroup({
        name: new FormControl(null, Validators.required),
        amount: new FormControl(null, [Validators.required, Validators.min(1)])
      })
    );
  }

  deleteIngredient(index: number){
    (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
  }

  onSubmit(){
    const ingredients: Ingredient[] = [];
    for(const item of this.recipeForm.value.ingredients){
      ingredients.push(new Ingredient(item.name, item.amount));
    }
    this.recipeService.addRecipe(new Recipe(this.recipeForm.value.title, ingredients, this.recipeForm.value.description));
    this.recipes = this.recipeService.getRecipes();

    this.presentToast();
    //reset

    this.initForm();
    this.photoTaken = false;

  }


  async takeImage(){
    //await this.imageService.refresh();
    await this.imageService.takeImage();
    this.photoTaken = true;
  }

  //Reset the Complete App
  async reset(){
    localStorage.clear();
    Storage.clear();
    await this.imageService.loadAllFiles();
    this.images = this.imageService.images;
    for(const item of this.images){
      await Filesystem.deleteFile({
        path: item.path,
        directory: Directory.Data
      });
    }

    this.recipes = [];
    this.images = [];
  }


  //Toast for User
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Your settings have been saved.',
      duration: 2000
    });
    toast.present();
  }
}
