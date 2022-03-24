/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem, FileWriteResult, WriteFileResult } from '@capacitor/filesystem';
import { LoadingController, ToastController } from '@ionic/angular';
import { Ingredient } from 'src/models/Ingredient';
import { Recipe } from 'src/models/Recipe';
//import { CaptureError, CaptureImageOptions, MediaCapture, MediaFile } from '@awesome-cordova-plugins/media-capture/ngx';

const IMAGE_DIR = 'stored-images';
export interface LocalFile {
  name: string;
  path: string;
  data: string;
}



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
  constructor(private loadinCtrl: LoadingController, private toastController: ToastController) {}

  get controls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  ngOnInit(): void {
      this.recipeForm = new FormGroup({
        title: new FormControl('', Validators.required),
        ingredients: new FormArray([]),
        description: new FormControl('', Validators.required)
      });
      this.loadFiles();
      this.refreshUserData();
      this.photoTaken = false;
  }

  //Recie Form
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
    console.log(this.recipeForm);
    const ingredients: Ingredient[] = [];
    for(const item of this.recipeForm.value.ingredients){
      ingredients.push(new Ingredient(item.name, item.amount));
    }

    this.recipes.push(new Recipe(this.recipeForm.value.title, ingredients, this.recipeForm.value.description, this.images[(this.images.length-1)]));
    localStorage.setItem('recipes', JSON.stringify(this.recipes));

    this.presentToast();
    //reset
    /* this.recipeForm = new FormGroup({
      title: new FormControl('', Validators.required),
      ingredients: new FormArray([]),
      description: new FormControl('', Validators.required)
    }); */
    //(this.recipeForm.get('ingredients') as FormArray).reset();
    this.ngOnInit();
    //this.photoTaken = false;
    //this.recipeForm.reset();
  }


  //Recipes from Local Storage
  refreshUserData(){
    if(localStorage.getItem('recipes')){
      const json = JSON.parse(localStorage.getItem('recipes'));
      this.recipes = [];
      for(const item of json){
        this.recipes.push(new Recipe(item.title, item.ingredients, item.description, item.image));
      }
    }
  }


  //Image Prototype

  async loadFiles(){
    this.images = [];

    const loading = await this.loadinCtrl.create({
      message: 'Loading data...'
    });
    await loading.present();

    Filesystem.readdir({
      directory: Directory.Data,
      path: IMAGE_DIR
    }).then(result => {
      this.loadFileData(result.files);
    },async (err) => {
      console.log('err: ', err);
      await Filesystem.mkdir({
        directory: Directory.Data,
        path: IMAGE_DIR
      });
    }).then(_ => {
      loading.dismiss();
    });
  }

  async loadFileData(fileNames: string[]){
    for(const file of fileNames){
      const filePath = `${IMAGE_DIR}/${file}`;

      const readFile = await Filesystem.readFile({
        directory: Directory.Data,
        path: filePath
      });

      this.images.push({
        name: file,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`
      });
      if(this.images.length !== 0){
        this.latestImg = this.images[this.images.length-1];
      }
    }
  }

  async takeImage(){
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt
    });
    console.log(image);

    if(image){
      this.saveImage(image);
      this.photoTaken = true;
    }
  }
  async saveImage(photo: Photo){
    const fileName = /* new Date().getTime() */ (this.recipes.length+1) + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      directory: Directory.Data,
      path: `${IMAGE_DIR}/${fileName}`,
      data: photo.base64String
    });
    this.loadFiles();
  }


  //Reset the Complete App
  async reset(){
    localStorage.clear();
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
