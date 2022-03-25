/* eslint-disable max-len */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ImagesService } from 'src/app/services/images.service';
import { RecipesService } from 'src/app/services/recipes.service';
import { Ingredient } from 'src/models/Ingredient';
import { Recipe } from 'src/models/Recipe';

const IMAGE_DIR = 'stored-images';
export interface LocalFile {
  name: string;
  path: string;
  data: string;
}
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {

  id: number;
  recipes: Recipe[] = [];
  recipe: Recipe;

  newImage: Photo;
  newPhotoTaken: boolean;
  latestImg: LocalFile;
  recipeForm: FormGroup;

  routesub: Subscription;
  imagesub: Subscription;
  constructor(private route: ActivatedRoute, private router: Router, private loadinCtrl: LoadingController, private alertController: AlertController,
              private recipeService: RecipesService, private imageService: ImagesService) { }

  get controls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  ngOnInit() {
    this.recipes = this.recipeService.getRecipes();
    this.routesub = this.route.params.subscribe((params: Params) => {
      this.id = +params.id;
      if(this.id < this.recipes.length){
        this.recipe = this.recipes[this.id];
        this.imageService.loadFile(this.id);
        this.newPhotoTaken = false;
      }
      else{
        this.router.navigate(['/tabs'+'tab1']);
      }
    });

    this.initForm();

    this.imagesub = this.imageService.newLatestImg.subscribe((img) => {
      this.latestImg = img;
    });
  }

  //Form------------------------------------------------------------------------------------------------------------------------
  initForm(){
    this.recipeForm = new FormGroup({
      title: new FormControl(this.recipe.title, Validators.required),
      ingredients: new FormArray([]),
      description: new FormControl(this.recipe.description, Validators.required)
    });
    for(const item of this.recipe.ingredients){
      (this.recipeForm.get('ingredients') as FormArray).push(
        new FormGroup({
          name: new FormControl(item.name, Validators.required),
          amount: new FormControl(item.amount, [Validators.required, Validators.min(1)])
        })
      );
    }
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

  //-----------------------------------------------------------------------------------------------------------------------
  takeImage(){
    this.imageService.takeImage(this.id, false).then(result => {
      this.newImage = result;
      this.newPhotoTaken = true;
      console.log(this.newImage);
    }, async (err) => {
      console.log('err: ', err);
    });
  }


  onSubmit(){
    const ingredients: Ingredient[] = [];
    for(const item of this.recipeForm.value.ingredients){
      ingredients.push(new Ingredient(item.name, item.amount));
    }
    this.recipeService.changeRecipe(this.id, new Recipe(this.recipeForm.value.title, ingredients, this.recipeForm.value.description));

    if(this.newPhotoTaken){
      this.imageService.saveImage(this.newImage, this.id);
    }
    this.router.navigate(['/tabs/tab1']);
  }

  deleteRecipe(){
    this.presentAlertConfirm();
    /* this.recipes.splice(this.id, 1);
    localStorage.setItem('recipes', JSON.stringify(this.recipes)); */
  }


  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Löschen',
      message: 'Möchten sie das Rezept wirklich löschen?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          id: 'confirm-button',
          handler: () => {
            console.log('Confirm Okay');
            this.recipeService.deleteRecipe(this.id);
            this.router.navigate(['/tabs/tab1']);
          }
        }
      ]
    });
    await alert.present();
  }


  ngOnDestroy(): void {
      this.routesub.unsubscribe();
      this.imagesub.unsubscribe();
  }
}
