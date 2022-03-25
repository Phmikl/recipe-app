
import { Ingredient } from './Ingredient';

export class Recipe {
    constructor(public title: string, public ingredients: Ingredient[], public description: string){}
}
